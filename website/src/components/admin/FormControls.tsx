'use client';

import { useFormStatus } from 'react-dom';

import type { AdminActionState } from '@/lib/admin-state';

/**
 * Kleine Bausteine für die Formulare im Verwaltungsbereich.
 * Der Absende-Zustand kommt von useFormStatus und braucht deshalb ein
 * Client-Component direkt innerhalb des <form>.
 */

export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  formAction,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: 'primary' | 'ghost' | 'danger';
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`ad-btn ad-btn--${variant}`}
      disabled={pending}
      formAction={formAction}
      name={name}
      value={value}
    >
      {pending ? (pendingLabel ?? 'Bitte warten …') : children}
    </button>
  );
}

/** Rückmeldung einer Aktion, für Screenreader angekündigt. */
export function ActionNote({ state }: { state: AdminActionState }) {
  if (state.status === 'idle') return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`ad-note ad-note--${state.status === 'ok' ? 'ok' : 'error'}`}
    >
      {state.message}
    </div>
  );
}
