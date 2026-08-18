import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

import { randomToken } from './crypto';

/**
 * SQLite-Verbindung inkl. Schema-Migration.
 *
 * Die Datei liegt standardmaessig unter ./data/nexo.db. Dieser Ordner darf
 * nicht per HTTP ausgeliefert werden – bei Reverse-Proxy-Setups entsprechend
 * ausschliessen und in die Backup-Routine aufnehmen.
 */

declare global {
  // eslint-disable-next-line no-var
  var __nexoDb: Database.Database | undefined;
}

function open(): Database.Database {
  const configured = process.env.DATABASE_PATH || './data/nexo.db';
  const file = path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  migrate(db);
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id           TEXT PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      created_at   INTEGER NOT NULL,
      expires_at   INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      user_agent   TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

    -- Reichweitenmessung. Enthaelt bewusst keine IP-Adresse und keinen
    -- vollstaendigen User-Agent, sondern nur grob klassifizierte Merkmale.
    CREATE TABLE IF NOT EXISTS page_views (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ts            INTEGER NOT NULL,
      day           TEXT    NOT NULL,
      hour          INTEGER NOT NULL,
      path          TEXT    NOT NULL,
      referrer_host TEXT,
      utm_source    TEXT,
      visitor_hash  TEXT    NOT NULL,
      device        TEXT,
      browser       TEXT,
      os            TEXT,
      duration_ms   INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_views_day     ON page_views(day);
    CREATE INDEX IF NOT EXISTS idx_views_ts      ON page_views(ts);
    CREATE INDEX IF NOT EXISTS idx_views_path    ON page_views(path);
    CREATE INDEX IF NOT EXISTS idx_views_visitor ON page_views(visitor_hash, ts);

    -- Taeglich rotierendes Salt fuer den Besucher-Hash.
    CREATE TABLE IF NOT EXISTS daily_salts (
      day  TEXT PRIMARY KEY,
      salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at INTEGER NOT NULL,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT,
      subject    TEXT NOT NULL,
      message    TEXT NOT NULL,
      ip_hash    TEXT,
      status     TEXT NOT NULL DEFAULT 'neu',
      mail_sent  INTEGER NOT NULL DEFAULT 0,
      mail_error TEXT,
      read_at    INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at DESC);

    -- Generischer Zaehler fuer Missbrauchsschutz (Login, Formular).
    CREATE TABLE IF NOT EXISTS rate_limit_hits (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket TEXT    NOT NULL,
      ts     INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rate_bucket ON rate_limit_hits(bucket, ts);

    CREATE TABLE IF NOT EXISTS audit_log (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      ts      INTEGER NOT NULL,
      action  TEXT NOT NULL,
      detail  TEXT,
      ip_hash TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_log(ts DESC);
  `);
}

export function getDb(): Database.Database {
  if (!global.__nexoDb) global.__nexoDb = open();
  return global.__nexoDb;
}

/**
 * Liefert das Salt des laufenden Tages und legt es bei Bedarf an.
 * Salts aelter als zwei Tage werden entfernt – danach ist der Besucher-Hash
 * endgueltig nicht mehr reproduzierbar.
 */
export function getDailySalt(day: string): string {
  const db = getDb();
  const row = db.prepare('SELECT salt FROM daily_salts WHERE day = ?').get(day) as
    | { salt: string }
    | undefined;
  if (row) return row.salt;

  const salt = randomToken(32);
  db.prepare('INSERT OR IGNORE INTO daily_salts (day, salt) VALUES (?, ?)').run(day, salt);
  db.prepare("DELETE FROM daily_salts WHERE day < date(?, '-2 day')").run(day);

  const stored = db.prepare('SELECT salt FROM daily_salts WHERE day = ?').get(day) as {
    salt: string;
  };
  return stored.salt;
}

/** Entfernt abgelaufene Sessions und alte Rate-Limit-Eintraege. */
export function housekeeping(): void {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  db.prepare('DELETE FROM rate_limit_hits WHERE ts < ?').run(now - 24 * 60 * 60 * 1000);
}
