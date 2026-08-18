import { company, contactSection } from '@/content/site';
import ContactForm from './ContactForm';
import Footer from './Footer';

/**
 * Kontakt-Abschnitt und Footer.
 *
 * Gegenüber dem Prototyp ergänzt: das Kontaktformular ersetzt links den
 * einzelnen CTA-Button. Die Direktkanäle rechts (Telefon, WhatsApp, E-Mail,
 * Öffnungszeiten) bleiben unverändert erhalten.
 */
export default function ContactSection() {
  return (
    <section id="kontakt" className="nx-contact nx-dark">
      <div className="nx-contact__grid-bg" aria-hidden="true" />
      <div className="nx-contact__inner">
        <div className="nx-contact__top" data-reveal>
          <div>
            <h2 className="nx-contact__title">{contactSection.headline}</h2>
            <ContactForm />
          </div>

          <div className="nx-contact__cards">
            <a className="nx-ccard" href={company.phoneHref}>
              <div className="nx-ccard__label">Telefon</div>
              <div className="nx-ccard__value">{company.phoneDisplay}</div>
            </a>
            <a
              className="nx-ccard"
              href={company.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="nx-ccard__label">WhatsApp</div>
              <div className="nx-ccard__value">{company.phoneDisplay}</div>
            </a>
            <a className="nx-ccard" href={`mailto:${company.email}`}>
              <div className="nx-ccard__label">E-Mail</div>
              <div className="nx-ccard__value nx-ccard__value--sm">{company.email}</div>
            </a>
            <div className="nx-ccard">
              <div className="nx-ccard__label">Öffnungszeiten</div>
              <div className="nx-ccard__hours">
                {company.hours[0]}
                <br />
                {company.hours[1]}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </section>
  );
}
