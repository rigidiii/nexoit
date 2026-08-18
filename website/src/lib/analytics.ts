import 'server-only';

import { getDb } from './db';
import { getPrivacySettings } from './settings';
import { localDay } from './request';

/**
 * Cookielose Reichweitenmessung.
 *
 * Gespeichert wird pro Seitenaufruf: Zeitpunkt, Pfad, Referrer-Host,
 * Gerätekategorie, Browser, Betriebssystem und ein tagesbezogener,
 * nicht umkehrbarer Besucher-Hash. Es werden keine IP-Adressen, keine
 * vollständigen User-Agents und keine Cookies gespeichert.
 */

/** Ein Besuch gilt nach 30 Minuten ohne Aufruf als beendet. */
const SESSION_GAP_MS = 30 * 60 * 1000;

export interface PageViewInput {
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  visitorHash: string;
  device: string;
  browser: string;
  os: string;
}

export function recordPageView(input: PageViewInput): number {
  const now = new Date();
  const result = getDb()
    .prepare(
      `INSERT INTO page_views
         (ts, day, hour, path, referrer_host, utm_source, visitor_hash, device, browser, os)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      now.getTime(),
      localDay(now),
      now.getHours(),
      input.path,
      input.referrerHost,
      input.utmSource,
      input.visitorHash,
      input.device,
      input.browser,
      input.os,
    );
  return Number(result.lastInsertRowid);
}

/** Trägt die Verweildauer nach, sobald der Besucher die Seite verlässt. */
export function recordDuration(id: number, durationMs: number): void {
  if (!Number.isFinite(id) || id <= 0) return;
  const capped = Math.min(Math.max(Math.round(durationMs), 0), 30 * 60 * 1000);
  getDb()
    .prepare('UPDATE page_views SET duration_ms = ? WHERE id = ? AND duration_ms IS NULL')
    .run(capped, id);
}

/** Löscht Statistikdaten, die älter sind als die konfigurierte Aufbewahrungsfrist. */
export function applyRetention(): number {
  const { retentionDays } = getPrivacySettings();
  if (!retentionDays || retentionDays <= 0) return 0;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return getDb().prepare('DELETE FROM page_views WHERE ts < ?').run(cutoff).changes;
}

// ---------------------------------------------------------------------------
// Auswertung
// ---------------------------------------------------------------------------

export interface Totals {
  views: number;
  visitors: number;
  sessions: number;
  bounceRate: number;
  avgDurationSec: number;
}

export interface SeriesPoint {
  day: string;
  views: number;
  visitors: number;
}

export interface Breakdown {
  label: string;
  count: number;
  share: number;
}

export interface StatsReport {
  from: string;
  to: string;
  totals: Totals;
  previousTotals: Totals;
  series: SeriesPoint[];
  hours: { hour: number; views: number }[];
  pages: Breakdown[];
  referrers: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  systems: Breakdown[];
  live: number;
  storedRows: number;
  firstDay: string | null;
}

function toBreakdown(
  rows: { label: string | null; count: number }[],
  fallback = 'Unbekannt',
): Breakdown[] {
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return rows.map((r) => ({
    label: r.label || fallback,
    count: r.count,
    share: r.count / total,
  }));
}

function totalsFor(from: string, to: string): Totals {
  const db = getDb();

  const base = db
    .prepare(
      `SELECT COUNT(*) AS views,
              COUNT(DISTINCT visitor_hash) AS visitors,
              AVG(duration_ms) AS avg_duration
         FROM page_views
        WHERE day BETWEEN ? AND ?`,
    )
    .get(from, to) as { views: number; visitors: number; avg_duration: number | null };

  // Besuche über die Lücken-Regel bilden: ein neuer Besuch beginnt, wenn
  // zwischen zwei Aufrufen desselben Besuchers mehr als SESSION_GAP_MS liegen.
  const sessionRow = db
    .prepare(
      `WITH marked AS (
         SELECT visitor_hash, ts,
                CASE WHEN LAG(ts) OVER w IS NULL OR ts - LAG(ts) OVER w > ?
                     THEN 1 ELSE 0 END AS is_start
           FROM page_views
          WHERE day BETWEEN ? AND ?
         WINDOW w AS (PARTITION BY visitor_hash ORDER BY ts)
       ),
       numbered AS (
         SELECT visitor_hash, SUM(is_start) OVER (PARTITION BY visitor_hash ORDER BY ts) AS sid
           FROM marked
       ),
       grouped AS (
         SELECT visitor_hash, sid, COUNT(*) AS hits FROM numbered GROUP BY visitor_hash, sid
       )
       SELECT COUNT(*) AS sessions,
              SUM(CASE WHEN hits = 1 THEN 1 ELSE 0 END) AS bounces
         FROM grouped`,
    )
    .get(SESSION_GAP_MS, from, to) as { sessions: number; bounces: number | null };

  const sessions = sessionRow.sessions ?? 0;
  return {
    views: base.views ?? 0,
    visitors: base.visitors ?? 0,
    sessions,
    bounceRate: sessions > 0 ? (sessionRow.bounces ?? 0) / sessions : 0,
    avgDurationSec: base.avg_duration ? Math.round(base.avg_duration / 1000) : 0,
  };
}

function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return localDay(d);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000) + 1;
}

/** Baut den kompletten Datensatz für das Statistik-Dashboard. */
export function getStats(from: string, to: string): StatsReport {
  const db = getDb();
  const span = daysBetween(from, to);
  const prevTo = shiftDay(from, -1);
  const prevFrom = shiftDay(prevTo, -(span - 1));

  const rawSeries = db
    .prepare(
      `SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors
         FROM page_views
        WHERE day BETWEEN ? AND ?
        GROUP BY day`,
    )
    .all(from, to) as SeriesPoint[];

  // Tage ohne Aufrufe auffüllen, damit die Zeitreihe keine Lücken hat.
  const byDay = new Map(rawSeries.map((r) => [r.day, r]));
  const series: SeriesPoint[] = [];
  for (let i = 0; i < span; i++) {
    const day = shiftDay(from, i);
    series.push(byDay.get(day) ?? { day, views: 0, visitors: 0 });
  }

  const hoursRaw = db
    .prepare(
      `SELECT hour, COUNT(*) AS views FROM page_views
        WHERE day BETWEEN ? AND ? GROUP BY hour`,
    )
    .all(from, to) as { hour: number; views: number }[];
  const hourMap = new Map(hoursRaw.map((h) => [h.hour, h.views]));
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: hourMap.get(h) ?? 0 }));

  const topQuery = (column: string, limit: number) =>
    db
      .prepare(
        `SELECT ${column} AS label, COUNT(*) AS count
           FROM page_views
          WHERE day BETWEEN ? AND ?
          GROUP BY ${column}
          ORDER BY count DESC
          LIMIT ?`,
      )
      .all(from, to, limit) as { label: string | null; count: number }[];

  const live = (
    db
      .prepare(
        'SELECT COUNT(DISTINCT visitor_hash) AS n FROM page_views WHERE ts > ?',
      )
      .get(Date.now() - SESSION_GAP_MS) as { n: number }
  ).n;

  const storedRows = (
    db.prepare('SELECT COUNT(*) AS n FROM page_views').get() as { n: number }
  ).n;

  const firstDay =
    (db.prepare('SELECT MIN(day) AS d FROM page_views').get() as { d: string | null }).d ?? null;

  return {
    from,
    to,
    totals: totalsFor(from, to),
    previousTotals: totalsFor(prevFrom, prevTo),
    series,
    hours,
    pages: toBreakdown(topQuery('path', 12)),
    // Ohne Referrer-Host handelt es sich um Direktaufrufe: Lesezeichen,
    // eingetippte Adresse, Link aus einer E-Mail oder unterdrueckter Referrer.
    referrers: toBreakdown(topQuery('referrer_host', 10), 'Direktaufruf / Lesezeichen'),
    devices: toBreakdown(topQuery('device', 5)),
    browsers: toBreakdown(topQuery('browser', 8)),
    systems: toBreakdown(topQuery('os', 8)),
    live,
    storedRows,
    firstDay,
  };
}

/** Löscht sämtliche Statistikdaten (Button im Admin). */
export function purgeStats(): number {
  const db = getDb();
  const removed = db.prepare('DELETE FROM page_views').run().changes;
  db.prepare('DELETE FROM daily_salts').run();
  return removed;
}
