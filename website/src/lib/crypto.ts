import 'server-only';

import crypto from 'node:crypto';

/**
 * Kryptografische Helfer.
 *
 * - `encryptSecret` / `decryptSecret` sichern Geheimnisse (aktuell das
 *   SMTP-Passwort) in der Datenbank mit AES-256-GCM ab. Ohne APP_SECRET ist
 *   ein Datenbank-Dump damit wertlos.
 * - `hashIdentifier` erzeugt einen nicht umkehrbaren Besucher-Hash. Das Salt
 *   rotiert taeglich, dadurch laesst sich derselbe Besucher ueber Tagesgrenzen
 *   hinweg nicht wiedererkennen (Anforderung an anonyme Reichweitenmessung).
 */

const SECRET = process.env.APP_SECRET ?? '';

if (process.env.NODE_ENV === 'production' && SECRET.length < 32) {
  throw new Error(
    'APP_SECRET fehlt oder ist zu kurz (mindestens 32 Zeichen). Siehe .env.example.',
  );
}

/** Leitet einen 32-Byte-Schluessel fuer einen bestimmten Zweck aus APP_SECRET ab. */
function keyFor(purpose: string): Buffer {
  return crypto.hkdfSync(
    'sha256',
    Buffer.from(SECRET || 'entwicklungs-fallback-nicht-fuer-produktion'),
    Buffer.from('nexo-it-website'),
    Buffer.from(purpose),
    32,
  ) as unknown as Buffer;
}

const ENC_PREFIX = 'v1.';

/** Verschluesselt einen String. Rueckgabeformat: `v1.<iv>.<tag>.<ciphertext>` (base64url). */
export function encryptSecret(plain: string): string {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFor('settings-encryption'), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENC_PREFIX.slice(0, -1),
    iv.toString('base64url'),
    tag.toString('base64url'),
    enc.toString('base64url'),
  ].join('.');
}

/** Gegenstueck zu `encryptSecret`. Liefert '' wenn der Wert nicht entschluesselbar ist. */
export function decryptSecret(stored: string): string {
  if (!stored) return '';
  if (!stored.startsWith(ENC_PREFIX)) return '';
  const [, ivB64, tagB64, dataB64] = stored.split('.');
  if (!ivB64 || !tagB64 || !dataB64) return '';
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      keyFor('settings-encryption'),
      Buffer.from(ivB64, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    // Falscher/geaenderter APP_SECRET oder manipulierter Datensatz.
    return '';
  }
}

/**
 * Einweg-Hash eines Identifikators (IP + User-Agent) mit tagesaktuellem Salt.
 * Ergebnis ist auf 22 Zeichen gekuerzt – ausreichend kollisionsarm fuer die
 * Reichweitenmessung, aber kein vollstaendiger Hash.
 */
export function hashIdentifier(value: string, dailySalt: string): string {
  return crypto
    .createHmac('sha256', dailySalt)
    .update(value)
    .digest('base64url')
    .slice(0, 22);
}

/** Kryptografisch sicheres Token (z. B. Session-ID). */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Signiert einen Wert (CSRF-Token) mit einem zweckgebundenen Schluessel. */
export function sign(value: string, purpose: string): string {
  return crypto.createHmac('sha256', keyFor(purpose)).update(value).digest('base64url');
}

/** Vergleicht zwei Strings ohne Laufzeit-Seitenkanal. */
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
