import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';

import './globals.css';
import { company } from '@/content/site';
import Analytics from '@/components/Analytics';
import CookieBanner from '@/components/CookieBanner';
import Header from '@/components/Header';
import SiteEffects from '@/components/SiteEffects';

/**
 * next/font lädt Sora und Inter zur Bauzeit herunter und liefert sie von der
 * eigenen Domain aus. Es gibt damit keine Verbindung zu Google Fonts im
 * Browser des Besuchers – Voraussetzung für den Betrieb ohne Einwilligung
 * (vgl. LG München I, 20.01.2022 – 3 O 17493/20).
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.SITE_URL || 'https://www.nexoit.de';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nexo IT — IT einfach und sicher. Serverhosting, WebHosting & IT-Services',
    template: '%s | Nexo IT',
  },
  description:
    'Nexo IT ist Ihr Full-Service-IT-Partner: Serverhosting, WebHosting, Webseiten, Backup, SEO und IT-Dienstleistungen — DSGVO-konform aus der EU, persönlich und zuverlässig.',
  keywords: [
    'IT Dienstleistungen',
    'Serverhosting',
    'WebHosting',
    'Webseiten erstellen',
    'Backup Service',
    'SEO',
    'Nexo IT',
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  publisher: company.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: siteUrl,
    siteName: company.name,
    title: 'Nexo IT – IT einfach und sicher',
    description:
      'Kümmern Sie sich um Ihr Kerngeschäft, wir um Ihre IT. Full-Service-IT: Hosting, Webseiten, Backup, SEO und Support.',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'Nexo IT – IT einfach und sicher' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexo IT – IT einfach und sicher',
    description: 'Full-Service-IT: Hosting, Webseiten, Backup, SEO und Support.',
    images: ['/og.svg'],
  },
  icons: {
    // SVG zuerst (in jeder Größe scharf), PNG-Fallbacks erzeugt `prebuild`
    // (scripts/build-icons.mjs) aus demselben Master-Mark.
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#070D18',
  width: 'device-width',
  initialScale: 1,
};

/** Strukturierte Daten für die Suchmaschinen. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: company.name,
  url: siteUrl,
  email: company.email,
  telephone: company.phoneE164,
  slogan: company.claim,
  description:
    'Full-Service-IT-Unternehmen für Serverhosting, WebHosting, Webseitenerstellung, Backup Service, SEO und IT-Dienstleistungen.',
  areaServed: 'DE',
  address: { '@type': 'PostalAddress', addressCountry: 'DE' },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '08:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '08:00',
      closes: '15:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'IT-Dienstleistungen',
    itemListElement: [
      'Serverhosting',
      'WebHosting',
      'Webseiten erstellen',
      'Backup Service',
      'SEO',
      'IT Dienstleistungen',
      'Programmierung',
    ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: das Inline-Skript unten ergänzt die Klasse `js`,
    // die im serverseitigen Markup noch fehlt.
    <html lang="de" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Läuft synchron vor dem ersten Paint und schaltet die Startzustände
            der Scroll-Animationen frei. Ohne JavaScript bleibt die Klasse aus
            und die Inhalte sind sofort sichtbar. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          // Kontrollierter, statischer Inhalt – keine Nutzereingaben.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="nx-skip" href="#inhalt">
          Zum Inhalt springen
        </a>
        <div className="nx-progress" data-progress aria-hidden="true" />
        <Header />
        <main id="inhalt">{children}</main>
        <SiteEffects />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
