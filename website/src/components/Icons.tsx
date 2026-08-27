import type { ServiceIcon } from '@/content/site';

/**
 * Alle Icons als Inline-SVG (Stil Lucide/Feather, 24 px, stroke: currentColor,
 * stroke-width 1.8). Inline, damit sie Farbe und Größe des Elternelements
 * erben und kein zusätzlicher Request nötig ist.
 */

/** Nexo-„N“ aus den Markenassets. Erbt Farbe über `stroke="currentColor"`. */
export function NexoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <path
        d="M30.7 69.1 L30.7 28.8 L36.5 28.8 L65.3 59.5 L65.3 28.8"
        stroke="currentColor"
        strokeWidth="8.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="65.3" cy="28.8" r="6.7" fill="currentColor" />
    </svg>
  );
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const servicePaths: Record<ServiceIcon, React.ReactNode> = {
  server: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3C9.5 5.5 9.5 18.5 12 21" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18M8 22h8" />
    </>
  ),
  backup: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chart: <path d="M4 18V9M10 18V5M16 18v-6M22 18V3" />,
  shield: (
    <>
      <path d="M12 3l8 4v5c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V7l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  code: (
    <>
      <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
      <path d="M13.5 4l-3 16" />
    </>
  ),
};

export function ServiceIconSvg({ name }: { name: ServiceIcon }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      {servicePaths[name]}
    </svg>
  );
}

/**
 * Symbole für die Orbit-Grafik im Hero: Server, Netzwerk, Cloud, Sicherheit,
 * Datenbank. Gleicher Zeichenstil wie die Leistungs-Icons, damit die Grafik
 * nicht wie ein Fremdkörper wirkt.
 */
export type OrbitIcon = 'server' | 'network' | 'cloud' | 'shield' | 'database' | 'code';

const orbitPaths: Record<OrbitIcon, React.ReactNode> = {
  server: servicePaths.server,
  shield: servicePaths.shield,
  code: servicePaths.code,
  network: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <circle cx="5" cy="19.5" r="2" />
      <circle cx="19" cy="19.5" r="2" />
      <path d="M12 6.5v5M12 11.5 6.2 17.9M12 11.5l5.8 6.4" />
    </>
  ),
  cloud: <path d="M6.5 19a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 17.7 9.4 3.8 3.8 0 0 1 17.5 19H6.5z" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </>
  ),
};

export function OrbitIconSvg({ name }: { name: OrbitIcon }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      {orbitPaths[name]}
    </svg>
  );
}

/** Icons für die Kontakt-Karten (Telefon, WhatsApp, E-Mail, Öffnungszeiten). */
export function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2.05z" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M9.5 9.5c.5 2.5 2.5 4.5 5 5l1-1.2c.2-.3.6-.4.9-.2l1.6 1" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}
