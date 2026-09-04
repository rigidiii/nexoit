/**
 * Erzeugt die rasterbasierten Icons aus dem Master-Mark public/assets/icon.svg:
 *
 *   public/favicon-32.png       – PNG-Fallback für Browser ohne SVG-Favicon
 *   public/apple-touch-icon.png – 180 x 180, undurchsichtig (iOS rundet selbst ab,
 *                                 darum dunkler Vollflächen-Hintergrund #070D18)
 *
 * SVG bleibt das primäre Favicon (in jeder Größe scharf); die PNGs sind die
 * Rückfallebene. Warum erzeugt statt committet: Binärdateien im Git veralten
 * gern still – so folgen die Icons immer dem Master-SVG.
 *
 * Aufruf: node scripts/build-icons.mjs (läuft automatisch via `prebuild`).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const quelle = path.join(process.cwd(), 'public', 'assets', 'icon.svg');

const ziele = [
  {
    datei: path.join(process.cwd(), 'public', 'favicon-32.png'),
    kante: 32,
    // Icon füllt die Fläche komplett (abgerundete Ecken bleiben transparent).
    hintergrund: { r: 0, g: 0, b: 0, alpha: 0 },
    vollflaeche: true,
  },
  {
    datei: path.join(process.cwd(), 'public', 'apple-touch-icon.png'),
    kante: 180,
    hintergrund: { r: 7, g: 13, b: 24, alpha: 1 }, // --color-bg
    vollflaeche: false,
  },
];

for (const ziel of ziele) {
  let bild = sharp(fs.readFileSync(quelle), { density: 384 }).resize(ziel.kante, ziel.kante, {
    fit: 'contain',
    background: ziel.hintergrund,
  });

  if (!ziel.vollflaeche) {
    // Kasten auf 78 % verkleinern und auf die dunkle Grundfläche setzen,
    // damit das Icon in der iOS-Maske nicht gequetscht wirkt.
    const innen = Math.round(ziel.kante * 0.78);
    const rand = Math.round((ziel.kante - innen) / 2);
    const kachel = await sharp(fs.readFileSync(quelle), { density: 384 })
      .resize(innen, innen, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    bild = sharp({
      create: {
        width: ziel.kante,
        height: ziel.kante,
        channels: 4,
        background: ziel.hintergrund,
      },
    }).composite([{ input: kachel, left: rand, top: rand }]);
  }

  const png = await bild.png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(ziel.datei, png);
  console.log(`${ziel.datei}  ${ziel.kante}x${ziel.kante}, ${(png.length / 1024).toFixed(1)} kB`);
}
