import { NextResponse } from 'next/server';

import { sign } from '@/lib/crypto';

/**
 * Liefert den signierten Zeitstempel für das Kontaktformular.
 *
 * Der Token wird bewusst nicht in der Seite gerendert: die Startseite ist
 * statisch, ein eingebauter Token wäre also für alle Besucher derselbe und
 * würde zwei Stunden nach dem Build dauerhaft ablaufen. So beginnt die
 * Mindest-Ausfüllzeit stattdessen mit dem tatsächlichen Seitenaufruf.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const ts = Date.now().toString(36);
  return NextResponse.json(
    { token: `${ts}.${sign(ts, 'contact-form')}` },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
