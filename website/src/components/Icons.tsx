import type { ServiceIcon } from '@/content/site';

/**
 * Alle Icons als Inline-SVG (Stil Lucide/Feather, 24 px, stroke: currentColor,
 * stroke-width 1.8). Inline, damit sie Farbe und Größe des Elternelements
 * erben und kein zusätzlicher Request nötig ist.
 */

/** Nexo-„N" aus den Markenassets. Erbt Farbe über `stroke="currentColor"`. */
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
};

export function ServiceIconSvg({ name }: { name: ServiceIcon }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...strokeProps}>
      {servicePaths[name]}
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
