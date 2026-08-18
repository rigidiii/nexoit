/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

// Canonical-URLs und Open-Graph-Tags der statischen Seiten werden beim Build
// festgeschrieben. Steht SITE_URL zu diesem Zeitpunkt falsch, verweist die
// Seite dauerhaft auf die falsche Adresse – ohne dass es jemandem auffällt.
// Deshalb hier ein deutlicher Hinweis statt eines stillen Fehlers.
// (robots.txt und sitemap.xml lesen den Wert bei jedem Abruf neu.)
if (!isDev) {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    console.warn(
      '\n[nexo-it] Hinweis: SITE_URL ist nicht gesetzt. Es wird https://www.nexoit.de verwendet.\n',
    );
  } else if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
    console.warn(
      `\n[nexo-it] ACHTUNG: SITE_URL steht auf "${siteUrl}".\n` +
        '          Canonical-Tags und Open-Graph-Angaben der Seite werden damit auf\n' +
        '          localhost zeigen. Vor dem Build in der .env die echte Domain\n' +
        '          eintragen und danach neu bauen.\n',
    );
  }
}

// Selbst gehostete Fonts, kein externer Request -> keine Drittland-Uebermittlung.
// 'unsafe-inline' fuer Styles ist noetig, weil Next inline-Styles fuer die
// Font-Optimierung und das kritische CSS ausliefert.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['better-sqlite3', 'nodemailer'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
        ],
      },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
