'use client';

import { useMemo, useState } from 'react';

/**
 * Zeitreihe der Seitenaufrufe und Besucher.
 *
 * Beide Reihen sind Anzahlen und teilen sich deshalb eine einzige y-Achse –
 * eine zweite Achse würde die Verhältnisse verfälschen. Zwei Farben, beide
 * gegen die weiße Fläche geprüft (CVD-Abstand 31.8), zusätzlich Legende und
 * Direktbeschriftung am letzten Punkt: die Identität hängt nie allein an der
 * Farbe.
 */

export interface TrendPoint {
  day: string;
  views: number;
  visitors: number;
}

const W = 900;
const H = 260;
const PAD = { top: 18, right: 58, bottom: 30, left: 46 };

const SERIES = [
  { key: 'views' as const, label: 'Seitenaufrufe', color: 'var(--viz-series-1)' },
  { key: 'visitors' as const, label: 'Besucher', color: 'var(--viz-series-2)' },
];

function niceMax(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatDay(day: string, long = false): string {
  const date = new Date(`${day}T12:00:00`);
  return date.toLocaleDateString('de-DE', long ? { dateStyle: 'full' } : { day: '2-digit', month: '2-digit' });
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const { max, x, y, paths } = useMemo(() => {
    const peak = niceMax(Math.max(1, ...data.map((d) => Math.max(d.views, d.visitors))));
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const xAt = (i: number) =>
      PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const yAt = (v: number) => PAD.top + innerH - (v / peak) * innerH;

    const build = (key: 'views' | 'visitors') =>
      data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d[key]).toFixed(1)}`).join(' ');

    return {
      max: peak,
      x: xAt,
      y: yAt,
      paths: { views: build('views'), visitors: build('visitors') },
    };
  }, [data]);

  if (data.length === 0) return null;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  // Bei langen Zeiträumen nicht jeden Tag beschriften.
  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const active = hover !== null ? data[hover] : null;
  const last = data.length - 1;

  return (
    <div className="ad-chart" style={{ position: 'relative' }}>
      <div className="ad-legend">
        {SERIES.map((s) => (
          <span key={s.key}>
            <i style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Verlauf von Seitenaufrufen und Besuchern vom ${formatDay(data[0]!.day, true)} bis ${formatDay(data[last]!.day, true)}. Die Zahlen stehen zusätzlich in der Tabelle unter dem Diagramm.`}
        onPointerLeave={() => setHover(null)}
      >
        {/* Zurückhaltendes Raster */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--viz-axis)"
            >
              {tick.toLocaleString('de-DE')}
            </text>
          </g>
        ))}

        {data.map((d, i) =>
          i % labelStep === 0 || i === last ? (
            <text
              key={d.day}
              x={x(i)}
              y={H - 8}
              textAnchor={i === last ? 'end' : 'middle'}
              fontSize="12"
              fill="var(--viz-axis)"
            >
              {formatDay(d.day)}
            </text>
          ) : null,
        )}

        {/* Fadenkreuz */}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="var(--viz-axis)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {SERIES.map((s) => (
          <path
            key={s.key}
            d={paths[s.key]}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Marker am Cursor – 2px weißer Ring, damit sie sich überlagern dürfen */}
        {hover !== null &&
          SERIES.map((s) => (
            <circle
              key={s.key}
              cx={x(hover)}
              cy={y(data[hover]![s.key])}
              r="5"
              fill={s.color}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}

        {/* Direktbeschriftung des letzten Wertes */}
        {SERIES.map((s) => (
          <text
            key={s.key}
            x={x(last) + 10}
            y={y(data[last]![s.key]) + 4}
            fontSize="13"
            fontWeight="700"
            fill={s.color}
          >
            {data[last]![s.key].toLocaleString('de-DE')}
          </text>
        ))}

        {/* Unsichtbare Trefferflächen – breiter als die Marke selbst */}
        {data.map((d, i) => {
          const step = (W - PAD.left - PAD.right) / Math.max(1, data.length - 1);
          return (
            <rect
              key={d.day}
              x={x(i) - step / 2}
              y={PAD.top}
              width={Math.max(step, 12)}
              height={H - PAD.top - PAD.bottom}
              fill="transparent"
              onPointerEnter={() => setHover(i)}
            />
          );
        })}
      </svg>

      {active && hover !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${(x(hover) / W) * 100}%`,
            top: 34,
            transform: `translateX(${hover > data.length / 2 ? '-105%' : '5%'})`,
            background: '#14161a',
            color: '#fff',
            padding: '10px 13px',
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.5,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 30px rgba(0,0,0,.25)',
            zIndex: 2,
          }}
        >
          <strong>{formatDay(active.day, true)}</strong>
          <br />
          {active.views.toLocaleString('de-DE')} Aufrufe · {active.visitors.toLocaleString('de-DE')}{' '}
          Besucher
        </div>
      )}
    </div>
  );
}
