/**
 * Erzeugt die Logo-Grafik für den Mailversand aus public/assets/icon.svg.
 *
 * Warum eine PNG-Datei und nicht das SVG: E-Mail-Programme unterstützen SVG
 * praktisch nicht – Outlook, Gmail und Apple Mail zeigen es gar nicht oder als
 * kaputtes Bild.
 *
 * Warum nur das Zeichen und nicht die komplette Wortmarke: Der Schriftzug
 * "Nexo IT" ist in Sora gesetzt. Beim Rastern müsste diese Schrift auf dem
 * Rechner installiert sein, der das Bild erzeugt – sonst fällt die Darstellung
 * still auf eine Ersatzschrift zurück und niemand merkt es. Der Schriftzug
 * wird deshalb im HTML der Mail als Text gesetzt; nur das Zeichen ist ein Bild.
 * Nebeneffekt: Der Text bleibt in jeder Auflösung scharf und markierbar.
 *
 * Aufruf:  node scripts/build-mail-logo.mjs
 * Ergebnis: public/mail/logo-icon.png (128 x 128, für 44 px Anzeigegröße)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const quelle = path.join(process.cwd(), 'public', 'assets', 'icon.svg');
const zielOrdner = path.join(process.cwd(), 'public', 'mail');
const ziel = path.join(zielOrdner, 'logo-icon.png');

// Dreifache Anzeigegröße, damit das Zeichen auch auf Bildschirmen mit hoher
// Pixeldichte scharf bleibt.
const KANTE = 132;

fs.mkdirSync(zielOrdner, { recursive: true });

const svg = fs.readFileSync(quelle);
await sharp(svg, { density: 384 })
  .resize(KANTE, KANTE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(ziel);

const { size } = fs.statSync(ziel);
const meta = await sharp(ziel).metadata();
console.log(`${ziel}`);
console.log(`  ${meta.width} x ${meta.height} Pixel, ${(size / 1024).toFixed(1)} kB`);
