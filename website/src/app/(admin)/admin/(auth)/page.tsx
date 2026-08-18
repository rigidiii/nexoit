import Link from 'next/link';

import { getStats } from '@/lib/analytics';
import { getPrivacySettings, isSmtpConfigured } from '@/lib/settings';
import { localDay } from '@/lib/request';
import TrendChart from '@/components/admin/TrendChart';
import { BarList, HourChart, Kpi } from '@/components/admin/StatsBlocks';

export const dynamic = 'force-dynamic';

/** Auswählbare Zeiträume. */
const RANGES = [
  { key: '7', label: '7 Tage', days: 7 },
  { key: '30', label: '30 Tage', days: 30 },
  { key: '90', label: '90 Tage', days: 90 },
  { key: '365', label: '12 Monate', days: 365 },
] as const;

const nf = new Intl.NumberFormat('de-DE');

function shiftDay(day: string, delta: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + delta);
  return localDay(date);
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '–';
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} min`;
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ zeitraum?: string }>;
}) {
  const params = await searchParams;
  const range = RANGES.find((r) => r.key === params.zeitraum) ?? RANGES[1];

  const to = localDay();
  const from = shiftDay(to, -(range.days - 1));
  const stats = getStats(from, to);
  const privacy = getPrivacySettings();
  const smtpReady = isSmtpConfigured();

  const hasData = stats.totals.views > 0;

  return (
    <>
      <header className="ad__head">
        <div>
          <h1 className="ad__title">Besucherstatistik</h1>
          <p className="ad__lead">
            Eigene, cookielose Messung auf diesem Server. Keine IP-Adressen, keine Weitergabe an
            Dritte, Besucher-Kennzeichen mit täglich wechselndem Schlüssel.
          </p>
        </div>
        <div className="ad-live">
          <span className="ad-live__dot" aria-hidden="true" />
          {stats.live === 1 ? '1 Besucher' : `${nf.format(stats.live)} Besucher`} in den letzten 30 Min.
        </div>
      </header>

      <div className="ad-stack">
        {!privacy.analyticsEnabled && (
          <div className="ad-note ad-note--warn">
            Die Reichweitenmessung ist derzeit abgeschaltet. Neue Besuche werden nicht erfasst – das
            lässt sich unter <Link href="/admin/einstellungen">Einstellungen</Link> ändern.
          </div>
        )}
        {!smtpReady && (
          <div className="ad-note ad-note--warn">
            Es ist noch kein SMTP-Server hinterlegt. Anfragen über das Kontaktformular werden zwar
            gespeichert, aber nicht per E-Mail zugestellt.{' '}
            <Link href="/admin/smtp">Jetzt einrichten</Link>.
          </div>
        )}

        <nav className="ad-filters" aria-label="Zeitraum">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/admin?zeitraum=${r.key}`}
              aria-current={r.key === range.key ? 'true' : undefined}
            >
              {r.label}
            </Link>
          ))}
          <span style={{ color: 'var(--ad-muted)', fontSize: 13, marginLeft: 6 }}>
            {new Date(`${from}T12:00:00`).toLocaleDateString('de-DE')} –{' '}
            {new Date(`${to}T12:00:00`).toLocaleDateString('de-DE')}
          </span>
        </nav>

        {!hasData ? (
          <div className="ad-empty">
            <strong>Für diesen Zeitraum liegen noch keine Messwerte vor.</strong>
            <br />
            {stats.storedRows === 0
              ? 'Sobald die Seite besucht wird, erscheinen hier Zahlen. Aufrufe des Verwaltungsbereichs werden bewusst nicht gezählt.'
              : `Insgesamt sind ${nf.format(stats.storedRows)} Aufrufe gespeichert, der erste am ${new Date(`${stats.firstDay}T12:00:00`).toLocaleDateString('de-DE')}. Bitte einen größeren Zeitraum wählen.`}
          </div>
        ) : (
          <>
            <div className="ad-grid ad-grid--kpi">
              <Kpi
                label="Seitenaufrufe"
                value={stats.totals.views}
                previous={stats.previousTotals.views}
              />
              <Kpi
                label="Besucher"
                value={stats.totals.visitors}
                previous={stats.previousTotals.visitors}
                hint="pro Tag gezählt"
              />
              <Kpi
                label="Besuche"
                value={stats.totals.sessions}
                previous={stats.previousTotals.sessions}
                hint="30 Min. Inaktivität = neuer Besuch"
              />
              <div className="ad-card">
                <div className="ad-kpi__label">Absprungrate</div>
                <div className="ad-kpi__value">
                  {(stats.totals.bounceRate * 100).toFixed(0)} %
                </div>
                <div className="ad-kpi__delta">Besuche mit nur einer Seite</div>
              </div>
              <div className="ad-card">
                <div className="ad-kpi__label">Verweildauer</div>
                <div className="ad-kpi__value">{formatDuration(stats.totals.avgDurationSec)}</div>
                <div className="ad-kpi__delta">Durchschnitt je Seitenaufruf</div>
              </div>
            </div>

            <section className="ad-card">
              <h2 className="ad-card__title">Verlauf</h2>
              <p className="ad-card__hint">
                Seitenaufrufe und Besucher je Tag. Besucher werden tageweise gezählt – wer an zwei
                Tagen kommt, zählt zweimal. Das ist die Folge des täglich wechselnden Schlüssels.
              </p>

              <TrendChart data={stats.series} />

              <details className="ad-details">
                <summary>Zahlen als Tabelle anzeigen</summary>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <caption className="nx-sr">
                      Seitenaufrufe und Besucher je Tag im gewählten Zeitraum
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Tag</th>
                        <th scope="col" style={{ textAlign: 'right' }}>
                          Seitenaufrufe
                        </th>
                        <th scope="col" style={{ textAlign: 'right' }}>
                          Besucher
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...stats.series].reverse().map((point) => (
                        <tr key={point.day}>
                          <td>{new Date(`${point.day}T12:00:00`).toLocaleDateString('de-DE')}</td>
                          <td className="num">{nf.format(point.views)}</td>
                          <td className="num">{nf.format(point.visitors)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>

            <div className="ad-grid ad-grid--2">
              <BarList
                title="Meistbesuchte Seiten"
                hint="Anteil an allen Seitenaufrufen im Zeitraum."
                items={stats.pages}
                formatLabel={(label) => (label === '/' ? '/ (Startseite)' : label)}
              />
              <BarList
                title="Woher die Besucher kommen"
                hint="Nur der Domainname der verweisenden Seite wird gespeichert – keine Pfade, keine Suchbegriffe. Wer die Adresse direkt eingibt, über ein Lesezeichen kommt oder den Referrer unterdrückt, erscheint als Direktaufruf."
                items={stats.referrers}
                emptyLabel="Noch keine Aufrufe im Zeitraum."
              />
            </div>

            <HourChart hours={stats.hours} />

            <div className="ad-grid ad-grid--3">
              <BarList title="Geräte" items={stats.devices} />
              <BarList title="Browser" items={stats.browsers} />
              <BarList title="Betriebssysteme" items={stats.systems} />
            </div>
          </>
        )}

        <p className="ad-card__hint">
          Gespeicherte Datensätze insgesamt: {nf.format(stats.storedRows)}. Aufbewahrungsfrist:{' '}
          {privacy.retentionDays > 0 ? `${privacy.retentionDays} Tage` : 'unbegrenzt'} (
          <Link href="/admin/einstellungen">ändern</Link>).
        </p>
      </div>
    </>
  );
}
