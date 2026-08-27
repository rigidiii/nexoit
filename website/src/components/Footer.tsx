import Link from 'next/link';

import { company, nav } from '@/content/site';
import CookieSettingsLink from './CookieSettingsLink';
import { NexoMark } from './Icons';

/**
 * Dunkler Footer-Streifen. Wird auf der Startseite (nach dem Kontakt-
 * Abschnitt) und auf den Rechtsseiten verwendet.
 */
export default function Footer() {
  return (
    <footer className="nx-footer nx-dark">
      <div className="nx-wrap">
        <div className="nx-footer__grid" data-reveal>
          <div className="nx-footer__brand">
            <Link
              href="/#top"
              className="nx-footer__logo"
              aria-label={`${company.name} – zur Startseite`}
            >
              <span className="nx-footer__mark" style={{ color: '#06232E' }}>
                <NexoMark size={18} />
              </span>
              <span className="nx-footer__word">
                Nexo<b>IT</b>
              </span>
            </Link>
            <p className="nx-footer__claim">{company.claim}</p>
          </div>

          <nav className="nx-footer__col" aria-label="Footer-Navigation">
            <div className="nx-footer__head">Seiten</div>
            {nav.map((item) => (
              <Link key={item.href} href={`/${item.href}`}>
                {item.label}
              </Link>
            ))}
            <Link href="/#kontakt">Kontakt</Link>
          </nav>

          <div className="nx-footer__col">
            <div className="nx-footer__head">Rechtliches</div>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <CookieSettingsLink />
          </div>
        </div>

        <div className="nx-footer__bottom">
          <span>© 2026 Nexo IT. Alle Rechte vorbehalten.</span>
          <a href={`https://${company.domain}`}>{company.domain}</a>
        </div>
      </div>
    </footer>
  );
}

/** Name aus dem bisherigen Code beibehalten – wird von den Rechtsseiten importiert. */
export function FooterStrip() {
  return <Footer />;
}
