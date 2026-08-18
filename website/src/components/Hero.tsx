import { hero } from '@/content/site';
import HeroTrail from './HeroTrail';
import { NexoMark, OrbitIconSvg, type OrbitIcon } from './Icons';

/**
 * Hero-Bereich.
 *
 * Z-Reihenfolge der Schichten (siehe globals.css):
 *   0 Raster · 1 Glow · 2 Beams · 3 Mausspur · 10 Inhalt
 * Die Mausspur liegt damit hinter Headline, Subline und Buttons.
 */
export default function Hero() {
  return (
    <section id="top" className="nx-hero nx-dark">
      <div className="nx-hero__grid-bg" aria-hidden="true" />
      <div className="nx-hero__glow" data-glow aria-hidden="true" />
      <div className="nx-hero__beams" aria-hidden="true">
        <span className="nx-beam nx-beam--1" />
        <span className="nx-beam nx-beam--2" />
        <span className="nx-beam nx-beam--3" />
      </div>
      <HeroTrail />

      <div className="nx-hero__inner">
        <div>
          <h1 className="nx-hero__title" data-reveal>
            {hero.headline[0]}
            <br />
            {hero.headline[1]}
          </h1>

          <p className="nx-hero__sub" data-reveal>
            {hero.subline}
          </p>

          <div className="nx-hero__ctas" data-reveal>
            <a href={hero.primaryCta.href} className="nx-btn nx-btn--primary">
              {hero.primaryCta.label} <span className="nx-btn__arrow" aria-hidden="true">→</span>
            </a>
            <a href={hero.secondaryCta.href} className="nx-btn nx-btn--ghost">
              {hero.secondaryCta.label}
            </a>
          </div>

          <div className="nx-stats" data-reveal>
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <div className="nx-stats__value">{stat.value}</div>
                <div className="nx-stats__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="nx-orbits" data-reveal data-orbits aria-hidden="true">
          <div className="nx-orbit nx-orbit--outer">
            <span />
          </div>
          <div className="nx-orbit nx-orbit--inner">
            <span />
          </div>
          <div className="nx-orbit nx-orbit--disc" />
          <div className="nx-orbit__core" style={{ color: '#fff' }}>
            <NexoMark size={58} />
            <span />
          </div>

          {/* IT-Symbole auf dem Innenring, rund um die Wortmarke. */}
          {hero.orbitIcons.map((chip) => (
            <span
              key={chip.icon}
              className="nx-chip"
              style={{ '--chip-x': `${chip.x}px`, '--chip-y': `${chip.y}px` } as React.CSSProperties}
            >
              <span className="nx-chip__tile" style={{ animationDuration: `${chip.float}s` }}>
                <OrbitIconSvg name={chip.icon as OrbitIcon} />
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
