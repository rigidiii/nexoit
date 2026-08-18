'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { CONSENT_CHANGED, mayTrack } from '@/lib/consent';

/**
 * Cookieloser Zähler für die Reichweitenmessung.
 *
 * Gesendet werden nur: Pfad, Referrer-Host (ohne Pfad und Parameter),
 * utm_source und – beim Verlassen – die Verweildauer. Alles Weitere
 * (Gerät, Browser, Besucher-Kennzeichen) entsteht serverseitig und wird
 * dort sofort anonymisiert.
 *
 * Es wird nichts im Browser gespeichert: kein Cookie, kein localStorage,
 * kein sessionStorage. Die Aufruf-ID lebt nur in dieser Variablen.
 */
export default function Analytics() {
  const pathname = usePathname();
  const viewId = useRef<number | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    let cancelled = false;

    /** Verweildauer melden – beim Wechsel der Seite und beim Schließen des Tabs. */
    const sendDuration = () => {
      const id = viewId.current;
      if (id === null) return;
      viewId.current = null;
      const payload = JSON.stringify({ type: 'leave', id, duration: Date.now() - startedAt.current });
      // sendBeacon überlebt das Entladen der Seite; Blob-Typ, damit kein
      // Preflight nötig wird.
      navigator.sendBeacon?.('/api/track', new Blob([payload], { type: 'application/json' }));
    };

    const track = async () => {
      if (!mayTrack()) return;
      startedAt.current = Date.now();

      try {
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'view',
            path: window.location.pathname,
            referrer: document.referrer || null,
            utm: new URLSearchParams(window.location.search).get('utm_source'),
          }),
        });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { id?: number };
        if (typeof data.id === 'number') viewId.current = data.id;
      } catch {
        // Messung ist unkritisch – Fehler bleiben ohne Folgen für den Besuch.
      }
    };

    void track();

    const onHide = () => {
      if (document.visibilityState === 'hidden') sendDuration();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', sendDuration);

    // Bei Widerruf während des Besuchs sofort aufhören.
    const onConsentChange = () => {
      if (!mayTrack()) viewId.current = null;
    };
    window.addEventListener(CONSENT_CHANGED, onConsentChange);

    return () => {
      cancelled = true;
      sendDuration();
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', sendDuration);
      window.removeEventListener(CONSENT_CHANGED, onConsentChange);
    };
  }, [pathname]);

  return null;
}
