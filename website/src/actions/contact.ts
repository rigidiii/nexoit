'use server';

import { headers } from 'next/headers';

import { getDb } from '@/lib/db';
import { sign, timingSafeEqual } from '@/lib/crypto';
import { sendContactMail } from '@/lib/mailer';
import { checkRateLimit, recordRateLimitHit } from '@/lib/rate-limit';
import { ipHash } from '@/lib/request';
import { CONTACT_SUBJECTS } from '@/content/contact-subjects';
import type { ContactState } from '@/lib/contact-state';

/**
 * Verarbeitung des Kontaktformulars.
 *
 * Spam-Schutz ohne externe Dienste (bewusst kein reCAPTCHA – das würde eine
 * Übermittlung an Google auslösen und damit einwilligungspflichtig werden):
 *   1. Honeypot-Feld, das nur Bots ausfüllen
 *   2. signierter Zeitstempel, der zu schnelles Absenden erkennt
 *   3. Rate-Limit pro IP-Hash
 *
 * CSRF-Schutz übernimmt Next.js für Server Actions über den Origin-Abgleich.
 */

/** Mindestzeit zwischen Seitenaufbau und Absenden. */
const MIN_FILL_MS = 3_000;
/** Formular-Token nach zwei Stunden ungültig. */
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;

/** Steuerzeichen ohne Zeilenumbrüche. */
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const LINE_BREAKS = /[\r\n]+/g;

const EMAIL_RE = /^[^\s@,;:<>"']+@[^\s@.,;:<>"']+(\.[^\s@.,;:<>"']+)+$/;

/** Gegenstück zu /api/form-token: prüft Signatur und Alter des Tokens. */
function verifyFormToken(token: string): boolean {
  const [ts, signature] = token.split('.');
  if (!ts || !signature) return false;
  if (!timingSafeEqual(signature, sign(ts, 'contact-form'))) return false;

  const age = Date.now() - parseInt(ts, 36);
  return age >= MIN_FILL_MS && age <= MAX_FORM_AGE_MS;
}

/**
 * Entfernt Steuerzeichen und kürzt auf die erlaubte Länge.
 * Einzeilige Felder verlieren zusätzlich Zeilenumbrüche – sonst ließen sich
 * über Name oder Betreff zusätzliche Mail-Header einschleusen.
 */
function clean(value: FormDataEntryValue | null, max: number, multiline = false): string {
  let text = String(value ?? '').replace(CONTROL_CHARS, '');
  if (!multiline) text = text.replace(LINE_BREAKS, ' ');
  return text.trim().slice(0, max);
}

function fail(message: string, fieldErrors: Record<string, string> = {}): ContactState {
  return { status: 'error', message, fieldErrors, nonce: Date.now() };
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const headerList = await headers();
  const hash = ipHash(new Request('https://nexo-it.de', { headers: headerList }));

  // 1. Honeypot – ein für Menschen unsichtbares Feld wurde ausgefüllt.
  if (clean(formData.get('website'), 100)) {
    // Bots erhalten bewusst eine Erfolgsmeldung, damit sie nicht nachjustieren.
    return {
      status: 'ok',
      message: 'Vielen Dank für Ihre Nachricht.',
      fieldErrors: {},
      nonce: Date.now(),
    };
  }

  // 2. Zeitstempel prüfen.
  if (!verifyFormToken(clean(formData.get('formToken'), 200))) {
    return fail(
      'Das Formular ist abgelaufen oder wurde zu schnell abgeschickt. Bitte laden Sie die Seite neu und versuchen es erneut.',
    );
  }

  // 3. Rate-Limit: fünf Anfragen pro Stunde und Anschluss.
  if (!checkRateLimit(`contact:${hash}`, 5, 60 * 60 * 1000).allowed) {
    return fail(
      'Von diesem Anschluss wurden bereits mehrere Anfragen gesendet. Bitte versuchen Sie es später erneut oder rufen Sie uns an.',
    );
  }

  const name = clean(formData.get('name'), 100);
  const email = clean(formData.get('email'), 200);
  const phone = clean(formData.get('phone'), 60);
  const subjectInput = clean(formData.get('subject'), 100);
  const message = clean(formData.get('message'), 5000, true);
  const consent = formData.get('consent') === 'on';

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.';
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (message.length < 10) {
    fieldErrors.message = 'Bitte beschreiben Sie Ihr Anliegen (mindestens 10 Zeichen).';
  }
  if (!consent) fieldErrors.consent = 'Ohne Einwilligung können wir die Anfrage nicht verarbeiten.';

  if (Object.keys(fieldErrors).length > 0) {
    return fail('Bitte prüfen Sie die markierten Felder.', fieldErrors);
  }

  const subject = (CONTACT_SUBJECTS as readonly string[]).includes(subjectInput)
    ? subjectInput
    : 'Allgemeine Anfrage';

  recordRateLimitHit(`contact:${hash}`);

  // Erst speichern, dann versenden: so geht keine Anfrage verloren, auch wenn
  // der Mailserver gerade nicht erreichbar ist.
  const insert = getDb()
    .prepare(
      `INSERT INTO contact_messages (created_at, name, email, phone, subject, message, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(Date.now(), name, email, phone, subject, message, hash);
  const messageId = Number(insert.lastInsertRowid);

  const sent = await sendContactMail({ name, email, phone, subject, message });

  getDb()
    .prepare('UPDATE contact_messages SET mail_sent = ?, mail_error = ? WHERE id = ?')
    .run(sent.ok ? 1 : 0, sent.ok ? null : sent.error, messageId);

  if (!sent.ok) {
    // Die Anfrage liegt im Postfach des Admin-Bereichs. Trotzdem ehrlich
    // sagen, dass der Mailversand nicht funktioniert hat.
    return fail(
      'Ihre Nachricht konnte nicht per E-Mail zugestellt werden. Bitte kontaktieren Sie uns direkt unter 0151 / 412 899 74 oder info@nexo-it.de.',
    );
  }

  return {
    status: 'ok',
    message:
      'Vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und melden uns in der Regel innerhalb eines Werktages.',
    fieldErrors: {},
    nonce: Date.now(),
  };
}
