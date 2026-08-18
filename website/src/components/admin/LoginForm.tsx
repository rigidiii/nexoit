'use client';

import { useActionState } from 'react';

import { loginAction } from '@/actions/admin';
import { initialAdminState } from '@/lib/admin-state';
import { ActionNote, SubmitButton } from './FormControls';

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAdminState);

  return (
    <form action={formAction} className="ad-form" style={{ marginTop: 22 }}>
      <ActionNote state={state} />

      <div className="ad-field">
        <label htmlFor="username">Benutzername</label>
        <input
          id="username"
          name="username"
          className="ad-input"
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="ad-field">
        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          name="password"
          type="password"
          className="ad-input"
          autoComplete="current-password"
          required
        />
      </div>

      <SubmitButton pendingLabel="Wird geprüft …">Anmelden</SubmitButton>
    </form>
  );
}
