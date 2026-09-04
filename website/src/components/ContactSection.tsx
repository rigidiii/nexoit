import { company, contactSection } from '@/content/site';
import ContactForm from './ContactForm';
import { ClockIcon, MailIcon, PhoneIcon, WhatsAppIcon } from './Icons';

/**
 * Kontakt-Abschnitt: links das Formular, rechts die Direktkanäle
 * (Telefon, WhatsApp, E-Mail, Öffnungszeiten) als Karten mit Icon-Tiles.
 * Der Footer ist eine eigene Sektion danach (page.tsx).
 */
export default function ContactSection() {
  return (
    <section id="kontakt" className="nx-section nx-contact nx-dark">
      <div className="nx-contact__grid-bg" aria-hidden="true" />
      <div className="nx-contact__glow" aria-hidden="true" />
      <div className="nx-contact__inner">
        <div className="nx-contact__head" data-reveal>
          <div className="nx-kicker">{contactSection.eyebrow}</div>
          <h2 className="nx-h2">
            {contactSection.headline[0]}
            <br />
            <span className="nx-grad">{contactSection.headline[1]}</span>
          </h2>
          <p className="nx-subline">{contactSection.subline}</p>
        </div>

        <div className="nx-contact__top">
          <div className="nx-contact__formcard" data-reveal>
            <ContactForm />
          </div>

          <div className="nx-contact__cards">
            <a className="nx-ccard" href={company.phoneHref} data-reveal data-tilt>
              <span className="nx-ccard__icon">
                <PhoneIcon />
              </span>
              <span className="nx-ccard__label">Telefon</span>
              <span className="nx-ccard__value">{company.phoneDisplay}</span>
              <span className="nx-ccard__caption">{company.hoursShort} erreichbar</span>
            </a>
            <a
              className="nx-ccard"
              href={company.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
              data-tilt
            >
              <span className="nx-ccard__icon">
                <WhatsAppIcon />
              </span>
              <span className="nx-ccard__label">WhatsApp</span>
              <span className="nx-ccard__value">{company.phoneDisplay}</span>
              <span className="nx-ccard__caption">Schreiben Sie uns direkt</span>
            </a>
            <a className="nx-ccard" href={`mailto:${company.email}`} data-reveal data-tilt>
              <span className="nx-ccard__icon">
                <MailIcon />
              </span>
              <span className="nx-ccard__label">E-Mail</span>
              <span className="nx-ccard__value nx-ccard__value--sm">{company.email}</span>
              <span className="nx-ccard__caption">Antwort innerhalb eines Werktages</span>
            </a>
            <div className="nx-ccard" data-reveal>
              <span className="nx-ccard__icon">
                <ClockIcon />
              </span>
              <span className="nx-ccard__label">Öffnungszeiten</span>
              <span className="nx-ccard__hours">
                {company.hours[0]}
                <br />
                {company.hours[1]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
