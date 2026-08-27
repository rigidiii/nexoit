/**
 * Zentrale Inhalte der Webseite.
 *
 * Texte: finale, gestraffte Copy aus dem Design-Dokument `home.md`
 * (Dark-Re-Design v2). Nicht eigenmächtig umformulieren.
 */

export const company = {
  name: 'Nexo IT',
  legalName: 'Nexo IT',
  claim: 'Mit uns in die Zukunft.',
  domain: 'www.nexoit.de',
  email: 'info@nexoit.de',
  phoneDisplay: '0151 / 412 899 74',
  phoneHref: 'tel:+49015141289974',
  phoneE164: '+4915141289974',
  whatsapp: 'https://wa.me/49015141289974',
  hours: ['Mo–Do: 08:00 – 17:00 Uhr', 'Fr: 08:00 – 15:00 Uhr'],
  hoursShort: 'Mo–Do 8–17 Uhr, Fr 8–15 Uhr',
} as const;

export const nav = [
  { label: 'Über uns', href: '#ueber-uns' },
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Was uns antreibt', href: '#werte' },
  { label: 'Versprechen', href: '#versprechen' },
] as const;

export const hero = {
  statusPill: 'Für Sie da — Mo–Do 8–17 Uhr, Fr 8–15 Uhr',
  headline: ['Kümmern Sie sich um Ihr Geschäft.', 'Wir kümmern uns um Ihre IT.'],
  subline:
    'Serverhosting, WebHosting, Webseiten, Programmierung, Backup, SEO und IT-Services aus einer Hand — DSGVO-konform gehostet in der EU und rund um die Uhr überwacht.',
  primaryCta: { label: 'Leistungen entdecken', href: '#leistungen' },
  secondaryCta: { label: 'Kostenlos beraten lassen', href: '#kontakt' },
  trust: ['24/7 Überwachung', 'Hosting in der EU', 'Alles aus einer Hand'],
  /**
   * Kennzahlen unter den CTAs. `count` ist das Ziel des Hochzähl-Effekts
   * (SiteEffects), `suffix` bleibt währenddessen fix stehen.
   */
  stats: [
    { count: 24, suffix: '/7', label: 'Überwachung & Support' },
    { count: 100, suffix: ' %', label: 'DSGVO-konform, Hosting in der EU' },
    { count: 7, suffix: '', label: 'Leistungen aus einer Hand' },
  ],
  /**
   * Symbole, die im Hero um die Wortmarke kreisen. Rein dekorativ – die
   * Grafik ist als Ganzes `aria-hidden`. Die Koordinaten sind Verschiebungen
   * vom Mittelpunkt in Pixeln und liegen auf einem Kreis mit Radius 160,
   * also genau auf dem mittleren Orbit-Ring.
   */
  orbitIcons: [
    { icon: 'server', x: 0, y: -160, float: 8 },
    { icon: 'cloud', x: 160, y: 0, float: 9.5 },
    { icon: 'shield', x: 0, y: 160, float: 11 },
    { icon: 'code', x: -160, y: 0, float: 8.5 },
  ],
} as const;

export const marqueeItems = [
  'Serverhosting',
  'WebHosting',
  'Webseiten erstellen',
  'Backup Service',
  'SEO',
  'IT Dienstleistungen',
  'Programmierung',
] as const;

export const about = {
  eyebrow: 'Über uns',
  headline: ['IT-Dienstleistungen aller Art —', 'alles aus einer Hand.'],
  paragraphs: [
    'Nexo IT ist Ihr Full-Service-IT-Partner für Webpräsenz und IT-Infrastruktur. Von der Gestaltung und Entwicklung Ihrer Webseite über Serververwaltung und Hosting bis zu laufendem Support und Wartung — bei uns bekommen Sie alles aus einer Hand.',
    'Unser erfahrenes Team begleitet Sie vom ersten Konzept bis zur Umsetzung und darüber hinaus. Persönlich, verlässlich und auf Augenhöhe.',
  ],
  cta: { label: 'Anfrage senden', href: '#kontakt' },
  stats: [
    { count: 24, suffix: '/7', label: 'Überwachung Ihrer Systeme' },
    { count: 100, suffix: ' %', label: 'DSGVO-konform, gehostet in der EU' },
  ],
} as const;

export type ServiceIcon = 'server' | 'globe' | 'monitor' | 'backup' | 'chart' | 'shield' | 'code';

export interface Service {
  icon: ServiceIcon;
  title: string;
  /** Wert, der beim Klick auf die Karte im Betreff-Select vorbelegt wird. */
  subject: string;
  text: string;
  bullets: string[];
  /** Breite Abschluss-Karte über die volle Rasterbreite. */
  feature?: boolean;
}

