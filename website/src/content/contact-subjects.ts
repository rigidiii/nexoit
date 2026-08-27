/** Auswahlmöglichkeiten im Betreff-Feld des Kontaktformulars. */
export const CONTACT_SUBJECTS = [
  'Serverhosting',
  'WebHosting',
  'Webseite erstellen',
  'Backup Service',
  'SEO',
  'IT Dienstleistungen',
  'Programmierung',
  'Allgemeine Anfrage',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
