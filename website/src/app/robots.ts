import type { MetadataRoute } from 'next';

/**
 * Bei jedem Abruf neu erzeugt statt zur Bauzeit vorgerendert: Sonst würde der
 * SITE_URL-Wert des Build-Rechners dauerhaft eingebacken – und wer auf dem
 * Server baut, bevor die .env steht, liefert für immer localhost-Adressen aus.
 */
export const dynamic = 'force-dynamic';

const siteUrl = () => process.env.SITE_URL || 'https://www.nexoit.de';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
