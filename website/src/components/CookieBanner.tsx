'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { CONSENT_OPEN, readConsent, writeConsent } from '@/lib/consent';

/**
 * Einwilligungsbanner.
 *
 * Vorgaben, die hier bewusst eingehalten werden (EuGH "Planet49", DSK-Leitlinien):
 *  - "Ablehnen" ist auf derselben Ebene, gleich sichtbar und mit gleich vielen
 *    Klicks erreichbar wie "Akzeptieren".
 *  - Keine Vorauswahl zugunsten einwilligungspflichtiger Verarbeitungen –
 *    der Schalter für die Reichweitenmessung steht anfangs auf "aus".
 *  - Kein Weiterlesen-Zwang: das Banner blockiert die Seite nicht, weil ohne
 *    Einwilligung nichts Einwilligungspflichtiges passiert.
 *  - Die Entscheidung ist jederzeit über den Footer-Link widerrufbar.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readConsent();
    if (!stored) {
      setVisible(true);
    } else {
      setAnalytics(stored.analytics);
    }

    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN, reopen);
    return () => window.removeEventListener(CONSENT_OPEN, reopen);
  }, []);

  useEffect(() => {
    if (visible) ref.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const decide = (allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setVisible(false);
    setShowDetails(false);
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="nx-cookie nx-dark"
      role="dialog"
      aria-modal="false"
      aria-labelledby="nx-cookie-title"
      aria-describedby="nx-cookie-text"
    >
      <h2 className="nx-cookie__title" id="nx-cookie-title">
        {showDetails ? 'Datenschutz-Einstellungen' : 'Ihre Privatsphäre'}
      </h2>

      {!showDetails && (
        <p className="nx-cookie__text" id="nx-cookie-text">
          Wir verwenden <strong>keine Werbe- oder Tracking-Cookies</strong> und binden keine
          Drittanbieter ein. Lediglich eine anonyme Reichweitenmessung hilft uns, unser Angebot zu
          verbessern — sie setzt keine Cookies und erhebt keine personenbezogenen Daten. Details
          finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      )}

      {showDetails && (
        <div className="nx-cookie__details" id="nx-cookie-text">
          <p className="nx-cookie__text">
            Hier können Sie Ihre Auswahl anpassen. Technisch notwendige Speicherung ist für den
            Betrieb der Website erforderlich und immer aktiv.
          </p>

          <div className="nx-cookie__group">
            <div className="nx-cookie__switch">
              <h3>Technisch notwendig</h3>
              <span className="nx-cookie__fixed">Immer aktiv</span>
            </div>
            <p>
              Speichert Ihre Datenschutz-Auswahl und gewährleistet den sicheren Betrieb der
              Website. Keine Weitergabe an Dritte.
            </p>
          </div>

          <div className="nx-cookie__group">
            <div className="nx-cookie__switch">
              <h3>
                <label htmlFor="nx-consent-analytics">Anonyme Reichweitenmessung</label>
              </h3>
              <input
                id="nx-consent-analytics"
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </div>
            <p>
              Hilft uns zu verstehen, welche Inhalte genutzt werden. Ohne Cookies, ohne
              IP-Speicherung, ohne personenbezogene Daten. Sie können die Messung jederzeit hier
              oder über „Datenschutz-Einstellungen“ im Footer deaktivieren.
            </p>
          </div>
        </div>
      )}

      <div className="nx-cookie__actions">
        <button
          type="button"
          className="nx-cookie__btn nx-cookie__btn--accept"
          onClick={() => decide(showDetails ? analytics : true)}
        >
          {showDetails ? 'Auswahl speichern' : 'Einverstanden'}
        </button>
        <button
          type="button"
          className="nx-cookie__btn nx-cookie__btn--reject"
          onClick={() => decide(false)}
        >
          {showDetails ? 'Alle ablehnen' : 'Messung ablehnen'}
        </button>
        {!showDetails && (
          <button
            type="button"
            className="nx-cookie__btn nx-cookie__btn--link"
            onClick={() => setShowDetails(true)}
          >
            Einstellungen
          </button>
        )}
      </div>
    </div>
  );
}
