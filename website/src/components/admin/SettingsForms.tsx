'use client';

import { useActionState, useState } from 'react';

import {
  changePasswordAction,
  purgeStatsAction,
  savePrivacyAction,
} from '@/actions/admin';
import { initialAdminState } from '@/lib/admin-state';
import { ActionNote, SubmitButton } from './FormControls';

/** Datenschutz-Einstellungen der Reichweitenmessung. */
export function PrivacyForm({
  retentionDays,
  respectDnt,
  analyticsEnabled,
}: {
  retentionDays: number;
  respectDnt: boolean;
  analyticsEnabled: boolean;
}) {
  const [state, formAction] = useActionState(savePrivacyAction, initialAdminState);
  // Kontrolliert, weil React das Formular nach der Aktion zurücksetzt und die
  // Anzeige sonst kurzzeitig wieder die alten Werte zeigen würde.
  const [form, setForm] = useState({
    analyticsEnabled,
    respectDnt,
    retentionDays: String(retentionDays),
  });

  return (
    <form action={formAction} className="ad-card">
      <h2 className="ad-card__title">Reichweitenmessung</h2>
      <p className="ad-card__hint">
        Diese Einstellungen wirken sofort. Werden sie geändert, muss der entsprechende Abschnitt der
        Datenschutzerklärung angepasst werden.
      </p>

      <div className="ad-form" style={{ marginTop: 20 }}>
        <ActionNote state={state} />

        <label className="ad-check">
          <input
            type="checkbox"
            name="analyticsEnabled"
            checked={form.analyticsEnabled}
            onChange={(e) => setForm((f) => ({ ...f, analyticsEnabled: e.target.checked }))}
          />
          <span>
            Messung aktiv
            <small>
              Ausgeschaltet werden keine neuen Aufrufe erfasst. Bereits erfasste Daten bleiben
              erhalten.
            </small>
          </span>
        </label>

        <label className="ad-check">
          <input
            type="checkbox"
            name="respectDnt"
            checked={form.respectDnt}
            onChange={(e) => setForm((f) => ({ ...f, respectDnt: e.target.checked }))}
          />
          <span>
            „Do Not Track" und „Global Privacy Control" beachten
            <small>
              Empfohlen. Browser mit aktiviertem Signal werden dann gar nicht erst gezählt.
            </small>
          </span>
        </label>

        <div className="ad-field" style={{ maxWidth: 260 }}>
          <label htmlFor="retentionDays">Aufbewahrungsdauer in Tagen</label>
          <input
            id="retentionDays"
            name="retentionDays"
            type="number"
            min={0}
            max={3650}
            className="ad-input"
            value={form.retentionDays}
            onChange={(e) => setForm((f) => ({ ...f, retentionDays: e.target.value }))}
          />
          <span className="ad-field__hint">
            Ältere Messwerte werden automatisch gelöscht. 0 bedeutet unbegrenzt – aus
            Datenschutzsicht nicht empfohlen.
          </span>
        </div>

        <div className="ad-actions">
          <SubmitButton pendingLabel="Wird gespeichert …">Speichern</SubmitButton>
        </div>
      </div>
    </form>
  );
}

/** Passwortwechsel des Admin-Kontos. */
export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialAdminState);

  return (
    <form action={formAction} className="ad-card">
      <h2 className="ad-card__title">Passwort ändern</h2>
      <p className="ad-card__hint">
        Nach dem Wechsel bleiben Sie hier angemeldet; alle anderen Sitzungen werden beendet.
      </p>

      <div className="ad-form" style={{ marginTop: 20 }}>
        <ActionNote state={state} />

        <div className="ad-field" style={{ maxWidth: 380 }}>
          <label htmlFor="currentPassword">Aktuelles Passwort</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            className="ad-input"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="ad-row" style={{ maxWidth: 780 }}>
          <div className="ad-field">
            <label htmlFor="newPassword">Neues Passwort</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="ad-input"
              autoComplete="new-password"
              minLength={12}
              required
            />
            <span className="ad-field__hint">Mindestens 12 Zeichen.</span>
          </div>
          <div className="ad-field">
            <label htmlFor="repeatPassword">Neues Passwort wiederholen</label>
            <input
              id="repeatPassword"
              name="repeatPassword"
              type="password"
              className="ad-input"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>
        </div>

        <div className="ad-actions">
          <SubmitButton pendingLabel="Wird geändert …">Passwort ändern</SubmitButton>
        </div>
      </div>
    </form>
  );
}

/** Vollständiges Löschen der Statistikdaten. */
export function PurgeForm({ storedRows }: { storedRows: number }) {
  const [state, formAction] = useActionState(purgeStatsAction, initialAdminState);

  return (
    <form action={formAction} className="ad-card">
      <h2 className="ad-card__title">Statistikdaten löschen</h2>
      <p className="ad-card__hint">
        Entfernt alle {storedRows.toLocaleString('de-DE')} gespeicherten Seitenaufrufe sowie die
        Tagesschlüssel. Der Vorgang lässt sich nicht rückgängig machen. Kontaktanfragen sind davon
        nicht betroffen.
      </p>

      <div className="ad-form" style={{ marginTop: 20 }}>
        <ActionNote state={state} />

        <div className="ad-field" style={{ maxWidth: 320 }}>
          <label htmlFor="confirm">Zur Bestätigung „LOESCHEN" eintragen</label>
          <input id="confirm" name="confirm" className="ad-input" autoComplete="off" />
        </div>

        <div className="ad-actions">
          <SubmitButton variant="danger" pendingLabel="Wird gelöscht …">
            Alle Statistikdaten löschen
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
