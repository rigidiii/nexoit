/**
 * Erzeugt Beispieldaten fuer die Besucherstatistik.
 *
 * Nur fuer Entwicklung und Abnahme gedacht, damit das Dashboard nicht leer ist.
 * Vor dem Livegang die erzeugten Daten wieder loeschen:
 *   Verwaltung -> Einstellungen -> "Alle Statistikdaten loeschen"
 *
 * Aufruf:  node scripts/seed-demo-stats.mjs [Anzahl Tage]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';

const days = Number.parseInt(process.argv[2] ?? '45', 10);

// .env einlesen, ohne zusaetzliche Abhaengigkeit.
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const file = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/nexo.db');
if (!fs.existsSync(file)) {
  console.error(`Datenbank ${file} existiert noch nicht. Bitte zuerst die Seite einmal aufrufen.`);
  process.exit(1);
}

const db = new Database(file);

const PATHS = [
  ['/', 0.62],
  ['/#leistungen', 0.14],
  ['/#kontakt', 0.11],
  ['/datenschutz', 0.07],
  ['/impressum', 0.06],
];
const REFERRERS = [
  [null, 0.44],
  ['www.google.com', 0.31],
  ['www.bing.com', 0.08],
  ['www.linkedin.com', 0.07],
  ['de.search.yahoo.com', 0.05],
  ['www.maass-it-solution.de', 0.05],
];
const DEVICES = [
  ['Desktop', 0.58],
  ['Mobil', 0.36],
  ['Tablet', 0.06],
];
const BROWSERS = [
  ['Chrome', 0.46],
  ['Safari', 0.23],
  ['Firefox', 0.14],
  ['Edge', 0.13],
  ['Sonstige', 0.04],
];
const OS = [
  ['Windows', 0.44],
  ['Android', 0.21],
  ['iOS', 0.19],
  ['macOS', 0.11],
  ['Linux', 0.05],
];

function pick(table) {
  const roll = Math.random();
  let sum = 0;
  for (const [value, weight] of table) {
    sum += weight;
    if (roll <= sum) return value;
  }
  return table[table.length - 1][0];
}

function localDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const insert = db.prepare(
  `INSERT INTO page_views (ts, day, hour, path, referrer_host, utm_source, visitor_hash, device, browser, os, duration_ms)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

let rows = 0;
const run = db.transaction(() => {
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const day = localDay(date);
    const weekday = date.getDay();

    // Werktags mehr Verkehr, mit leichtem Wachstum ueber die Zeit.
    const base = weekday === 0 || weekday === 6 ? 9 : 26;
    const growth = 1 + (days - d) / (days * 2.5);
    const visitorCount = Math.max(2, Math.round(base * growth * (0.75 + Math.random() * 0.5)));

    for (let v = 0; v < visitorCount; v++) {
      const visitor = crypto.randomBytes(16).toString('base64url').slice(0, 22);
      const device = pick(DEVICES);
      const browser = pick(BROWSERS);
      const os = pick(OS);
      const referrer = pick(REFERRERS);

      // Geschaeftszeiten bevorzugen.
      const hour = Math.random() < 0.72 ? 8 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 24);
      let ts = new Date(date);
      ts.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

      // Rund 45 % sehen nur eine Seite (Absprung).
      const pageCount = Math.random() < 0.45 ? 1 : 1 + Math.floor(Math.random() * 3);
      for (let p = 0; p < pageCount; p++) {
        insert.run(
          ts.getTime(),
          day,
          ts.getHours(),
          p === 0 ? '/' : pick(PATHS),
          p === 0 ? referrer : null,
          null,
          visitor,
          device,
          browser,
          os,
          15_000 + Math.floor(Math.random() * 180_000),
        );
        rows++;
        ts = new Date(ts.getTime() + (30_000 + Math.random() * 240_000));
      }
    }
  }
});

run();
console.log(`${rows} Beispiel-Seitenaufrufe ueber ${days} Tage erzeugt in ${file}`);
console.log('Zum Entfernen: Verwaltung -> Einstellungen -> "Alle Statistikdaten loeschen"');
