import 'server-only';

import nodemailer from 'nodemailer';

import { getSmtpSettings, isSmtpConfigured, type SmtpSettings } from './settings';

/** Versand über den im Admin hinterlegten SMTP-Server. */

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

function buildTransport(s: SmtpSettings) {
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    requireTLS: !s.secure && s.requireTls,
    auth: s.user ? { user: s.user, pass: s.password } : undefined,
    tls: s.allowInvalidCert ? { rejectUnauthorized: false } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

/** Baut eine Adresse im Format `Name <mail@example.de>`. */
function fromAddress(s: SmtpSettings): string {
  return s.fromName ? `"${s.fromName.replace(/"/g, '')}" <${s.fromEmail}>` : s.fromEmail;
}

/**
 * Prüft die Verbindung zum SMTP-Server, ohne eine Mail zu versenden.
 * Wird im Admin für den Button "Verbindung prüfen" genutzt.
 */
export async function verifySmtp(
  s: SmtpSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!s.host) return { ok: false, error: 'Es ist kein SMTP-Host hinterlegt.' };
  try {
    await buildTransport(s).verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }
}

/** Sendet eine Testmail an die konfigurierte Empfängeradresse. */
export async function sendTestMail(
  s: SmtpSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSmtpConfigured(s)) {
    return { ok: false, error: 'Host, Absender- und Empfängeradresse müssen ausgefüllt sein.' };
  }
  try {
    await buildTransport(s).sendMail({
      from: fromAddress(s),
      to: s.toEmail,
      subject: 'Testmail von der Nexo-IT-Webseite',
      text:
        'Diese Testmail wurde im Admin-Bereich der Nexo-IT-Webseite ausgelöst.\n' +
        'Wenn Sie sie erhalten, funktioniert der SMTP-Versand des Kontaktformulars.\n\n' +
        `Server: ${s.host}:${s.port} (${s.secure ? 'TLS' : s.requireTls ? 'STARTTLS' : 'unverschlüsselt'})\n` +
        `Zeitpunkt: ${new Date().toLocaleString('de-DE')}`,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }
}

/** Versendet eine Formularanfrage an das Postfach von Nexo IT. */
export async function sendContactMail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = getSmtpSettings();
  if (!isSmtpConfigured(s)) {
    return { ok: false, error: 'SMTP ist nicht konfiguriert.' };
  }

  const lines = [
    'Neue Anfrage über das Kontaktformular auf www.nexo-it.de',
    '',
    `Name:     ${payload.name}`,
    `E-Mail:   ${payload.email}`,
    `Telefon:  ${payload.phone || '–'}`,
    `Betreff:  ${payload.subject}`,
    '',
    'Nachricht:',
    payload.message,
    '',
    '--',
    `Eingegangen am ${new Date().toLocaleString('de-DE')}`,
  ];

  try {
    await buildTransport(s).sendMail({
      from: fromAddress(s),
      to: s.toEmail,
      replyTo: s.replyToSender ? `"${payload.name.replace(/"/g, '')}" <${payload.email}>` : undefined,
      subject: `Kontaktanfrage: ${payload.subject}`,
      text: lines.join('\n'),
    });
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }

  if (s.autoReply) {
    // Eine fehlgeschlagene Eingangsbestätigung darf die Anfrage nicht
    // scheitern lassen – die Nachricht ist ja bereits zugestellt.
    try {
      await buildTransport(s).sendMail({
        from: fromAddress(s),
        to: payload.email,
        subject: s.autoReplySubject,
        text: s.autoReplyBody
          .replaceAll('{{name}}', payload.name)
          .replaceAll('{{betreff}}', payload.subject)
          .replaceAll('{{message}}', payload.message),
      });
    } catch {
      /* bewusst ignoriert */
    }
  }

  return { ok: true };
}

/** Übersetzt typische SMTP-Fehler in eine verständliche Meldung. */
function describeError(err: unknown): string {
  const e = err as { code?: string; responseCode?: number; message?: string };
  const code = e?.code ?? '';

  if (code === 'EAUTH' || e?.responseCode === 535) {
    return 'Anmeldung am SMTP-Server fehlgeschlagen – Benutzername oder Passwort stimmen nicht.';
  }
  if (code === 'ECONNREFUSED') return 'Verbindung abgelehnt – Host oder Port prüfen.';
  if (code === 'ETIMEDOUT' || code === 'ESOCKET') {
    return 'Zeitüberschreitung beim Verbindungsaufbau – Host, Port und Firewall prüfen.';
  }
  if (code === 'EDNS' || code === 'ENOTFOUND') return 'Der SMTP-Host ist per DNS nicht auflösbar.';
  if (code === 'ESOCKET' || /self.signed|certificate/i.test(e?.message ?? '')) {
    return 'TLS-Zertifikat konnte nicht geprüft werden. Verschlüsselungseinstellung prüfen.';
  }
  return e?.message ? `SMTP-Fehler: ${e.message}` : 'Unbekannter SMTP-Fehler.';
}
