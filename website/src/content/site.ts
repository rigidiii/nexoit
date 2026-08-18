/**
 * Zentrale Inhalte der Webseite.
 *
 * ACHTUNG: Alle Texte sind Kundentexte aus dem Design-Handoff und wurden
 * wörtlich übernommen. Nicht umformulieren (siehe README des Handoffs,
 * "Offene Punkte für die Umsetzung", Punkt 7).
 */

export const company = {
  name: 'Nexo IT',
  legalName: 'Nexo IT',
  claim: 'Mit uns in die Zukunft',
  domain: 'www.nexoit.de',
  email: 'info@nexoit.de',
  phoneDisplay: '0151 / 412 899 74',
  phoneHref: 'tel:015141289974',
  phoneE164: '+4915141289974',
  whatsapp: 'https://wa.me/49015141289974',
  hours: ['Mo–Do: 08:00 – 17:00 Uhr', 'Fr: 08:00 – 15:00 Uhr'],
} as const;

export const nav = [
  { label: 'Leistungen', href: '#leistungen' },
  { label: 'Über uns', href: '#ueber-uns' },
  { label: 'Was uns antreibt', href: '#werte' },
  { label: 'Versprechen', href: '#versprechen' },
] as const;

export const hero = {
  headline: ['IT einfach', 'und sicher.'],
  subline:
    'Kümmern Sie sich um Ihr Kerngeschäft, wir um Ihre IT. Wir bieten IT Lösungen für jeden Bereich.',
  primaryCta: { label: 'Unsere Dienstleistungen', href: '#leistungen' },
  secondaryCta: { label: 'Kontakt', href: '#kontakt' },
  stats: [
    { value: '24/7', label: 'Überwachung' },
    { value: 'DSGVO', label: 'Hosting in der EU' },
    { value: 'Full Service', label: 'Web & Infrastruktur' },
  ],
  badges: ['Server online · 99,9 %', 'Backup abgeschlossen'],
} as const;

export const marqueeItems = [
  'Serverhosting',
  'WebHosting',
  'Webseiten erstellen',
  'Backup Service',
  'SEO',
  'IT Dienstleistungen',
] as const;

export const about = {
  eyebrow: 'Über uns',
  headline: ['IT Dienstleistungen', 'aller Art'],
  lead: 'Als Full-Service-IT-Unternehmen bieten wir unseren Kunden umfassende Lösungen für ihre Webpräsenz und IT-Infrastruktur.',
  cta: { label: 'Anfrage senden', href: '#kontakt' },
  paragraphs: [
    'Von der Gestaltung und Entwicklung von benutzerfreundlichen und professionellen Webseiten bis hin zur Verwaltung von Servern und der Bereitstellung von Hosting-Diensten.',
    'Wir haben alles, was unsere Kunden benötigen, um erfolgreich im digitalen Zeitalter zu sein. Unser Team von erfahrenen Experten ist bereit, unseren Kunden bei jedem Schritt des Weges zu unterstützen, vom Konzept bis zur Umsetzung.',
    'Wir bieten umfassende Support- und Wartungsdienste, damit unsere Kunden sich keine Sorgen um ihre IT-Systeme machen müssen.',
  ],
  quote:
    'Wenn Sie auf der Suche nach einem zuverlässigen Partner für Ihre Web- und IT-Bedürfnisse sind, dann sind Sie bei uns genau richtig. Kontaktieren Sie uns noch heute, um mehr über unsere Dienstleistungen zu erfahren und wie wir Ihnen helfen können, Ihr Unternehmen im digitalen Zeitalter zu positionieren.',
} as const;

export type ServiceIcon = 'server' | 'globe' | 'monitor' | 'backup' | 'chart' | 'shield';

export type Fly = 'left' | 'right' | 'y';

export interface Service {
  icon: ServiceIcon;
  title: string;
  text: string;
  bullets: string[];
  fly: Fly;
  inverted?: boolean;
}

