'use client';

import { useEffect } from 'react';

/**
 * Bündelt die scroll- und mausabhängigen Effekte der Startseite:
 * Scroll-Reveal, Fortschrittsleiste, mausfolgender Glow, Orbit-Parallax,
 * hochzählende Kennzahlen, 3D-Tilt auf Karten und die Betreff-Vorbelegung
 * beim Klick auf eine Leistungs-Karte.
 *
 * Der IntersectionObserver setzt lediglich die Klasse `is-visible` – die
 * Übergänge stehen im Stylesheet.
 */

/** easeOutCubic – wirkt wie ein sanftes Auslaufen beim Hochzählen. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function SiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cleanups: Array<() => void> = [];

    // --- Scroll-Reveal ---------------------------------------------------
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
    } else {
      items.forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${(i % 4) * 0.09}s`);
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
      );
      items.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // --- Hochzählende Kennzahlen (24/7, 100 %, 7) -------------------------
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
    if (counters.length && !reduceMotion) {
      const animate = (el: HTMLElement) => {
        const target = Number(el.dataset.count ?? '0');
        if (!Number.isFinite(target) || target <= 0) return;
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          el.textContent = String(Math.round(easeOut(t) * target));
          if (t < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      };
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animate(entry.target as HTMLElement);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.4 },
      );
      counters.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // --- 3D-Tilt auf Karten (nur Maus, max. ~5°, ohne reduced-motion) -----
    if (finePointer && !reduceMotion) {
      const tiltCards = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
      const MAX_TILT = 5;
      const listeners: Array<[HTMLElement, string, EventListener]> = [];

      tiltCards.forEach((card) => {
        const onMove: EventListener = (event) => {
          const e = event as MouseEvent;
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transition = 'transform 80ms linear';
          card.style.transform =
            `perspective(800px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) ` +
            `rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-4px)`;
        };
        const onLeave: EventListener = () => {
          card.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
          card.style.transform = '';
        };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        listeners.push([card, 'mousemove', onMove], [card, 'mouseleave', onLeave]);
      });

      cleanups.push(() => {
        listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
      });
    }

    // --- Klick auf Leistungs-Karte: Betreff im Formular vorbelegen --------
    const serviceLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-service]'));
    const onServiceClick = (event: Event) => {
      const link = (event.currentTarget as HTMLElement).dataset.service;
      if (link) window.dispatchEvent(new CustomEvent('nx:select-service', { detail: link }));
      // Das Scrollen übernimmt der href="#kontakt"-Anker.
    };
    serviceLinks.forEach((el) => el.addEventListener('click', onServiceClick));
    cleanups.push(() => {
      serviceLinks.forEach((el) => el.removeEventListener('click', onServiceClick));
    });

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
    if (glow && !reduceMotion && finePointer) {
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
