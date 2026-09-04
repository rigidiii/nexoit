import { about, company, marqueeItems, midCta, promises, services, servicesSection, values } from '@/content/site';
import { ClockIcon, EyeIcon, ServiceIconSvg, TargetIcon } from './Icons';

/* ---------------------------------------------------------------------------
   Leistungs-Ticker

   Der Track enthält mehrere identische Kopien der Leistungsliste und wandert
   pro Durchlauf um exakt eine Kopienbreite nach links – danach ist der Zustand
   wieder identisch, die Schleife also nahtlos.

   Warum so viele Kopien: Bei nur zwei Kopien und einem Versatz von 50 % muss
   eine einzelne Kopie mindestens so breit sein wie das Browserfenster. Ist sie
   das nicht, entsteht am rechten Rand eine Lücke und der Ticker scheint zu
   springen. Mit COPIES Kopien genügt es, dass COPIES-1 Kopien das Fenster
   füllen – das trägt bis weit über übliche Bildschirmbreiten hinaus.
   Die Zahl muss mit `--nx-marquee-copies` in globals.css übereinstimmen.
   --------------------------------------------------------------------------- */
const COPIES = 6;

export function Marquee() {
  const list = marqueeItems.map((item) => (
    <span className="nx-marquee__item" key={item}>
      {item}
      <span className="nx-marquee__sep" aria-hidden="true"> ✦</span>
    </span>
  ));

  return (
    <div className="nx-marquee" aria-label="Unsere Leistungen im Überblick">
      <div className="nx-marquee__track">
        {Array.from({ length: COPIES }, (_, i) => (
          // Nur die erste Kopie ist für Screenreader sichtbar, der Rest ist
          // reine Wiederholung für den optischen Endlos-Lauf.
          <div className="nx-marquee__half" key={i} aria-hidden={i > 0 || undefined}>
            {list}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Über uns – links Visual mit schwebender Kennzahlen-Karte, rechts Text.
   --------------------------------------------------------------------------- */
export function About() {
  return (
    <section id="ueber-uns" className="nx-section nx-about">
      <div className="nx-wrap nx-about__grid">
        <div className="nx-about__visual" data-reveal>
          <div className="nx-about__frame" aria-hidden="true">
            <span className="nx-about__frame-icon nx-about__frame-icon--1">
              <ServiceIconSvg name="server" />
            </span>
            <span className="nx-about__frame-icon nx-about__frame-icon--2">
              <ServiceIconSvg name="shield" />
            </span>
            <span className="nx-about__frame-icon nx-about__frame-icon--3">
              <ServiceIconSvg name="globe" />
            </span>
            <span className="nx-about__frame-icon nx-about__frame-icon--4">
              <ServiceIconSvg name="code" />
            </span>
            <span className="nx-about__frame-clock">
              <ClockIcon />
            </span>
          </div>
          <div className="nx-about__float">
            {about.stats.map((stat) => (
              <div className="nx-about__float-row" key={stat.label}>
                <div className="nx-about__float-value">
                  <span data-count={stat.count}>{stat.count}</span>
                  {stat.suffix}
                </div>
                <div className="nx-about__float-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="nx-about__col">
          <div data-reveal>
            <div className="nx-kicker">{about.eyebrow}</div>
            <h2 className="nx-h2">
              {about.headline[0]}
              <br />
              <span className="nx-grad">{about.headline[1]}</span>
            </h2>
          </div>
          {about.paragraphs.map((text, i) => (
            <p key={i} className="nx-about__p" data-reveal>
              {text}
            </p>
          ))}
          <p data-reveal>
            <a href={about.cta.href} className="nx-link-arrow">
              {about.cta.label} <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Leistungen – sieben Karten. Klick auf eine Karte scrollt zum Kontakt-
   formular und belegt das Betreff-Select vor (ContactForm hört auf das
   Event `nx:select-service`). Die siebte Karte ist eine breite Feature-Karte.
   --------------------------------------------------------------------------- */
export function Services() {
  return (
    <section id="leistungen" className="nx-section nx-services">
      <div className="nx-wrap">
        <div className="nx-services__head" data-reveal>
          <div className="nx-kicker">{servicesSection.eyebrow}</div>
          <h2 className="nx-h2">
            {servicesSection.headline[0]}
            <br />
            <span className="nx-grad">{servicesSection.headline[1]}</span>
          </h2>
          <p className="nx-subline">{servicesSection.subline}</p>
        </div>

        <div className="nx-services__grid">
          {services.map((service) => (
            <a
              key={service.title}
              href="#kontakt"
              data-service={service.subject}
              data-tilt
              className={`nx-card${service.feature ? ' nx-card--feature' : ''}`}
              data-reveal
            >
              <div className="nx-card__icon">
                <ServiceIconSvg name={service.icon} />
              </div>
              <div className="nx-card__main">
                <h3 className="nx-card__title">{service.title}</h3>
                <p className="nx-card__text">{service.text}</p>
              </div>
              <ul className="nx-card__list">
                {service.bullets.map((bullet) => (
                  <li key={bullet}>
                    <span className="nx-card__check" aria-hidden="true">
                      ✓
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </div>

        <p className="nx-services__closing" data-reveal>
          {servicesSection.closing[0]}{' '}
          <a href="#kontakt" className="nx-link-arrow">
            {servicesSection.closing[1]} <span aria-hidden="true">→</span>
          </a>{' '}
          {servicesSection.closing[2]}
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Zwischen-CTA – Panel mit Cyan-Glow-Rahmen.
   --------------------------------------------------------------------------- */
export function MidCta() {
  return (
    <section className="nx-midcta nx-dark">
      <div className="nx-wrap">
        <div className="nx-midcta__panel" data-reveal>
          <div className="nx-midcta__glow" aria-hidden="true" />
          <h2 className="nx-midcta__title">
            {midCta.headline[0]}
            <br />
            <span className="nx-grad">{midCta.headline[1]}</span>
          </h2>
          <p className="nx-midcta__sub">{midCta.subline}</p>
          <div className="nx-midcta__ctas">
            <a href={midCta.primaryCta.href} className="nx-btn nx-btn--primary">
              {midCta.primaryCta.label} <span className="nx-btn__arrow" aria-hidden="true">→</span>
            </a>
            <a href={company.phoneHref} className="nx-btn nx-btn--ghost">
              <span aria-hidden="true">☎</span> {company.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------- */
export function Values() {
  return (
    <section id="werte" className="nx-section nx-values">
      <div className="nx-wrap">
        <div className="nx-values__head" data-reveal>
          <div className="nx-kicker">{values.eyebrow}</div>
          <h2 className="nx-h2">
            {values.headline[0]}
            <br />
            <span className="nx-grad">{values.headline[1]}</span>
          </h2>
        </div>

        <div className="nx-values__grid">
          {values.cards.map((card) => (
            <div key={card.title} className="nx-value" data-reveal data-tilt>
              <div className="nx-kicker nx-kicker--card">{card.label}</div>
              <div className="nx-value__head">
                <span className="nx-value__icon">
                  {card.icon === 'eye' ? <EyeIcon /> : <TargetIcon />}
                </span>
                <h3 className="nx-value__title">{card.title}</h3>
              </div>
              <p className="nx-value__text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Versprechen – Hairline-Grid: die 1-px-Lücken zeigen den Linien-Farbton.
   --------------------------------------------------------------------------- */
export function Promises() {
  return (
    <section id="versprechen" className="nx-section nx-promises">
      <div className="nx-wrap">
        <div className="nx-promises__head" data-reveal>
          <div className="nx-kicker">{promises.eyebrow}</div>
          <h2 className="nx-h2">
            {promises.headline[0]}
            <br />
            <span className="nx-grad">{promises.headline[1]}</span>
          </h2>
          <p className="nx-subline">{promises.subline}</p>
        </div>

        <div className="nx-promises__grid">
          {promises.items.map((item) => (
            <div key={item.no} className="nx-promise" data-reveal>
              <div className="nx-promise__no">{item.no}</div>
              <h3 className="nx-promise__title">{item.title}</h3>
              <p className="nx-promise__text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
