'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { smtpAction } from '@/actions/admin';
import { initialAdminState } from '@/lib/admin-state';
import { ActionNote } from './FormControls';

/** SMTP-Einstellungen ohne das Passwort – das verlässt den Server nie. */
export interface SmtpFormValues {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  replyToSender: boolean;
  autoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
  allowInvalidCert: boolean;
  /** Ob bereits ein Passwort gespeichert ist. */
  hasPassword: boolean;
}

type Encryption = 'tls' | 'starttls' | 'none';

interface FormState {
  host: string;
  port: string;
  encryption: Encryption;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  replyToSender: boolean;
  autoReply: boolean;
  autoReplySubject: string;
  autoReplyBody: string;
  allowInvalidCert: boolean;
}

/** Schaltfläche, die zusätzlich die Absicht mitschickt. */
function IntentButton({
  intent,
  variant,
  pendingLabel,
  children,
}: {
  intent: 'save' | 'verify' | 'test';
  variant: 'primary' | 'ghost';
  pendingLabel: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      className={`ad-btn ad-btn--${variant}`}
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export default function SmtpForm({ values }: { values: SmtpFormValues }) {
  const [state, formAction] = useActionState(smtpAction, initialAdminState);

  /**
   * Alle Felder sind bewusst kontrolliert (React-State statt defaultValue):
   * React setzt ein Formular nach jeder abgeschlossenen Server-Aktion zurück.
   * Mit unkontrollierten Feldern wären nach „Verbindung prüfen" oder
   * „Testmail senden" alle noch ungespeicherten Eingaben verloren.
   */
  const [form, setForm] = useState<FormState>({
    host: values.host,
    port: String(values.port),
    encryption: values.secure ? 'tls' : values.requireTls ? 'starttls' : 'none',
    user: values.user,
    password: '',
    fromName: values.fromName,
    fromEmail: values.fromEmail,
    toEmail: values.toEmail,
    replyToSender: values.replyToSender,
    autoReply: values.autoReply,
    autoReplySubject: values.autoReplySubject,
    autoReplyBody: values.autoReplyBody,
    allowInvalidCert: values.allowInvalidCert,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form action={formAction} className="ad-stack">
      <ActionNote state={state} />

      <section className="ad-card">
        <h2 className="ad-card__title">Verbindung</h2>
        <p className="ad-card__hint">
          Zugangsdaten des Postausgangsservers, über den Anfragen aus dem Kontaktformular versendet
          werden. Das Passwort wird verschlüsselt (AES-256-GCM) in der Datenbank abgelegt und nie an
          den Browser zurückgegeben.
        </p>

        <div className="ad-form" style={{ marginTop: 20 }}>
          <div className="ad-row">
            <div className="ad-field" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="host">SMTP-Host</label>
              <input
                id="host"
                name="host"
                className="ad-input"
                value={form.host}
                onChange={(e) => set('host', e.target.value)}
                placeholder="mail.ihr-provider.de"
                autoComplete="off"
                required
              />
            </div>
            <div className="ad-field">
              <label htmlFor="port">Port</label>
              <input
                id="port"
                name="port"
                type="number"
                min={1}
                max={65535}
                className="ad-input"
                value={form.port}
                onChange={(e) => set('port', e.target.value)}
              />
              <span className="ad-field__hint">465 für TLS, 587 für STARTTLS</span>
            </div>
          </div>

          <div className="ad-field">
            <label htmlFor="encryption">Verschlüsselung</label>
            <select
              id="encryption"
              name="encryption"
              className="ad-select"
              value={form.encryption}
              onChange={(e) => set('encryption', e.target.value as Encryption)}
            >
              <option value="tls">TLS / SSL (implizit, meist Port 465)</option>
              <option value="starttls">STARTTLS (erzwungen, meist Port 587)</option>
              <option value="none">Ohne Verschlüsselung</option>
            </select>
            {form.encryption === 'none' && (
              <span className="ad-field__hint" style={{ color: 'var(--ad-error)' }}>
                Ohne Verschlüsselung werden Zugangsdaten und Nachrichteninhalte im Klartext
                übertragen. Nur in einem abgeschotteten Netz vertretbar.
              </span>
            )}
          </div>

          <div className="ad-row">
            <div className="ad-field">
              <label htmlFor="user">Benutzername</label>
              <input
                id="user"
                name="user"
                className="ad-input"
                value={form.user}
                onChange={(e) => set('user', e.target.value)}
                autoComplete="off"
                placeholder="meist die vollständige E-Mail-Adresse"
              />
              <span className="ad-field__hint">
                Leer lassen, wenn der Server keine Anmeldung verlangt.
              </span>
            </div>
            <div className="ad-field">
              <label htmlFor="password">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                className="ad-input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
                placeholder={values.hasPassword ? 'gespeichert – leer lassen zum Beibehalten' : ''}
              />
              <span className="ad-field__hint">
                {values.hasPassword
                  ? 'Ein Passwort ist hinterlegt. Nur ausfüllen, um es zu ersetzen.'
                  : 'Noch kein Passwort hinterlegt.'}
              </span>
            </div>
          </div>

          <label className="ad-check">
            <input
              type="checkbox"
              name="allowInvalidCert"
              checked={form.allowInvalidCert}
              onChange={(e) => set('allowInvalidCert', e.target.checked)}
            />
            <span>
              Zertifikatsprüfung abschalten
              <small>
                Nur für Testsysteme mit selbstsigniertem Zertifikat. Im Produktivbetrieb
                ausgeschaltet lassen – sonst sind Man-in-the-Middle-Angriffe möglich.
              </small>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-card">
        <h2 className="ad-card__title">Absender und Empfänger</h2>
        <div className="ad-form" style={{ marginTop: 18 }}>
          <div className="ad-row">
            <div className="ad-field">
              <label htmlFor="fromName">Absendername</label>
              <input
                id="fromName"
                name="fromName"
                className="ad-input"
                value={form.fromName}
                onChange={(e) => set('fromName', e.target.value)}
              />
            </div>
            <div className="ad-field">
              <label htmlFor="fromEmail">Absenderadresse</label>
              <input
                id="fromEmail"
                name="fromEmail"
                type="email"
                className="ad-input"
                value={form.fromEmail}
                onChange={(e) => set('fromEmail', e.target.value)}
                placeholder="noreply@nexoit.de"
                required
              />
              <span className="ad-field__hint">
                Muss zum SMTP-Konto passen, sonst weisen viele Server die Mail ab.
              </span>
            </div>
            <div className="ad-field">
              <label htmlFor="toEmail">Anfragen zustellen an</label>
              <input
                id="toEmail"
                name="toEmail"
                type="email"
                className="ad-input"
                value={form.toEmail}
                onChange={(e) => set('toEmail', e.target.value)}
                required
              />
            </div>
          </div>

          <label className="ad-check">
            <input
              type="checkbox"
              name="replyToSender"
              checked={form.replyToSender}
              onChange={(e) => set('replyToSender', e.target.checked)}
            />
            <span>
              Antwortadresse auf den Absender setzen
              <small>
                Ein Klick auf „Antworten" im Postfach geht dann direkt an die Person, die das
                Formular ausgefüllt hat.
              </small>
            </span>
          </label>
        </div>
      </section>

      <section className="ad-card">
        <h2 className="ad-card__title">Eingangsbestätigung</h2>
        <div className="ad-form" style={{ marginTop: 18 }}>
          <label className="ad-check">
            <input
              type="checkbox"
              name="autoReply"
              checked={form.autoReply}
              onChange={(e) => set('autoReply', e.target.checked)}
            />
            <span>
              Automatische Bestätigung an den Absender senden
              <small>
                Platzhalter: <code>{'{{name}}'}</code>, <code>{'{{betreff}}'}</code>,{' '}
                <code>{'{{message}}'}</code>
              </small>
            </span>
          </label>

          <div className="ad-field">
            <label htmlFor="autoReplySubject">Betreff</label>
            <input
              id="autoReplySubject"
              name="autoReplySubject"
              className="ad-input"
              value={form.autoReplySubject}
              onChange={(e) => set('autoReplySubject', e.target.value)}
              disabled={!form.autoReply}
            />
          </div>

          <div className="ad-field">
            <label htmlFor="autoReplyBody">Text</label>
            <textarea
              id="autoReplyBody"
              name="autoReplyBody"
              className="ad-textarea"
              value={form.autoReplyBody}
              onChange={(e) => set('autoReplyBody', e.target.value)}
              disabled={!form.autoReply}
            />
          </div>
        </div>
      </section>

      <div className="ad-actions">
        <IntentButton intent="save" variant="primary" pendingLabel="Wird gespeichert …">
          Einstellungen speichern
        </IntentButton>
        <IntentButton intent="verify" variant="ghost" pendingLabel="Verbindung wird geprüft …">
          Verbindung prüfen
        </IntentButton>
        <IntentButton intent="test" variant="ghost" pendingLabel="Testmail wird gesendet …">
          Testmail senden
        </IntentButton>
      </div>
    </form>
  );
}
