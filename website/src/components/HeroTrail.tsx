'use client';

import { useEffect, useRef } from 'react';

/**
 * Blaue Mausspur im Hero-Bereich.
 *
 * Der Canvas liegt per CSS (.nx-hero__trail, z-index 3) über Raster, Glow und
 * Beams, aber unter dem Textinhalt (z-index 10) – die Spur zieht also hinter
 * Headline, Subline und Buttons entlang.
 *
 * Zeichenprinzip: Die Rohpunkte des Zeigers werden mit einer
 * Catmull-Rom-Spline geglättet und daraus **eine einzige geschlossene Fläche**
 * gebaut, die zum Ende hin spitz ausläuft. Bewusst nicht Segment für Segment
 * mit runden Enden gestrichelt – dabei stapeln sich die Endkappen an jedem
 * Abtastpunkt zu sichtbaren Perlen, und zwischen weit auseinander liegenden
 * Punkten entstehen gerade Kanten.
 *
 * Nicht aktiv bei Touch-Eingabe und bei `prefers-reduced-motion: reduce`.
 */

/** Lebensdauer eines Spurpunktes in Millisekunden – bestimmt, wie lang die Spur wird. */
const LIFETIME = 1500;
/** Obergrenze der gepufferten Rohpunkte. */
const MAX_POINTS = 340;
/** Breite der Spur direkt am Mauszeiger. */
const HEAD_WIDTH = 22;
/** Abstand der Stützpunkte nach dem Glätten, in CSS-Pixeln. */
const SAMPLE_SPACING = 7;
/** Sicherheitsgrenze, damit sehr schnelle Bewegungen die Bildrate nicht drücken. */
const MAX_SAMPLES = 1100;

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

interface Sample {
  x: number;
  y: number;
  /** 1 = frisch am Zeiger, 0 = am Ende der Lebensdauer. */
  life: number;
}

/** Catmull-Rom-Interpolation zwischen p1 und p2, mit p0/p3 als Nachbarn. */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export default function HeroTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (reduceMotion.matches || !finePointer.matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const points: TrailPoint[] = [];
    let frame = 0;
    let running = false;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Glättet die Rohpunkte zu gleichmäßig verteilten Stützpunkten. */
    const buildSamples = (now: number): Sample[] => {
      const alive: Sample[] = points.map((p) => ({
        x: p.x,
        y: p.y,
        life: Math.max(0, 1 - (now - p.t) / LIFETIME),
      }));
      if (alive.length < 2) return alive;

      const samples: Sample[] = [];
      const last = alive.length - 1;

      for (let i = 0; i < last; i++) {
        const p0 = alive[Math.max(0, i - 1)]!;
        const p1 = alive[i]!;
        const p2 = alive[i + 1]!;
        const p3 = alive[Math.min(last, i + 2)]!;

        // Je länger das Teilstück, desto mehr Zwischenpunkte – so bleibt die
        // Kurve auch bei schnellen Bewegungen rund statt eckig.
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const steps = Math.min(8, Math.max(1, Math.round(distance / SAMPLE_SPACING)));

        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          samples.push({
            x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
            y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
            life: p1.life + (p2.life - p1.life) * t,
          });
        }
      }
      samples.push(alive[last]!);

      // Notbremse bei extrem hoher Ereignisrate: vorne kürzen, damit der Kopf
      // am Zeiger erhalten bleibt und keine gerade Kante entsteht.
      return samples.length > MAX_SAMPLES ? samples.slice(samples.length - MAX_SAMPLES) : samples;
    };

    /**
     * Baut aus der Mittellinie eine geschlossene Kontur: einmal an der linken
     * Seite entlang nach vorn, an der rechten Seite zurück. Die halbe Breite
     * je Stützpunkt ergibt sich aus dessen Restlebensdauer, dadurch läuft das
     * Ende spitz aus.
     */
    const ribbonPath = (samples: Sample[], scale: number): Path2D | null => {
      const n = samples.length;
      if (n < 2) return null;

      const left: Array<[number, number]> = [];
      const right: Array<[number, number]> = [];

      for (let i = 0; i < n; i++) {
        const prev = samples[Math.max(0, i - 1)]!;
        const next = samples[Math.min(n - 1, i + 1)]!;
        let dx = next.x - prev.x;
        let dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        const current = samples[i]!;
        // Quadratisch, damit die Spur hinten sanft ausdünnt statt linear.
        const halfWidth = (HEAD_WIDTH * scale * current.life * current.life) / 2;
        left.push([current.x - dy * halfWidth, current.y + dx * halfWidth]);
        right.push([current.x + dy * halfWidth, current.y - dx * halfWidth]);
      }

      const path = new Path2D();
      path.moveTo(left[0]![0], left[0]![1]);
      for (let i = 1; i < n; i++) path.lineTo(left[i]![0], left[i]![1]);
      for (let i = n - 1; i >= 0; i--) path.lineTo(right[i]![0], right[i]![1]);
      path.closePath();

      // Runde Kuppe am Zeiger, damit der Kopf nicht abgeschnitten wirkt.
      const head = samples[n - 1]!;
      const headRadius = (HEAD_WIDTH * scale * head.life * head.life) / 2;
      if (headRadius > 0.5) {
        path.moveTo(head.x + headRadius, head.y);
        path.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
      }

      return path;
    };

    const draw = () => {
      const now = performance.now();

      while (points.length && now - points[0]!.t > LIFETIME) points.shift();
      ctx.clearRect(0, 0, width, height);

      if (points.length < 2) {
        if (points.length === 0) {
          running = false;
          return;
        }
        frame = requestAnimationFrame(draw);
        return;
      }

      const samples = buildSamples(now);

      // Eine einzige Fläche pro Lage: keine überlappenden Teilstücke, also
      // auch keine Punkte oder Nähte an den Stützstellen.
      const outer = ribbonPath(samples, 1);
      if (outer) {
        ctx.shadowColor = 'rgba(10, 92, 255, 0.9)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(48, 118, 255, 0.4)';
        ctx.fill(outer);
      }

      const core = ribbonPath(samples, 0.34);
      if (core) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(160, 197, 255, 0.72)';
        ctx.fill(core);
      }

      frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Sehr dichte Ereignisse bringen nichts und kosten nur Rechenzeit.
      const last = points[points.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < 2) return;

      points.push({ x, y, t: performance.now() });
      if (points.length > MAX_POINTS) points.shift();

      if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };

    // Kein Handler fürs Verlassen nötig: sobald keine neuen Punkte mehr
    // dazukommen, altert die Spur von selbst aus und die Schleife hält an.

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="nx-hero__trail" aria-hidden="true" />;
}
