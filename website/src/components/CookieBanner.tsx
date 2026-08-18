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
 *  - Keine Vorauswahl zugunsten einwilligungspflichtiger Verarbeitungen.
 *  - Kein Weiterlesen-Zwang: das Banner blockiert die Seite nicht, weil ohne
 *    Einwilligung nichts Einwilligungspflichtiges passiert.
 *  - Die Entscheidung ist jederzeit über den Footer-Link widerrufbar.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
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
      setAnalytics(current?.analytics ?? true);
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
        Datenschutz-Einstellungen
      </h2>
      <p className="nx-cookie__text" id="nx-cookie-text">
        Diese Webseite setzt <strong>keine Werbe- oder Tracking-Cookies</strong> und bindet keine
        Dienste von Drittanbietern ein. Schriften liefern wir von unserem eigenen Server aus. Für
        die Reichweitenmessung zählen wir Seitenaufrufe anonym und ohne Cookies. Sie können dieser
        Messung hier widersprechen. Details in der{' '}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      {showDetails && (
        <div className="nx-cookie__details">
          <div className="nx-cookie__group">
            <div className="nx-cookie__switch">
              <h3>Technisch notwendig</h3>
              <span className="nx-cookie__fixed">Immer aktiv</span>
            </div>
            <p>
              Speichert diese Auswahl, sichert das Kontaktformular gegen Missbrauch und hält die
              Anmeldung im internen Verwaltungsbereich. Ohne diese Funktionen ist die Seite nicht
              nutzbar – dafür ist keine Einwilligung erforderlich.
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
              Eigene Messung auf unserem Server – kein Google Analytics, keine Cookies, keine
              Weitergabe. Die IP-Adresse wird nicht gespeichert, sondern nur mit einem täglich
              wechselnden Schlüssel zu einem nicht umkehrbaren Kennzeichen verrechnet. Damit lässt
              sich niemand über einen Tag hinaus wiedererkennen.
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
          Messung ablehnen
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
