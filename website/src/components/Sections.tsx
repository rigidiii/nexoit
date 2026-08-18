import { about, marqueeItems, midCta, promises, services, values } from '@/content/site';
import { EyeIcon, ServiceIconSvg, TargetIcon } from './Icons';

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
    <span key={item}>
      {item}
      <span aria-hidden="true"> ·</span>
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

/* --------------------------------------------------------------------------- */
export function About() {
  return (
    <section id="ueber-uns" className="nx-section nx-about">
      <div className="nx-wrap nx-about__grid">
        <div className="nx-about__sticky" data-reveal>
          <div className="nx-eyebrow">{about.eyebrow}</div>
          <h2 className="nx-h2">
            {about.headline[0]}
            <br />
            {about.headline[1]}
          </h2>
          <p className="nx-about__lead">{about.lead}</p>
          <a href={about.cta.href} className="nx-btn nx-btn--ink">
            {about.cta.label} <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="nx-about__col">
          {about.paragraphs.map((text, i) => (
            <p
              key={i}
              className={`nx-about__p${i === 0 ? ' nx-about__p--strong' : ''}`}
              data-reveal
            >
              {text}
            </p>
          ))}
          <p className="nx-about__quote" data-reveal>
            {about.quote}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Leistungen – die Karten haben bewusst keinen Hover-Effekt.
   Einflug-Richtung je Karte in Lesereihenfolge: links, unten, rechts, …
   --------------------------------------------------------------------------- */
export function Services() {
  return (
    <section id="leistungen" className="nx-section nx-services">
      <div className="nx-wrap">
        <div className="nx-services__head" data-reveal>
          <div className="nx-eyebrow">IT-Services, die zu Ihnen passen</div>
          <h2 className="nx-h2">
            Individuelle Lösungen
            <br />
            <span>für Ihr Unternehmen</span>
          </h2>
        </div>

        <div className="nx-services__grid">
          {services.map((service) => {
            const body = (
              <>
                <div className="nx-card__icon">
                  <ServiceIconSvg name={service.icon} />
                </div>
                <h3 className="nx-card__title">{service.title}</h3>
                <p className="nx-card__text">{service.text}</p>
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
              </>
            );

            return (
              <article
                key={service.title}
                className={`nx-card${service.inverted ? ' nx-card--dark nx-dark' : ''}`}
                data-reveal
                data-fly={service.fly}
              >
                {service.inverted ? (
                  <>
                    <div className="nx-card__wash" aria-hidden="true" />
                    <div className="nx-card__body">{body}</div>
                  </>
                ) : (
                  body
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------- */
export function MidCta() {
  return (
    <section className="nx-midcta nx-dark">
      <div className="nx-midcta__lines" aria-hidden="true" />
      <div className="nx-midcta__inner" data-reveal>
        <div className="nx-midcta__kicker">
          {midCta.kicker[0]}
          <br />
          {midCta.kicker[1]}
        </div>
        <h2 className="nx-midcta__title">{midCta.headline}</h2>
        <a href={midCta.cta.href} className="nx-btn nx-btn--light">
          {midCta.cta.label} <span aria-hidden="true">→</span>
        </a>
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
          <div className="nx-eyebrow">{values.eyebrow}</div>
          <h2 className="nx-h2">{values.headline}</h2>
          <p className="nx-subline">{values.subline}</p>
        </div>

        <div className="nx-values__grid">
          {values.cards.map((card) => (
            <div key={card.title} className="nx-value" data-reveal>
              <div className="nx-value__head">
                <span
                  className={`nx-value__icon nx-value__icon--${card.icon === 'eye' ? 'accent' : 'ink'}`}
                >
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
   Versprechen – Hairline-Grid: die 1-px-Lücken zeigen den Container-Hintergrund.
   --------------------------------------------------------------------------- */
export function Promises() {
  return (
    <section id="versprechen" className="nx-section nx-promises">
      <div className="nx-wrap">
        <div className="nx-promises__head" data-reveal>
          <div className="nx-eyebrow">{promises.eyebrow}</div>
          <h2 className="nx-h2">
            {promises.headline[0]}
            <br />
            {promises.headline[1]}
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
