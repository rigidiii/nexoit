'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import {
  changePassword,
  createSession,
  destroySession,
  ensureAdminUser,
  getCurrentUser,
  logAudit,
  verifyCredentials,
} from '@/lib/auth';
import { getDb } from '@/lib/db';
import { purgeStats, applyRetention } from '@/lib/analytics';
import { sendTestMail, verifySmtp } from '@/lib/mailer';
import { checkRateLimit, clearRateLimit, recordRateLimitHit } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import {
  getSmtpSettings,
  savePrivacySettings,
  saveSmtpSettings,
  type SmtpSettings,
} from '@/lib/settings';
import type { AdminActionState } from '@/lib/admin-state';

/** Server-Aktionen des Verwaltungsbereichs. */

async function currentIpHash(): Promise<string> {
  const headerList = await headers();
  return ipHash(new Request('http://localhost', { headers: headerList }));
}

function ok(message: string): AdminActionState {
  return { status: 'ok', message, nonce: Date.now() };
}
function err(message: string): AdminActionState {
  return { status: 'error', message, nonce: Date.now() };
}

/** Stellt sicher, dass die Aktion nur angemeldet ausgeführt wird. */
async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  return user;
}

// ---------------------------------------------------------------------------
// Anmeldung
// ---------------------------------------------------------------------------

export async function loginAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await ensureAdminUser();

  const hash = await currentIpHash();
  const bucket = `login:${hash}`;

  // Zehn Fehlversuche pro Viertelstunde und Anschluss.
  const limit = checkRateLimit(bucket, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return err(
      `Zu viele Fehlversuche. Bitte in ${Math.ceil(limit.retryAfter / 60)} Minuten erneut versuchen.`,
    );
  }

  const username = String(formData.get('username') ?? '').trim().slice(0, 100);
  const password = String(formData.get('password') ?? '').slice(0, 200);

  const user = await verifyCredentials(username, password);
  if (!user) {
    recordRateLimitHit(bucket);
    logAudit('login.failed', username || '(leer)', hash);
    return err('Benutzername oder Passwort ist nicht korrekt.');
  }

  clearRateLimit(bucket);
  const headerList = await headers();
  await createSession(user.id, headerList.get('user-agent'));
  logAudit('login.success', user.username, hash);

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// SMTP
// ---------------------------------------------------------------------------

/** Liest die SMTP-Felder aus dem Formular. */
function readSmtpForm(formData: FormData): SmtpSettings {
  const str = (key: string, max = 300) => String(formData.get(key) ?? '').trim().slice(0, max);
  const bool = (key: string) => formData.get(key) === 'on';

  const port = Number.parseInt(str('port'), 10);

  return {
    host: str('host', 253),
    port: Number.isFinite(port) && port > 0 && port < 65536 ? port : 587,
    secure: str('encryption') === 'tls',
    requireTls: str('encryption') === 'starttls',
    user: str('user', 200),
    password: String(formData.get('password') ?? '').slice(0, 300),
    fromName: str('fromName', 100),
    fromEmail: str('fromEmail', 200),
    toEmail: str('toEmail', 200),
    replyToSender: bool('replyToSender'),
    autoReply: bool('autoReply'),
    autoReplySubject: str('autoReplySubject', 200),
    autoReplyBody: String(formData.get('autoReplyBody') ?? '').slice(0, 4000),
    allowInvalidCert: bool('allowInvalidCert'),
  };
}

/**
 * Ein Formular, drei Schaltflächen: Speichern, Verbindung prüfen, Testmail.
 * Die Absicht kommt über das Feld `intent` – so bleibt eine einzige Aktion
 * für `useActionState` zuständig und alle Rückmeldungen landen an derselben
 * Stelle.
 */
