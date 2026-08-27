'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { company, nav } from '@/content/site';
import { NexoMark } from './Icons';

/**
 * Fixer Header.
 *
 * - Startet transparent über dem Hero; nach 24 px Scroll kommen Blur,
 *   Hintergrund und Hairline dazu (Klasse `is-scrolled`).
 * - Cursor-Spur: Pool aus 14 wiederverwendeten Spans (Ring-Buffer),
 *   gedrosselt auf 28 ms. Voraussetzung ist `overflow: hidden` am Header
 *   und `z-index: 2` auf der Inhaltszeile (siehe globals.css).
 * - Unter 1024 px ersetzt ein Burger-Button die Anker-Navigation. Das
 *   Menü liegt als eigenes Overlay AUSSERHALB des <header>-Elements, weil
 *   `backdrop-filter` am Header fest positionierte Nachkommen sonst an den
 *   Header binden und das `overflow: hidden` sie abschneiden würde.
 */

const TRAIL_DOTS = 14;
const TRAIL_THROTTLE_MS = 28;

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-Zustand: Blur + Border erst nach dem ersten Stück Wegstrecke.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile-Menü: Escape schließt, Hintergrund-Scrollen wird gesperrt.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Cursor-Spur im Header (nur Maus, nicht bei reduzierter Bewegung).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dots: HTMLSpanElement[] = [];
    for (let i = 0; i < TRAIL_DOTS; i++) {
      const dot = document.createElement('span');
      dot.style.cssText =
        'position:absolute;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;' +
        'border-radius:50%;background:radial-gradient(circle,#67E8F9,rgba(34,211,238,0) 70%);' +
        'opacity:0;pointer-events:none;z-index:1;transition:opacity .5s linear';
      header.appendChild(dot);
      dots.push(dot);
    }

    let index = 0;
    let last = 0;

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - last < TRAIL_THROTTLE_MS) return;
      last = now;

      const rect = header.getBoundingClientRect();
      index = (index + 1) % dots.length;
      const dot = dots[index]!;
      const scale = 0.5 + Math.random() * 1.4;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      dot.style.transition = 'none';
      dot.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      dot.style.opacity = '.95';

      requestAnimationFrame(() => {
        dot.style.transition = 'opacity .7s linear, transform .7s ease-out';
        dot.style.opacity = '0';
        dot.style.transform = `translate(${x}px, ${y - 12}px) scale(${scale * 2.1})`;
      });
    };

    header.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      header.removeEventListener('pointermove', onMove);
      dots.forEach((dot) => dot.remove());
    };
  }, []);

  return (
    <>
      <header className="nx-header nx-dark" ref={headerRef}>
        <div className="nx-header__bar">
          <Link href="/#top" className="nx-logo" aria-label={`${company.name} – zur Startseite`}>
            <span className="nx-logo__mark" style={{ color: '#06232E' }}>
              <NexoMark size={20} />
            </span>
            <span className="nx-logo__word">
              Nexo<b>IT</b>
            </span>
          </Link>

          <nav className="nx-nav" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link key={item.href} href={`/${item.href}`} className="nx-nav__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nx-header__ctas">
            <a className="nx-header__phone" href={company.phoneHref}>
              <span aria-hidden="true">☎</span>
              <span className="nx-header__phone-label">
                <span className="nx-sr">Anrufen: </span>
                {company.phoneDisplay}
              </span>
            </a>
            <Link href="/#kontakt" className="nx-header__cta">
              Kontakt
            </Link>
            <button
              type="button"
              className={`nx-burger${menuOpen ? ' is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="nx-mmenu"
              aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-Menü – bewusst außerhalb des <header> (siehe Kommentar oben). */}
      <div
        id="nx-mmenu"
        className={`nx-mmenu nx-dark${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="nx-mmenu__nav" aria-label="Mobile Navigation">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={`/${item.href}`}
              className="nx-mmenu__link"
              style={{ transitionDelay: menuOpen ? `${80 + i * 60}ms` : '0ms' }}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? undefined : -1}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nx-mmenu__footer">
          <a
            className="nx-btn nx-btn--primary"
            href={company.phoneHref}
            tabIndex={menuOpen ? undefined : -1}
          >
            <span aria-hidden="true">☎</span> {company.phoneDisplay}
          </a>
          <a
            className="nx-mmenu__mail"
            href={`mailto:${company.email}`}
            tabIndex={menuOpen ? undefined : -1}
          >
            Oder schreiben Sie uns: {company.email}
          </a>
        </div>
      </div>
    </>
  );
}
