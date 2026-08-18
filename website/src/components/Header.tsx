'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { company, nav } from '@/content/site';
import { NexoMark } from './Icons';

/**
 * Sticky-Header mit Cursor-Spur.
 *
 * Die Spur nutzt einen Pool aus 14 wiederverwendeten Spans (Ring-Buffer),
 * gedrosselt auf 28 ms – exakt wie im Design-Handoff beschrieben.
 * Voraussetzung ist `overflow: hidden` am Header und `z-index: 2` auf der
 * Inhaltszeile (siehe globals.css).
 *
 * Unter 768 px zeigt der Header nur Logo und Telefon-CTA. Die Anker-Navigation
 * entfällt dort bewusst: Auf einem Onepager scrollt man ohnehin, und ein
 * Klapp-Menü liesse sich mit dem `overflow: hidden` der Cursor-Spur nur über
 * Umwege vereinbaren – das Panel läge unterhalb der Kopfzeile und würde
 * abgeschnitten. Die Abschnitte bleiben über die Buttons im Hero und den
 * Seitenfuss erreichbar.
 */

const TRAIL_DOTS = 14;
const TRAIL_THROTTLE_MS = 28;

export default function Header() {
  const headerRef = useRef<HTMLElement | null>(null);

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
        'border-radius:50%;background:radial-gradient(circle,#8FB6FF,rgba(10,92,255,0) 70%);' +
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
    <header className="nx-header nx-dark" ref={headerRef}>
      <div className="nx-header__bar">
        <Link href="/#top" className="nx-logo" aria-label={`${company.name} – zur Startseite`}>
          <span className="nx-logo__mark" style={{ color: '#fff' }}>
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

        <a className="nx-pill" href={company.phoneHref}>
          <span aria-hidden="true">☎</span>
          <span className="nx-sr">Anrufen: </span>
          {company.phoneDisplay}
        </a>
      </div>
    </header>
  );
}
