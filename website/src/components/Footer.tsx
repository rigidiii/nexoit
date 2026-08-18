import Link from 'next/link';

import { company } from '@/content/site';
import CookieSettingsLink from './CookieSettingsLink';
import { NexoMark } from './Icons';

/** Footer-Zeile. Wird im Kontakt-Abschnitt und auf den Rechtsseiten verwendet. */
export default function Footer() {
  return (
    <footer className="nx-footer">
      <div className="nx-footer__brand">
        <Link href="/#top" className="nx-footer__mark" style={{ color: '#fff' }} aria-label="Zur Startseite">
          <NexoMark size={18} />
        </Link>
        <span className="nx-footer__word">
          Nexo<b>IT</b>
        </span>
        <span className="nx-footer__claim">{company.claim}</span>
      </div>
      <div className="nx-footer__links">
        <span>{company.domain}</span>
        <Link href="/impressum">Impressum</Link>
        <Link href="/datenschutz">Datenschutz</Link>
        <CookieSettingsLink />
      </div>
    </footer>
  );
}

/** Eigenständiger dunkler Footer-Streifen für Unterseiten. */
export function FooterStrip() {
  return (
    <div
      className="nx-dark"
      style={{ background: 'var(--ink)', color: '#fff', padding: '28px var(--gutter) 34px' }}
    >
      <div className="nx-wrap">
        <Footer />
      </div>
    </div>
  );
}
