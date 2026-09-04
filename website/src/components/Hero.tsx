import { hero } from '@/content/site';
import HeroTrail from './HeroTrail';
import { NexoMark, OrbitIconSvg, type OrbitIcon } from './Icons';

/**
 * Hero-Bereich.
 *
 * Z-Reihenfolge der Schichten (siehe globals.css):
 *   0 Raster · 1 Radial-Glows · 2 Beams · 3 Mausspur · 10 Inhalt
 * Die Mausspur liegt damit hinter Headline, Subline und Buttons.
 *
 * Das Orbit-Visual ist reines CSS/SVG: drei rotierende Ringe mit
 * Leuchtpunkten, Icon-Knoten auf dem mittleren Ring, pulsierende
 * Verbindungslinien zum Kern und driftende Partikel.
 */

/** Driftende Partikel-Punkte: Position (Versatz vom Zentrum) und Takt. */
const PARTICLES = [
  { x: -205, y: -95, dur: 7, delay: 0 },
  { x: 120, y: -185, dur: 9, delay: 1.2 },
  { x: 215, y: 105, dur: 8, delay: 0.6 },
  { x: -110, y: 195, dur: 10, delay: 2 },
  { x: -225, y: 55, dur: 7.5, delay: 1.6 },
  { x: 65, y: 220, dur: 9.5, delay: 0.3 },
] as const;

export default function Hero() {
  return (
    <section id="top" className="nx-hero nx-dark">
      <div className="nx-hero__grid-bg" aria-hidden="true" />
      <div className="nx-hero__glow" data-glow aria-hidden="true" />
      <div className="nx-hero__glow nx-hero__glow--2" aria-hidden="true" />
      <div className="nx-hero__beams" aria-hidden="true">
        <span className="nx-beam nx-beam--1" />
        <span className="nx-beam nx-beam--2" />
        <span className="nx-beam nx-beam--3" />
      </div>
      <HeroTrail />

      <div className="nx-hero__inner">
        <div>
          <p className="nx-hero__pill" data-reveal>
            <span className="nx-pulse-dot" aria-hidden="true" />
            {hero.statusPill}
          </p>

          <h1 className="nx-hero__title" data-reveal>
            {hero.headline[0]}
            <br />
            <span className="nx-grad">{hero.headline[1]}</span>
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

          <ul className="nx-hero__trust" data-reveal>
            {hero.trust.map((item) => (
              <li key={item}>
                <span className="nx-hero__trust-check" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="nx-stats" data-reveal>
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <div className="nx-stats__value">
                  <span data-count={stat.count}>
                    {stat.count}
                  </span>
                  {stat.suffix}
                </div>
                <div className="nx-stats__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="nx-orbits" data-reveal data-orbits aria-hidden="true">
          {/* Pulsierende Verbindungslinien vom Kern zu den Icon-Knoten. */}
          <svg className="nx-orbits__links" viewBox="0 0 480 480" focusable="false">
            <line x1="240" y1="240" x2="240" y2="80" />
            <line x1="240" y1="240" x2="400" y2="240" />
            <line x1="240" y1="240" x2="240" y2="400" />
            <line x1="240" y1="240" x2="80" y2="240" />
          </svg>

          <div className="nx-orbit nx-orbit--outer">
            <span />
            <span className="nx-orbit__sat nx-orbit__sat--2" />
          </div>
          <div className="nx-orbit nx-orbit--mid">
            <span />
          </div>
          <div className="nx-orbit nx-orbit--inner">
            <span />
          </div>
          <div className="nx-orbit nx-orbit--disc" />
          <div className="nx-orbit__core" style={{ color: '#06232E' }}>
            <NexoMark size={80} />
            <span />
          </div>

          {/* IT-Symbole auf dem mittleren Ring, rund um die Wortmarke. */}
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

          {/* Driftende Partikel. */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="nx-particle"
              style={
                {
                  '--px': `${p.x}px`,
                  '--py': `${p.y}px`,
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
