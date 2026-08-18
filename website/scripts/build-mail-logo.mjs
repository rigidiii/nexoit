/**
 * Erzeugt die Logo-Grafik für den Mailversand aus public/assets/icon.svg.
 *
 * Ergebnis sind zwei Dateien:
 *   public/mail/logo-icon.png  – die Grafik selbst, zum Ansehen und Weitergeben
 *   src/lib/mail-logo.ts       – dieselbe Grafik als Base64-Konstante
 *
 * Warum zusätzlich als Konstante im Quelltext: Der Mailversand soll nicht davon
 * abhängen, dass zur Laufzeit eine Datei an einem bestimmten Pfad liegt. Fehlt
 * sie – weil ein Deployment unvollständig war, das Arbeitsverzeichnis des
 * Prozesses ein anderes ist als gedacht, oder jemand `public/` beim Kopieren
 * ausgelassen hat –, bekäme der Empfänger eine Mail mit kaputtem Bild. Bei
 * 2 kB wiegt die Einbettung nichts.
 *
 * Warum PNG und nicht SVG: E-Mail-Programme unterstützen SVG praktisch nicht.
 *
 * Warum nur das Zeichen und nicht die komplette Wortmarke: Der Schriftzug
 * "Nexo IT" ist in Sora gesetzt. Beim Rastern müsste diese Schrift auf dem
 * erzeugenden Rechner installiert sein, sonst fällt die Darstellung still auf
 * eine Ersatzschrift zurück. Der Schriftzug wird deshalb im HTML als Text
 * gesetzt – und bleibt dadurch in jeder Auflösung scharf.
 *
 * Aufruf: node scripts/build-mail-logo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const quelle = path.join(process.cwd(), 'public', 'assets', 'icon.svg');
const pngZiel = path.join(process.cwd(), 'public', 'mail', 'logo-icon.png');
const tsZiel = path.join(process.cwd(), 'src', 'lib', 'mail-logo.ts');

// Dreifache Anzeigegröße (44 px), damit das Zeichen auch auf Bildschirmen mit
// hoher Pixeldichte scharf bleibt.
const KANTE = 132;

fs.mkdirSync(path.dirname(pngZiel), { recursive: true });

const png = await sharp(fs.readFileSync(quelle), { density: 384 })
  .resize(KANTE, KANTE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

fs.writeFileSync(pngZiel, png);

const base64 = png.toString('base64');
const zeilen = base64.match(/.{1,96}/g) ?? [];

fs.writeFileSync(
  tsZiel,
  `/**
 * Das Nexo-Zeichen als PNG, eingebettet für den Mailversand.
 *
 * ERZEUGTE DATEI – nicht von Hand bearbeiten.
 * Neu erzeugen mit: node scripts/build-mail-logo.mjs
 *
 * Als Konstante statt als Datei, damit der Versand nicht davon abhängt, dass
 * zur Laufzeit eine Datei an einem bestimmten Pfad liegt. Ein fehlendes Bild
 * würde beim Empfänger als kaputtes Symbol ankommen.
 *
 * ${KANTE} x ${KANTE} Pixel, ${(png.length / 1024).toFixed(1)} kB.
 */
export const MAIL_LOGO_PNG_BASE64 =
${zeilen.map((z) => `  '${z}'`).join(' +\n')};

/** Fertiger Puffer für den Mail-Anhang. */
export const mailLogoBuffer = () => Buffer.from(MAIL_LOGO_PNG_BASE64, 'base64');
`,
);

console.log(`${pngZiel}`);
console.log(`  ${KANTE} x ${KANTE} Pixel, ${(png.length / 1024).toFixed(1)} kB`);
console.log(`${tsZiel}`);
console.log(`  ${base64.length} Zeichen Base64 in ${zeilen.length} Zeilen`);
