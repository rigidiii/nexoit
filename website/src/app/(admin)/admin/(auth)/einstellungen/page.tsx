import Link from 'next/link';

import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getPrivacySettings } from '@/lib/settings';
import { PasswordForm, PrivacyForm, PurgeForm } from '@/components/admin/SettingsForms';

export const dynamic = 'force-dynamic';

interface AuditRow {
  ts: number;
  action: string;
  detail: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  'login.success': 'Anmeldung erfolgreich',
  'login.failed': 'Anmeldung fehlgeschlagen',
  'password.changed': 'Passwort geändert',
  'smtp.saved': 'SMTP-Einstellungen gespeichert',
  'smtp.test.ok': 'Testmail versendet',
  'smtp.test.failed': 'Testmail fehlgeschlagen',
  'privacy.saved': 'Datenschutz-Einstellungen gespeichert',
  'stats.purged': 'Statistikdaten gelöscht',
  'message.deleted': 'Nachricht gelöscht',
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const privacy = getPrivacySettings();
  const db = getDb();

  const { storedRows } = db.prepare('SELECT COUNT(*) AS storedRows FROM page_views').get() as {
    storedRows: number;
  };

  const audit = db
    .prepare('SELECT ts, action, detail FROM audit_log ORDER BY ts DESC LIMIT 25')
    .all() as AuditRow[];

  return (
    <>
      <header className="ad__head">
        <div>
          <h1 className="ad__title">Einstellungen</h1>
          <p className="ad__lead">
            Datenschutz der Reichweitenmessung, Zugangsdaten und Protokoll sicherheitsrelevanter
            Aktionen.
          </p>
        </div>
      </header>

      <div className="ad-stack">
        <PrivacyForm
          retentionDays={privacy.retentionDays}
          respectDnt={privacy.respectDnt}
          analyticsEnabled={privacy.analyticsEnabled}
        />

        <PasswordForm />

        <section className="ad-card">
          <h2 className="ad-card__title">Konto</h2>
          <p className="ad-card__hint">
            Angemeldet als <strong>{user?.username}</strong>. Die Umgebungsvariablen{' '}
            <code>ADMIN_USERNAME</code> und <code>ADMIN_INITIAL_PASSWORD</code> wirken nur beim
            allerersten Start und werden danach ignoriert.
          </p>
        </section>

        <section className="ad-card">
          <h2 className="ad-card__title">Protokoll</h2>
          <p className="ad-card__hint">
            Die letzten 25 sicherheitsrelevanten Vorgänge. Statt IP-Adressen wird nur ein
            tagesbezogener, nicht umkehrbarer Prüfwert gespeichert.
          </p>

          {audit.length === 0 ? (
            <p className="ad-card__hint" style={{ marginTop: 14 }}>
              Noch keine Einträge.
            </p>
          ) : (
            <div className="ad-table-wrap" style={{ marginTop: 16 }}>
              <table className="ad-table">
                <thead>
                  <tr>
                    <th scope="col">Zeitpunkt</th>
                    <th scope="col">Vorgang</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((row) => (
                    <tr key={`${row.ts}-${row.action}`}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(row.ts).toLocaleString('de-DE', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td>{ACTION_LABELS[row.action] ?? row.action}</td>
                      <td style={{ color: 'var(--ad-muted)' }}>{row.detail ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <PurgeForm storedRows={storedRows} />

        <section className="ad-card">
          <h2 className="ad-card__title">Rechtliche Seiten</h2>
          <p className="ad-card__hint">
            <Link href="/impressum" target="_blank" rel="noopener">
              Impressum
            </Link>{' '}
            und{' '}
            <Link href="/datenschutz" target="_blank" rel="noopener">
              Datenschutzerklärung
            </Link>{' '}
            liegen als Vorlage mit gelb markierten Platzhaltern vor. Diese müssen vor dem Livegang
            ausgefüllt werden – die Texte stehen in{' '}
            <code>src/app/impressum/page.tsx</code> und <code>src/app/datenschutz/page.tsx</code>.
          </p>
        </section>
      </div>
    </>
  );
}
