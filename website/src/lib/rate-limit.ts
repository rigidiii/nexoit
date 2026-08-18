import 'server-only';

import { getDb } from './db';

/**
 * Einfacher, datenbankgestützter Zähler gegen Missbrauch (Login-Brute-Force,
 * Formular-Spam). Bewusst ohne Redis – bei den erwarteten Zugriffszahlen einer
 * Firmenwebseite reicht SQLite vollkommen aus.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Sekunden bis der älteste Treffer aus dem Fenster fällt. */
  retryAfter: number;
}

export function checkRateLimit(
  bucket: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const db = getDb();
  const now = Date.now();
  const since = now - windowMs;

  db.prepare('DELETE FROM rate_limit_hits WHERE bucket = ? AND ts < ?').run(bucket, since);

  const { count } = db
    .prepare('SELECT COUNT(*) AS count FROM rate_limit_hits WHERE bucket = ?')
    .get(bucket) as { count: number };

  if (count >= limit) {
    const oldest = db
      .prepare('SELECT MIN(ts) AS ts FROM rate_limit_hits WHERE bucket = ?')
      .get(bucket) as { ts: number | null };
    const retryAfter = oldest.ts ? Math.ceil((oldest.ts + windowMs - now) / 1000) : 60;
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  return { allowed: true, remaining: limit - count, retryAfter: 0 };
}

/** Zählt einen Versuch. Getrennt von der Prüfung, damit z. B. erfolgreiche
 *  Logins nicht auf das Limit einzahlen müssen. */
export function recordRateLimitHit(bucket: string): void {
  getDb()
    .prepare('INSERT INTO rate_limit_hits (bucket, ts) VALUES (?, ?)')
    .run(bucket, Date.now());
}

/** Setzt einen Zähler zurück (z. B. nach erfolgreichem Login). */
export function clearRateLimit(bucket: string): void {
  getDb().prepare('DELETE FROM rate_limit_hits WHERE bucket = ?').run(bucket);
}