export async function smtpAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireUser();
  const intent = String(formData.get('intent') ?? 'save');
  const input = readSmtpForm(formData);
  // Leeres Passwortfeld bedeutet: gespeichertes Passwort weiterverwenden.
  if (!input.password) input.password = getSmtpSettings().password;

  if (intent === 'verify') {
    const result = await verifySmtp(input);
    return result.ok
      ? ok('Verbindung zum SMTP-Server hergestellt und Anmeldung erfolgreich.')
      : err(result.error);
  }

  if (intent === 'test') {
    const result = await sendTestMail(input);
    logAudit(
      result.ok ? 'smtp.test.ok' : 'smtp.test.failed',
      `${input.toEmail} von ${user.username}`,
      await currentIpHash(),
    );
    return result.ok
      ? ok(`Testmail an ${input.toEmail} wurde versendet. Bitte das Postfach prüfen.`)
      : err(result.error);
  }

  if (!input.host) return err('Bitte tragen Sie einen SMTP-Host ein.');
  if (!input.fromEmail) return err('Bitte tragen Sie eine Absenderadresse ein.');
  if (!input.toEmail) return err('Bitte tragen Sie eine Empfängeradresse ein.');

  saveSmtpSettings(input);
  logAudit('smtp.saved', `${input.host}:${input.port} von ${user.username}`, await currentIpHash());
  revalidatePath('/admin/smtp');
  revalidatePath('/admin');

  return ok('Die SMTP-Einstellungen wurden gespeichert.');
}

// ---------------------------------------------------------------------------
// Nachrichten
// ---------------------------------------------------------------------------

export async function markMessageAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = Number(formData.get('id'));
  const status = String(formData.get('status') ?? 'gelesen');
  if (!Number.isFinite(id)) return;

  getDb()
    .prepare('UPDATE contact_messages SET status = ?, read_at = COALESCE(read_at, ?) WHERE id = ?')
    .run(['neu', 'gelesen', 'erledigt'].includes(status) ? status : 'gelesen', Date.now(), id);

  revalidatePath('/admin/nachrichten');
  revalidatePath('/admin');
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id)) return;

  getDb().prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
  logAudit('message.deleted', `#${id} von ${user.username}`, await currentIpHash());

  revalidatePath('/admin/nachrichten');
  revalidatePath('/admin');
}

// ---------------------------------------------------------------------------
// Einstellungen
// ---------------------------------------------------------------------------

export async function savePrivacyAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireUser();

  const days = Number.parseInt(String(formData.get('retentionDays') ?? ''), 10);
  savePrivacySettings({
    retentionDays: Number.isFinite(days) && days >= 0 ? Math.min(days, 3650) : 180,
    respectDnt: formData.get('respectDnt') === 'on',
    analyticsEnabled: formData.get('analyticsEnabled') === 'on',
  });

  const removed = applyRetention();
  logAudit('privacy.saved', `von ${user.username}`, await currentIpHash());
  revalidatePath('/admin/einstellungen');

  return ok(
    removed > 0
      ? `Einstellungen gespeichert. ${removed.toLocaleString('de-DE')} Datensätze außerhalb der Aufbewahrungsfrist wurden gelöscht.`
      : 'Einstellungen gespeichert.',
  );
}

export async function changePasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireUser();

  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');
  const repeat = String(formData.get('repeatPassword') ?? '');

  if (next !== repeat) return err('Die beiden neuen Passwörter stimmen nicht überein.');

  const result = await changePassword(user.id, current, next);
  if (!result.ok) return err(result.error);

  logAudit('password.changed', user.username, await currentIpHash());
  return ok('Das Passwort wurde geändert. Alle anderen Sitzungen wurden abgemeldet.');
}

export async function purgeStatsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await requireUser();

  if (String(formData.get('confirm') ?? '').trim().toUpperCase() !== 'LOESCHEN') {
    return err('Zur Bestätigung bitte das Wort LOESCHEN eintragen.');
  }

  const removed = purgeStats();
  logAudit('stats.purged', `${removed} Datensätze von ${user.username}`, await currentIpHash());
  revalidatePath('/admin');

  return ok(`${removed.toLocaleString('de-DE')} Statistik-Datensätze wurden gelöscht.`);
}
