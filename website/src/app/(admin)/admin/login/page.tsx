import { redirect } from 'next/navigation';

import { ensureAdminUser, getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';
import { NexoMark } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/**
 * Anmeldeseite des Verwaltungsbereichs.
 *
 * Beim ersten Aufruf wird der Admin-Zugang aus den Umgebungsvariablen
 * angelegt (siehe .env.example). Danach wirken diese Variablen nicht mehr –
 * das Passwort wird ausschließlich über die Oberfläche geändert.
 */
export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin');

  let setupError: string | null = null;
  try {
    await ensureAdminUser();
  } catch (error) {
    setupError = error instanceof Error ? error.message : 'Konfigurationsfehler.';
  }

  return (
    <div className="ad-login">
      <div className="ad-login__box">
        <div className="ad-login__brand">
          <span className="ad__brand-mark">
            <NexoMark size={18} />
          </span>
          <span className="ad__brand-word">
            Nexo<b>IT</b>
            <span className="ad__brand-sub">Verwaltung</span>
          </span>
        </div>

        <h1 className="ad-login__title">Anmelden</h1>
        <p className="ad-login__hint">
          Zugang zu Besucherstatistik, Kontaktanfragen und SMTP-Einstellungen.
        </p>

        {setupError ? (
          <div className="ad-note ad-note--error" style={{ marginTop: 20 }}>
            {setupError}
          </div>
        ) : (
          <LoginForm />
        )}

        <p className="ad-login__foot">
          Nach zehn Fehlversuchen wird die Anmeldung für 15 Minuten gesperrt. Sitzungen laufen nach
          8 Stunden ab.
        </p>
      </div>
    </div>
  );
}
