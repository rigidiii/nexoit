import type { Metadata, Viewport } from 'next';
import { Manrope, Sora } from 'next/font/google';

import '../(site)/globals.css';
import './admin.css';

/**
 * Eigenes Root-Layout für den Verwaltungsbereich.
 *
 * Bewusst getrennt vom öffentlichen Layout: hier gibt es weder die
 * Marketing-Navigation noch den Einwilligungs-Banner noch die
 * Reichweitenmessung. Das Session-Cookie ist technisch notwendig und damit
 * nicht einwilligungspflichtig – ein Banner wäre hier sogar irreführend.
 *
 * Das öffentliche Stylesheet wird mitgeladen, weil der Admin dessen
 * Schrift-Variablen und Hilfsklassen (z. B. `.nx-sr`) verwendet.
 */

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Verwaltung | Nexo IT', template: '%s | Nexo IT Verwaltung' },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#14161A',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sora.variable} ${manrope.variable}`}>
      <body>
        <div className="ad">{children}</div>
      </body>
    </html>
  );
}
