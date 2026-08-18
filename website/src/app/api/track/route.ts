import { NextResponse } from 'next/server';

import { recordDuration, recordPageView } from '@/lib/analytics';
import { getPrivacySettings } from '@/lib/settings';
import { classifyUserAgent, hasDoNotTrack, isBot, visitorHash } from '@/lib/request';
import { CONSENT_COOKIE } from '@/lib/consent';

/**
 * Endpunkt der Reichweitenmessung.
 *
 * Absichtlich sparsam: Es wird keine IP-Adresse gespeichert, der User-Agent
 * nur grob klassifiziert und vom Referrer ausschließlich der Host übernommen –
 * Pfade und Suchparameter fremder Seiten könnten personenbezogene Daten
 * enthalten.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Antwort ohne Inhalt – der Client wertet sie bei 'leave' nicht aus. */
const noContent = () => new NextResponse(null, { status: 204 });

/** Nur Anfragen von der eigenen Seite annehmen. */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // sendBeacon setzt bei gleichem Origin keinen Header
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/** Widerspruch aus dem Einwilligungs-Cookie lesen. */
function hasOptedOut(req: Request): boolean {
  const cookie = req.headers.get('cookie') ?? '';
  const raw = cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return false;
  try {
    return (JSON.parse(decodeURIComponent(raw)) as { analytics?: boolean }).analytics === false;
  } catch {
    return false;
  }
}

/** Nur den Host des Referrers übernehmen, eigene Aufrufe ignorieren. */
function referrerHost(referrer: string | null, self: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).host;
    return host && host !== self ? host : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return noContent();

  const privacy = getPrivacySettings();
  if (!privacy.analyticsEnabled) return noContent();
  if (privacy.respectDnt && hasDoNotTrack(req)) return noContent();
  if (hasOptedOut(req)) return noContent();

  const userAgent = req.headers.get('user-agent') ?? '';
  if (isBot(userAgent)) return noContent();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return noContent();
  }

  if (body.type === 'leave') {
    const id = Number(body.id);
    const duration = Number(body.duration);
    if (Number.isFinite(id) && Number.isFinite(duration)) recordDuration(id, duration);
    return noContent();
  }

  if (body.type !== 'view') return noContent();

  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '/';
  if (!path.startsWith('/')) return noContent();
  // Der Verwaltungsbereich wird nicht gemessen.
  if (path.startsWith('/admin')) return noContent();

  const { device, browser, os } = classifyUserAgent(userAgent);

  const id = recordPageView({
    path,
    referrerHost: referrerHost(
      typeof body.referrer === 'string' ? body.referrer : null,
      new URL(req.url).host,
    ),
    utmSource: typeof body.utm === 'string' ? body.utm.slice(0, 60) : null,
    visitorHash: visitorHash(req),
    device,
    browser,
    os,
  });

  return NextResponse.json({ id }, { headers: { 'Cache-Control': 'no-store' } });
}
