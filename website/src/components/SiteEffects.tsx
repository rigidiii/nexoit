'use client';

import { useEffect } from 'react';

/**
 * Bündelt die scroll- und mausabhängigen Effekte der Startseite:
 * Scroll-Reveal, Fortschrittsleiste, mausfolgender Glow und Orbit-Parallax.
 *
 * Der Prototyp arbeitete mit Inline-Styles und einem Sicherheits-Timeout für
 * die Preview-Umgebung. Hier genügt der IntersectionObserver, der lediglich
 * die Klasse `is-visible` setzt – die Übergänge stehen im Stylesheet.
 */
export default function SiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    // --- Scroll-Reveal ---------------------------------------------------
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
    } else {
      items.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${(i % 3) * 0.08}s`);
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );
      items.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // --- Fortschrittsleiste + Orbit-Parallax ------------------------------
    const bar = document.querySelector<HTMLElement>('[data-progress]');
    const orbits = document.querySelector<HTMLElement>('[data-orbits]');

    if (bar || orbits) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const top = window.scrollY;
        if (bar) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.width = `${max > 0 ? Math.min(100, (top / max) * 100) : 0}%`;
        }
        if (orbits && !reduceMotion) {
          orbits.style.setProperty('--parallax', `${-top * 0.05}px`);
          orbits.style.transform = `translateY(${-top * 0.05}px)`;
        }
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    }

    // --- Glow folgt der Maus ---------------------------------------------
    const glow = document.querySelector<HTMLElement>('[data-glow]');
    if (glow && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const onMove = (event: MouseEvent) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 90;
        const y = (event.clientY / window.innerHeight - 0.5) * 60;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      cleanups.push(() => window.removeEventListener('mousemove', onMove));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
