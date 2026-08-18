import 'server-only';

import { cookies } from 'next/headers';
import { compare, hash } from 'bcryptjs';

import { getDb, housekeeping } from './db';
import { randomToken } from './crypto';

/**
 * Authentifizierung für den Admin-Bereich.
 *
 * Ein Admin-Konto, Passwort als bcrypt-Hash in der Datenbank, Session über ein
 * httpOnly-Cookie. Das Cookie ist technisch notwendig (§ 25 Abs. 2 Nr. 2 TDDDG)
 * und daher nicht einwilligungspflichtig.
 */

export const SESSION_COOKIE = 'nexo_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 Stunden
const BCRYPT_ROUNDS = 12;

export interface AdminUser {
  id: number;
  username: string;
  lastLoginAt: string | null;
}

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  last_login_at: string | null;
}

/**
 * Legt beim ersten Start den Admin aus den Umgebungsvariablen an.
 * Existiert bereits ein Konto, passiert nichts – das im Admin geänderte
 * Passwort wird also nie durch die .env überschrieben.
 */
export async function ensureAdminUser(): Promise<void> {
  const db = getDb();
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get() as {
    count: number;
  };
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      'ADMIN_INITIAL_PASSWORD fehlt oder ist kürzer als 12 Zeichen. Siehe .env.example.',
    );
  }

  db.prepare(
    'INSERT INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)',
  ).run(username, await hash(password, BCRYPT_ROUNDS), new Date().toISOString());
}

/** Prüft die Zugangsdaten. Liefert `null`, wenn sie nicht stimmen. */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const row = getDb()
    .prepare('SELECT id, username, password_hash, last_login_at FROM admin_users WHERE username = ?')
    .get(username) as UserRow | undefined;

  // Auch ohne Treffer einen Hash prüfen, damit die Antwortzeit nicht verrät,
  // ob der Benutzername existiert.
  const stored = row?.password_hash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const ok = await compare(password, stored);
  if (!row || !ok) return null;

  return { id: row.id, username: row.username, lastLoginAt: row.last_login_at };
}

/** Erzeugt eine Session und setzt das Cookie. */
export async function createSession(userId: number, userAgent: string | null): Promise<void> {
  const db = getDb();
  const id = randomToken(32);
  const now = Date.now();

  db.prepare(
    `INSERT INTO sessions (id, user_id, created_at, expires_at, last_seen_at, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(id, userId, now, now + SESSION_TTL_MS, now, userAgent?.slice(0, 200) ?? null);

  db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    userId,
  );

  (await cookies()).set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });

  housekeeping();
}

/** Liest die aktuelle Session und verlängert sie gleitend. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return null;

  const db = getDb();
  const row = db
    .prepare(
      `SELECT s.expires_at AS expires_at, u.id AS id, u.username AS username,
              u.last_login_at AS last_login_at
         FROM sessions s
         JOIN admin_users u ON u.id = s.user_id
        WHERE s.id = ?`,
    )
    .get(id) as (UserRow & { expires_at: number }) | undefined;

  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    return null;
  }

  const now = Date.now();
  db.prepare('UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?').run(
    now,
    now + SESSION_TTL_MS,
    id,
  );

  return { id: row.id, username: row.username, lastLoginAt: row.last_login_at };
}

/** Beendet die Session serverseitig und löscht das Cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
  jar.delete(SESSION_COOKIE);
}

/** Ändert das Passwort und meldet alle anderen Sessions ab. */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const row = db
    .prepare('SELECT id, username, password_hash, last_login_at FROM admin_users WHERE id = ?')
    .get(userId) as UserRow | undefined;
  if (!row) return { ok: false, error: 'Benutzer nicht gefunden.' };

  if (!(await compare(currentPassword, row.password_hash))) {
    return { ok: false, error: 'Das aktuelle Passwort ist nicht korrekt.' };
  }
  if (newPassword.length < 12) {
    return { ok: false, error: 'Das neue Passwort muss mindestens 12 Zeichen lang sein.' };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: 'Das neue Passwort muss sich vom bisherigen unterscheiden.' };
  }

  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(
    await hash(newPassword, BCRYPT_ROUNDS),
    userId,
  );

  const jar = await cookies();
  const currentSession = jar.get(SESSION_COOKIE)?.value ?? '';
  db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(userId, currentSession);

  return { ok: true };
}

/** Schreibt einen Eintrag ins Protokoll sicherheitsrelevanter Aktionen. */
export function logAudit(action: string, detail: string | null, ipHash: string | null): void {
  getDb()
    .prepare('INSERT INTO audit_log (ts, action, detail, ip_hash) VALUES (?, ?, ?, ?)')
    .run(Date.now(), action, detail, ipHash);
}
