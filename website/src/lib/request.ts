import 'server-only';

import { getDailySalt } from './db';
import { hashIdentifier } from './crypto';

/** Helfer rund um den eingehenden Request. */

const TRUST_PROXY = process.env.TRUST_PROXY === '1';

/**
 * Besucher-IP. Hinter einem Reverse-Proxy muss TRUST_PROXY=1 gesetzt sein,
 * sonst würde jeder Besucher als der Proxy erscheinen. Ohne diese Einstellung
 * werden Forwarded-Header bewusst ignoriert, damit sie nicht gefälscht werden
 * können.
 */
export function getClientIp(req: Request): string {
  if (TRUST_PROXY) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0]!.trim();
    const real = req.headers.get('x-real-ip');
    if (real) return real.trim();
    const cf = req.headers.get('cf-connecting-ip');
    if (cf) return cf.trim();
  }
  return '0.0.0.0';
}

/** Tagesdatum in lokaler Zeit als YYYY-MM-DD. */
export function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Pseudonymer Besucher-Hash aus IP + User-Agent mit tagesaktuellem Salt.
 * Nicht umkehrbar und nach Salt-Rotation nicht mehr reproduzierbar.
 */
export function visitorHash(req: Request, day = localDay()): string {
  const salt = getDailySalt(day);
  const ua = req.headers.get('user-agent') ?? '';
  return hashIdentifier(`${getClientIp(req)}|${ua}`, salt);
}

/** Hash nur der IP – für Missbrauchsschutz (Rate-Limits, Formular-Spam). */
export function ipHash(req: Request, day = localDay()): string {
  return hashIdentifier(getClientIp(req), getDailySalt(day));
}

/** Prüft Do-Not-Track und Global Privacy Control. */
export function hasDoNotTrack(req: Request): boolean {
  return req.headers.get('dnt') === '1' || req.headers.get('sec-gpc') === '1';
}

/** Grobe Klassifikation des User-Agents – bewusst ohne Versionsnummern. */
export function classifyUserAgent(ua: string): {
  device: string;
  browser: string;
  os: string;
} {
  const s = ua.toLowerCase();

  const device = /ipad|tablet|playbook|silk/.test(s)
    ? 'Tablet'
    : /mobi|iphone|ipod|android.*mobile|windows phone/.test(s)
      ? 'Mobil'
      : 'Desktop';

  const browser = /edg\//.test(s)
    ? 'Edge'
    : /opr\/|opera/.test(s)
      ? 'Opera'
      : /samsungbrowser/.test(s)
        ? 'Samsung Internet'
        : /firefox|fxios/.test(s)
          ? 'Firefox'
          : /chrome|crios/.test(s)
            ? 'Chrome'
            : /safari/.test(s)
              ? 'Safari'
              : 'Sonstige';

  const os = /windows/.test(s)
    ? 'Windows'
    : /android/.test(s)
      ? 'Android'
      : /iphone|ipad|ipod/.test(s)
        ? 'iOS'
        : /mac os x|macintosh/.test(s)
          ? 'macOS'
          : /linux/.test(s)
            ? 'Linux'
            : 'Sonstige';

  return { device, browser, os };
}

/** Bekannte Crawler herausfiltern, damit die Statistik echte Besuche zeigt. */
export function isBot(ua: string): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|postman/i.test(
    ua,
  );
}
