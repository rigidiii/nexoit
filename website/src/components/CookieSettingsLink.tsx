'use client';

import { CONSENT_OPEN } from '@/lib/consent';

/**
 * Footer-Link, über den die Datenschutz-Einstellungen jederzeit wieder
 * geöffnet werden können. Der Widerruf muss so einfach sein wie die
 * Erteilung (Art. 7 Abs. 3 DSGVO).
 */
export default function CookieSettingsLink() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN))}>
      Datenschutz-Einstellungen
    </button>
  );
}
