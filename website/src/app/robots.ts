import type { MetadataRoute } from 'next';

const siteUrl = process.env.SITE_URL || 'https://www.nexo-it.de';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
