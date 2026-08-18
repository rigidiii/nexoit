import type { MetadataRoute } from 'next';

/**
 * Bei jedem Abruf neu erzeugt statt zur Bauzeit vorgerendert – siehe robots.ts.
 * Zusätzlich bleibt so `lastModified` aktuell, statt das Build-Datum zu zeigen.
 */
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || 'https://www.nexoit.de';
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
