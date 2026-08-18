import type { Breakdown } from '@/lib/analytics';

/**
 * Wiederkehrende Bausteine des Statistik-Dashboards.
 * Alles serverseitig gerendert – kein zusätzliches JavaScript im Browser.
 */

const nf = new Intl.NumberFormat('de-DE');

/** Kennzahl-Kachel: eine Zahl trägt die Aussage, dazu die Veränderung. */
export function Kpi({
  label,
  value,
  previous,
  suffix = '',
  invertDelta = false,
  hint,
}: {
  label: string;
  value: number;
  previous?: number;
  suffix?: string;
  /** true = ein Anstieg ist die schlechtere Nachricht (z. B. Absprungrate). */
  invertDelta?: boolean;
  hint?: string;
}) {
  const hasDelta = previous !== undefined && previous > 0;
  const delta = hasDelta ? ((value - previous) / previous) * 100 : 0;
  const rising = delta > 0;
  const good = invertDelta ? !rising : rising;

  return (
    <div className="ad-card">
      <div className="ad-kpi__label">{label}</div>
      <div className="ad-kpi__value">
        {nf.format(value)}
        {suffix}
      </div>
      {hasDelta && Math.abs(delta) >= 0.5 ? (
        <div className={`ad-kpi__delta ad-kpi__delta--${good ? 'up' : 'down'}`}>
          <b>
            {rising ? '▲' : '▼'} {Math.abs(delta).toFixed(0)} %
          </b>
          <span>ggü. Vorperiode</span>
        </div>
      ) : (
        <div className="ad-kpi__delta">{hint ?? (hasDelta ? 'unverändert' : 'keine Vorperiode')}</div>
      )}
    </div>
  );
}

/**
 * Waagerechte Balkenliste für eine einzelne Reihe (Top-Seiten, Referrer …).
 * Eine Reihe = eine Farbe; jeder Balken ist direkt beschriftet, die Farbe
 * trägt keine Information.
 */
export function BarList({
  title,
  hint,
  items,
  emptyLabel = 'Noch keine Daten.',
  formatLabel,
}: {
  title: string;
  hint?: string;
  items: Breakdown[];
  emptyLabel?: string;
  formatLabel?: (label: string) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <section className="ad-card">
      <h2 className="ad-card__title">{title}</h2>
      {hint && <p className="ad-card__hint">{hint}</p>}

      {items.length === 0 ? (
        <p className="ad-card__hint" style={{ marginTop: 16 }}>
          {emptyLabel}
        </p>
      ) : (
        <div className="ad-bars">
          {items.map((item) => (
            <div key={item.label}>
              <div className="ad-bar__head">
                <span className="ad-bar__label" title={item.label}>
                  {formatLabel ? formatLabel(item.label) : item.label}
                </span>
                <span className="ad-bar__value">
                  <b>{nf.format(item.count)}</b> · {(item.share * 100).toFixed(0)} %
                </span>
              </div>
              <div className="ad-bar__track">
                <div
                  className="ad-bar__fill"
                  style={{ width: `${Math.max(2, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Tagesverlauf als Säulen. Eine Reihe, eine Farbe, Werte per Tooltip. */
export function HourChart({ hours }: { hours: { hour: number; views: number }[] }) {
  const max = Math.max(1, ...hours.map((h) => h.views));
  const peak = hours.reduce((best, h) => (h.views > best.views ? h : best), hours[0]!);

  return (
    <section className="ad-card">
      <h2 className="ad-card__title">Tagesverlauf</h2>
      <p className="ad-card__hint">
        Seitenaufrufe nach Uhrzeit (Serverzeit).
        {peak.views > 0 && ` Stärkste Stunde: ${String(peak.hour).padStart(2, '0')}:00 Uhr.`}
      </p>

      <div className="ad-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 132 }}>
        {hours.map((h) => (
          <div
            key={h.hour}
            title={`${String(h.hour).padStart(2, '0')}:00 – ${nf.format(h.views)} Aufrufe`}
            style={{ flex: 1, display: 'grid', gap: 6, alignContent: 'end', minWidth: 0 }}
          >
            <div
              style={{
                height: `${Math.max(h.views > 0 ? 4 : 2, (h.views / max) * 100)}px`,
                background: h.views > 0 ? 'var(--viz-series-1)' : 'var(--viz-grid)',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <span
              style={{
                fontSize: 10,
                textAlign: 'center',
                color: 'var(--viz-axis)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {h.hour % 3 === 0 ? String(h.hour).padStart(2, '0') : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