export const services: Service[] = [
  {
    icon: 'server',
    title: 'Serverhosting',
    subject: 'Serverhosting',
    text: 'Zuverlässige Server-Infrastruktur für Ihr Unternehmen.',
    bullets: ['Hochleistungsserver', 'Sichere Rechenzentren', 'Flexible Skalierbarkeit', '24/7 Überwachung'],
  },
  {
    icon: 'globe',
    title: 'WebHosting',
    subject: 'WebHosting',
    text: 'Schnell, stabil und mit maximaler Verfügbarkeit.',
    bullets: ['Hohe Verfügbarkeit', 'SSL-Zertifikate inklusive', 'Tägliche Backups', 'Einfache Verwaltung'],
  },
  {
    icon: 'monitor',
    title: 'Webseiten erstellen',
    subject: 'Webseite erstellen',
    text: 'Individuell, modern und auf jedem Gerät überzeugend.',
    bullets: ['Responsives Design', 'Aktuelle Technologien', 'SEO-optimiert', 'Passendes Branding'],
  },
  {
    icon: 'backup',
    title: 'Backup Service',
    subject: 'Backup Service',
    text: 'Automatisierte Datensicherung — damit nichts verloren geht.',
    bullets: ['Automatisierte Backups', 'Verschlüsselte Speicherung', 'Flexible Wiederherstellung', 'DSGVO-konform'],
  },
  {
    icon: 'chart',
    title: 'SEO',
    subject: 'SEO',
    text: 'Bessere Sichtbarkeit bei Google & Co.',
    bullets: ['Keyword-Optimierung', 'OnPage- & OffPage-SEO', 'Performance-Monitoring', 'Nachhaltige Ranking-Strategie'],
  },
  {
    icon: 'shield',
    title: 'IT Dienstleistungen',
    subject: 'IT Dienstleistungen',
    text: 'Von der Beratung bis zum Support — maßgeschneidert für Sie.',
    bullets: ['Beratung & Support', 'Netzwerkmanagement', 'Cloud-Lösungen', 'Individuelle IT-Konzepte'],
  },
  {
    icon: 'code',
    title: 'Programmierung',
    subject: 'Programmierung',
    text: 'Individuelle Software und Automatisierung für Ihr Unternehmen.',
    bullets: [
      'Individuelle Softwareentwicklung',
      'Schnittstellen & APIs',
      'Automatisierung von Prozessen',
      'Wartung & Weiterentwicklung',
    ],
    feature: true,
  },
];

export const servicesSection = {
  eyebrow: 'Leistungen',
  headline: ['IT-Services,', 'die zu Ihnen passen.'],
  subline:
    'Sieben Kernleistungen, ein Ansprechpartner: individuelle Lösungen für Ihr Unternehmen — von der Webseite bis zur Serverinfrastruktur.',
  closing: ['Nicht das Richtige dabei?', 'Sprechen Sie uns an', '— wir finden eine Lösung.'],
} as const;

export const midCta = {
  headline: ['Von der ersten Idee bis zum laufenden Betrieb —', 'wir begleiten Sie bei jedem Schritt.'],
  subline: 'Weil Erfolg Teamarbeit ist: Ihr Partner für digitale Lösungen.',
  primaryCta: { label: 'Kontakt aufnehmen', href: '#kontakt' },
} as const;

export const values = {
  eyebrow: 'Was uns antreibt',
  headline: ['Unsere Leitlinien —', 'auf Ihre Bedürfnisse abgestimmt.'],
  cards: [
    {
      icon: 'eye' as const,
      label: 'Unsere Vision',
      title: 'Vision',
      text: 'Wir entwickeln umfassende, innovative und zuverlässige IT-Lösungen, mit denen unsere Kunden ihr volles Potenzial ausschöpfen. Mit hochqualifizierten Mitarbeitern und starken Technologiepartnern treiben wir die digitale Transformation voran — nachhaltig, verantwortungsvoll und mit dem Ziel, die digitale Welt für alle zugänglicher zu machen.',
    },
    {
      icon: 'target' as const,
      label: 'Unsere Mission',
      title: 'Mission',
      text: 'Wir schaffen echten Mehrwert durch zuverlässige und effektive Systeme, optimierte Geschäftsprozesse und individuelle, innovative Ansätze. Partnerschaft und Vertrauen stehen dabei an erster Stelle — und der Anspruch, uns jeden Tag ein Stück zu verbessern.',
    },
  ],
} as const;

export const promises = {
  eyebrow: 'Unser Versprechen',
  headline: ['Was Sie von uns', 'erwarten können.'],
  subline: 'Ihre Zufriedenheit ist unser Antrieb — zuverlässige IT-Lösungen aus einer Hand.',
  items: [
    {
      no: '01',
      title: 'Individualität',
      text: 'Maßgeschneiderte Projektpläne statt Standardlösungen — wir gehen auf Ihre individuellen Wünsche ein.',
    },
    {
      no: '02',
      title: 'Reaktionszeit',
      text: 'Schneller Support und schnelle Bearbeitung Ihrer Anfragen — damit Sie nicht warten müssen.',
    },
    {
      no: '03',
      title: 'Hochverfügbarkeit',
      text: 'Sorgfältig ausgewählte Hochverfügbarkeitsserver — betrieben nach EU-Datenschutzverordnung.',
    },
    {
      no: '04',
      title: 'Transparenz',
      text: 'Offene und ehrliche Preise: Sie wissen immer, was Sie bezahlen — und warum.',
    },
  ],
} as const;

export const contactSection = {
  eyebrow: 'Kontakt',
  headline: ['Sprechen wir über', 'Ihr Projekt.'],
  subline:
    'Nutzen Sie jetzt die Chance auf eine individuelle Beratung — wir melden uns in der Regel innerhalb eines Werktages zurück.',
  formTitle: 'Schreiben Sie uns',
  formHint: 'Wir melden uns in der Regel innerhalb eines Werktages zurück.',
} as const;