export const services: Service[] = [
  {
    icon: 'server',
    fly: 'left',
    title: 'Serverhosting',
    text: 'Zuverlässige Server-Infrastruktur für Ihr Unternehmen. Sichere und leistungsstarke Serverlösungen – flexibel, skalierbar und zuverlässig.',
    bullets: ['Hochleistungsserver', 'Sichere Rechenzentren', 'Flexible Skalierbarkeit', '24/7 Überwachung'],
  },
  {
    icon: 'globe',
    fly: 'y',
    title: 'WebHosting',
    text: 'Schnelles und stabiles Webhosting für Ihre Webseite – mit maximaler Verfügbarkeit.',
    bullets: ['Hohe Verfügbarkeit', 'SSL-Zertifikate inklusive', 'Tägliche Backups', 'Einfache Verwaltung'],
  },
  {
    icon: 'monitor',
    fly: 'right',
    title: 'Webseiten erstellen',
    text: 'Individuelle Webseiten – modern, responsiv und auf Ihr Business zugeschnitten.',
    bullets: ['Responsives Design', 'Aktuelle Technologien', 'SEO-optimiert', 'Passendes Branding'],
  },
  {
    icon: 'backup',
    fly: 'left',
    title: 'Backup Service',
    text: 'Automatisierte Datensicherungen – damit Ihre Daten jederzeit geschützt sind.',
    bullets: ['Automatisierte Backups', 'Verschlüsselte Speicherung', 'Flexible Wiederherstellung', 'DSGVO-konform'],
  },
  {
    icon: 'chart',
    fly: 'y',
    title: 'SEO',
    text: 'Bessere Sichtbarkeit bei Google & Co. – wir optimieren Ihre Webseite für Suchmaschinen.',
    bullets: ['Keyword-Optimierung', 'OnPage- & OffPage-SEO', 'Performance-Monitoring', 'Nachhaltige Ranking-Strategie'],
  },
  {
    icon: 'shield',
    fly: 'right',
    inverted: true,
    title: 'IT Dienstleistungen',
    text: 'Von Beratung bis Support – wir bieten maßgeschneiderte IT-Lösungen für Ihr Unternehmen.',
    bullets: ['Beratung & Support', 'Netzwerkmanagement', 'Cloud-Lösungen', 'Individuelle IT-Konzepte'],
  },
];

export const midCta = {
  kicker: ['Von der Idee bis zur Umsetzung', 'wir begleiten Sie auf jedem Schritt'],
  headline: 'Weil Erfolg Teamarbeit ist – wir sind Ihr Partner für digitale Lösungen.',
  cta: { label: 'Kontakt aufnehmen', href: '#kontakt' },
} as const;

export const values = {
  eyebrow: 'Unsere Leitlinien',
  headline: 'Was uns antreibt',
  subline: 'auf Ihre Bedürfnisse abgestimmt',
  cards: [
    {
      icon: 'eye' as const,
      title: 'Vision',
      text: 'Unsere Vision ist es, unseren Kunden umfassende, innovative und zuverlässige Lösungen zu bieten. Wir wollen dabei die digitale Transformation unserer Kunden vorantreiben und ihnen dabei helfen, ihr volles Potential auszuschöpfen. Durch unsere hochqualifizierten Mitarbeiter und unsere Partnerschaften mit führenden Technologieunternehmen sind wir in der Lage, maßgeschneiderte Lösungen zu entwickeln, die den Bedarf unserer Kunden erfüllen und ihnen einen Wettbewerbsvorteil verschaffen. Wir setzen auf Nachhaltigkeit und Verantwortung und wollen dazu beitragen, die digitale Welt für alle Menschen zugänglicher und nutzbar zu gestalten.',
    },
    {
      icon: 'target' as const,
      title: 'Mission',
      text: 'Unsere Mission ist es, unseren Kunden den bestmöglichen Mehrwert durch unsere IT-Dienstleistungen zu bieten. Mit unserer Expertise und unserem Engagement stellen wir zuverlässige und effektive Systeme bereit, die Geschäftsprozesse optimieren und den Erfolg unserer Kunden fördern. Wir entwickeln individuelle und innovative Ansätze, die passgenau auf ihre Bedürfnisse abgestimmt sind. Dabei setzen wir auf Partnerschaft und Vertrauen und wollen gemeinsam mit unseren Kunden erfolgreich sein. Stetige Verbesserung unserer Prozesse und die kontinuierliche Optimierung unserer Leistungen sind für uns selbstverständlich – um jederzeit den bestmöglichen Service bieten zu können.',
    },
  ],
} as const;

export const promises = {
  eyebrow: 'Ihre Zufriedenheit ist unser Antrieb',
  headline: ['Was Sie von uns', 'erwarten können'],
  subline: 'zuverlässige IT-Lösungen aus einer Hand',
  items: [
    {
      no: '01',
      title: 'Individualität',
      text: 'Wir gehen auf die individuellen Wünsche unserer Kunden ein und erstellen zusammen mit Ihnen einen maßgeschneiderten Projektplan.',
    },
    {
      no: '02',
      title: 'Reaktionszeit',
      text: 'Lange Warten können Sie woanders. Bei uns erhalten Sie einen schnellen Support und eine schnelle Bearbeitung Ihrer Anfragen.',
    },
    {
      no: '03',
      title: 'Hochverfügbarkeit',
      text: 'Wir hosten ausschließlich auf sorgfältig ausgewählten Hochverfügbarkeitsservern, die der EU-Datenschutzverordnung entsprechen.',
    },
    {
      no: '04',
      title: 'Transparenz',
      text: 'Jeder Kunde verdient einen transparenten und fairen Preis. Deshalb sind alle unsere Preise offen und ehrlich kommuniziert – Sie wissen immer genau, was Sie bezahlen und warum.',
    },
  ],
} as const;

export const contactSection = {
  headline: 'Nutzen Sie jetzt die Chance auf individuelle Beratung',
  formTitle: 'Schreiben Sie uns',
  formHint: 'Wir melden uns in der Regel innerhalb eines Werktages zurück.',
} as const;
