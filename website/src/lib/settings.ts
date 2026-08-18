import 'server-only';

import { getDb } from './db';
import { decryptSecret, encryptSecret } from './crypto';

/** Frei konfigurierbare Werte, die im Admin gepflegt werden. */

export interface SmtpSettings {
  host: string;
  port: number;
  /** true = implizites TLS (Port 465), false = STARTTLS/unverschlüsselt (587/25) */
  secure: boolean;
  /** STARTTLS erzwingen, wenn `secure` aus ist. */
  requireTls: boolean;
  user: string;
  /** Wird verschlüsselt gespeichert und nie an den Browser gesendet. */
  password: string;
  fromName: string;
  fromEmail: string;
  /** Empfänger der Formularanfragen. */
  toEmail: string;
  /** Reply-To auf die Adresse des Absenders setzen. */
  replyToSender: boolean;
  /** Automatische Eingangsbestätigung an den Absender senden. */
  autoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
  /** Zertifikatsprüfung abschalten – nur für Testsysteme. */
  allowInvalidCert: boolean;
}

export const SMTP_DEFAULTS: SmtpSettings = {
  host: '',
  port: 587,
  secure: false,
  requireTls: true,
  user: '',
  password: '',
  fromName: 'Nexo IT Webseite',
  fromEmail: '',
  toEmail: 'info@nexo-it.de',
  replyToSender: true,
  autoReply: true,
  autoReplySubject: 'Ihre Anfrage bei Nexo IT',
  autoReplyBody:
    'Guten Tag {{name}},\n\nvielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb eines Werktages bei Ihnen.\n\nIhre Nachricht:\n{{message}}\n\nMit freundlichen Grüßen\nIhr Team von Nexo IT\n\n--\nNexo IT · www.nexo-it.de · info@nexo-it.de\nTelefon 0151 / 412 899 74',
  allowInvalidCert: false,
};

export interface PrivacySettings {
  /** Aufbewahrungsdauer der Statistikdaten in Tagen (0 = unbegrenzt). */
  retentionDays: number;
  /** Do-Not-Track / Global Privacy Control respektieren. */
  respectDnt: boolean;
  /** Reichweitenmessung insgesamt aktiv. */
  analyticsEnabled: boolean;
}

export const PRIVACY_DEFAULTS: PrivacySettings = {
  retentionDays: 180,
  respectDnt: true,
  analyticsEnabled: true,
};

const SMTP_KEY = 'smtp';
const PRIVACY_KEY = 'privacy';

function readRaw(key: string): Record<string, unknown> | null {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown): void {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, JSON.stringify(value), new Date().toISOString());
}

/** SMTP-Konfiguration inkl. entschlüsseltem Passwort. Nur serverseitig verwenden. */
export function getSmtpSettings(): SmtpSettings {
  const raw = readRaw(SMTP_KEY);
  if (!raw) return { ...SMTP_DEFAULTS };
  const merged = { ...SMTP_DEFAULTS, ...raw } as SmtpSettings & { password: string };
  merged.password = decryptSecret(String(raw.password ?? ''));
  return merged;
}

/**
 * Speichert die SMTP-Konfiguration. Ein leeres Passwort lässt das bereits
 * gespeicherte unverändert – so muss es beim Bearbeiten nicht neu eingegeben
 * werden.
 */
export function saveSmtpSettings(input: SmtpSettings): void {
  const current = readRaw(SMTP_KEY);
  const encrypted = input.password
    ? encryptSecret(input.password)
    : String(current?.password ?? '');
  writeRaw(SMTP_KEY, { ...input, password: encrypted });
}

/** Prüft, ob genug konfiguriert ist, um überhaupt versenden zu können. */
export function isSmtpConfigured(s: SmtpSettings = getSmtpSettings()): boolean {
  return Boolean(s.host && s.port && s.fromEmail && s.toEmail);
}

export function getPrivacySettings(): PrivacySettings {
  return { ...PRIVACY_DEFAULTS, ...(readRaw(PRIVACY_KEY) ?? {}) } as PrivacySettings;
}

export function savePrivacySettings(input: PrivacySettings): void {
  writeRaw(PRIVACY_KEY, input);
}
