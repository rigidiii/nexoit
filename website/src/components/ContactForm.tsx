'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { submitContact } from '@/actions/contact';
import { initialContactState } from '@/lib/contact-state';
import { CONTACT_SUBJECTS } from '@/content/contact-subjects';
import { contactSection } from '@/content/site';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="nx-btn nx-btn--primary" disabled={pending}>
      {pending ? 'Wird gesendet …' : 'Nachricht senden'}
      {!pending && (
        <span className="nx-btn__arrow" aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
}

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: 'Allgemeine Anfrage',
  message: '',
  consent: false,
};

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialContactState);
  const [formToken, setFormToken] = useState('');
  const noteRef = useRef<HTMLDivElement>(null);

  /**
   * Die Felder sind kontrolliert, weil React ein Formular nach jeder
   * abgeschlossenen Server-Aktion zurücksetzt. Unkontrolliert wäre nach einer
   * Fehlermeldung die getippte Nachricht verloren – genau dann, wenn sie noch
   * gebraucht wird. Geleert wird deshalb nur bei Erfolg, und zwar bewusst.
   */
  const [fields, setFields] = useState(EMPTY);
  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const loadToken = () =>
    fetch('/api/form-token')
      .then((res) => res.json() as Promise<{ token?: string }>)
      .then((data) => data.token && setFormToken(data.token))
      .catch(() => {
        /* Ohne Token schlägt das Absenden mit einer Hinweismeldung fehl. */
      });

  // Token beim Aufruf der Seite holen – damit beginnt zugleich die Messung der
  // Mindest-Ausfüllzeit gegen Bots.
  useEffect(() => {
    void loadToken();
  }, []);

  // Klick auf eine Leistungs-Karte belegt den Betreff vor (Event kommt von
  // den Karten in Sections.tsx, das Scrollen übernimmt der Anker #kontakt).
  useEffect(() => {
    const onSelect = (event: Event) => {
      const subject = (event as CustomEvent<string>).detail;
      if (CONTACT_SUBJECTS.includes(subject as (typeof CONTACT_SUBJECTS)[number])) {
        set('subject', subject);
      }
    };
    window.addEventListener('nx:select-service', onSelect);
    return () => window.removeEventListener('nx:select-service', onSelect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status === 'idle') return;
    if (state.status === 'ok') {
      setFields(EMPTY);
      void loadToken();
    }
    // Meldung ansteuern, damit auch Screenreader sie mitbekommen.
    noteRef.current?.focus();
  }, [state.status, state.nonce]);

  const err = state.fieldErrors;

  return (
    <form action={formAction} className="nx-form" noValidate>
      <input type="hidden" name="formToken" value={formToken} />

      {/* Honeypot – für Menschen unsichtbar, kein Tab-Stopp. */}
      <div className="nx-hp" aria-hidden="true">
        <label htmlFor="website">Bitte nicht ausfüllen</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status !== 'idle' && (
        <div
          ref={noteRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`nx-note nx-note--${state.status === 'ok' ? 'ok' : 'error'}`}
        >
          {state.message}
        </div>
      )}

      <div className="nx-form__row">
        <div className="nx-field">
          <label className="nx-field__label" htmlFor="cf-name">
            Name{' '}
            <span className="nx-field__req" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="cf-name"
            name="name"
            className="nx-input"
            type="text"
            required
            autoComplete="name"
            maxLength={100}
            placeholder="Ihr Name"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(err.name)}
            aria-describedby={err.name ? 'cf-name-err' : undefined}
          />
          {err.name && (
            <span id="cf-name-err" className="nx-form__hint nx-form__error">
              {err.name}
            </span>
          )}
        </div>

        <div className="nx-field">
          <label className="nx-field__label" htmlFor="cf-email">
            E-Mail{' '}
            <span className="nx-field__req" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="cf-email"
            name="email"
            className="nx-input"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            placeholder="name@firma.de"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={Boolean(err.email)}
            aria-describedby={err.email ? 'cf-email-err' : undefined}
          />
          {err.email && (
            <span id="cf-email-err" className="nx-form__hint nx-form__error">
              {err.email}
            </span>
          )}
        </div>
      </div>

      <div className="nx-form__row">
        <div className="nx-field">
          <label className="nx-field__label" htmlFor="cf-phone">
            Telefon <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            id="cf-phone"
            name="phone"
            className="nx-input"
            type="tel"
            autoComplete="tel"
            maxLength={60}
            placeholder="Für den schnellen Rückruf"
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div className="nx-field">
          <label className="nx-field__label" htmlFor="cf-subject">
            Betreff
          </label>
          <select
            id="cf-subject"
            name="subject"
            className="nx-select"
            value={fields.subject}
            onChange={(e) => set('subject', e.target.value)}
          >
            {CONTACT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="nx-field">
        <label className="nx-field__label" htmlFor="cf-message">
          Nachricht{' '}
          <span className="nx-field__req" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          className="nx-textarea"
          required
          minLength={10}
          maxLength={5000}
          placeholder="Wobei dürfen wir Sie unterstützen?"
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          aria-invalid={Boolean(err.message)}
          aria-describedby={err.message ? 'cf-message-err' : undefined}
        />
        {err.message && (
          <span id="cf-message-err" className="nx-form__hint nx-form__error">
            {err.message}
          </span>
        )}
      </div>

      <label className="nx-consent" htmlFor="cf-consent">
        <input
          id="cf-consent"
          name="consent"
          type="checkbox"
          required
          checked={fields.consent}
          onChange={(e) => set('consent', e.target.checked)}
        />
        <span>
          Ich willige ein, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert und
          verarbeitet werden. Die Einwilligung kann jederzeit per E-Mail widerrufen werden. Weitere
          Informationen in der <Link href="/datenschutz">Datenschutzerklärung</Link>.
          {err.consent && (
            <strong className="nx-form__error" style={{ display: 'block' }}>{err.consent}</strong>
          )}
        </span>
      </label>

      <div className="nx-form__actions">
        <SubmitButton />
        <span className="nx-form__hint">{contactSection.formHint}</span>
      </div>
    </form>
  );
}
