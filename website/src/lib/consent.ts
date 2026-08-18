/**
 * Einwilligungsverwaltung (clientseitig).
 *
 * Rechtlicher Rahmen dieser Seite:
 *  - Es werden keine Marketing-, Werbe- oder Drittanbieter-Cookies gesetzt.
 *    Schriften sind selbst gehostet, es gibt keine eingebetteten Karten,
 *    Videos oder Social-Plugins.
 *  - Technisch notwendig sind nur: das Cookie mit dieser Auswahl und das
 *    Session-Cookie des Admin-Bereichs (§ 25 Abs. 2 Nr. 2 TDDDG – keine
 *    Einwilligung erforderlich).
 *  - Die Reichweitenmessung arbeitet cookielos: sie liest und schreibt nichts
 *    auf dem Endgerät, § 25 TDDDG greift daher nicht. Rechtsgrundlage ist das
 *    berechtigte Interesse (Art. 6 Abs. 1 lit. f DSGVO). Der Schalter unten
 *    ist der jederzeit mögliche Widerspruch nach Art. 21 DSGVO.
 */

export const CONSENT_COOKIE = 'nexo_consent';
export const CONSENT_VERSION = 1;
const MAX_AGE_DAYS = 365;

export interface Consent {
  v: number;
  /** Zeitpunkt der Entscheidung (ms seit Epoche) – Nachweis der Einwilligung. */
  ts: number;
  /** false = Widerspruch gegen die anonyme Reichweitenmessung. */
  analytics: boolean;
}

/** Ereignis, das Banner und Tracker über Änderungen informiert. */
export const CONSENT_CHANGED = 'nexo:consent-changed';
/** Ereignis, mit dem der Footer-Link die Einstellungen wieder öffnet. */
export const CONSENT_OPEN = 'nexo:consent-open';

export function readConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Consent;
    if (parsed.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): Consent {
  const value: Consent = { v: CONSENT_VERSION, ts: Date.now(), analytics };
  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`,
    'path=/',
    `max-age=${MAX_AGE_DAYS * 24 * 60 * 60}`,
    'samesite=lax',
    location.protocol === 'https:' ? 'secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_CHANGED, { detail: value }));
  return value;
}

/**
 * Darf gemessen werden? Ohne Entscheidung ja – die Messung ist cookielos und
 * anonym. Ein ausdrücklicher Widerspruch sowie Do-Not-Track und Global Privacy
 * Control schalten sie ab.
 */
export function mayTrack(): boolean {
  if (typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
    if (nav.globalPrivacyControl === true) return false;
    if (nav.doNotTrack === '1') return false;
  }
  return readConsent()?.analytics !== false;
}
