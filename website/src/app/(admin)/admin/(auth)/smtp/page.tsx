import { getSmtpSettings, isSmtpConfigured } from '@/lib/settings';
import SmtpForm from '@/components/admin/SmtpForm';

export const dynamic = 'force-dynamic';

/**
 * SMTP-Konfiguration.
 *
 * Das gespeicherte Passwort wird bewusst nicht an den Browser gesendet –
 * übergeben wird nur, ob überhaupt eines hinterlegt ist.
 */
export default async function SmtpPage() {
  const settings = getSmtpSettings();
  const ready = isSmtpConfigured(settings);

  return (
    <>
      <header className="ad__head">
        <div>
          <h1 className="ad__title">SMTP-Server</h1>
          <p className="ad__lead">
            Über diesen Postausgangsserver stellt die Webseite Anfragen aus dem Kontaktformular zu.
            Jede Anfrage wird zusätzlich in der Datenbank gespeichert – auch wenn der Versand einmal
            fehlschlägt, geht nichts verloren.
          </p>
        </div>
        <span className={`ad-pill ad-pill--${ready ? 'ok' : 'error'}`}>
          {ready ? 'Konfiguriert' : 'Nicht konfiguriert'}
        </span>
      </header>

      {!ready && (
        <div className="ad-note ad-note--info" style={{ marginBottom: 18 }}>
          Tragen Sie Host, Absender- und Empfängeradresse ein und prüfen Sie anschließend die
          Verbindung. Erst danach versendet das Kontaktformular E-Mails.
        </div>
      )}

      <SmtpForm
        values={{
          host: settings.host,
          port: settings.port,
          secure: settings.secure,
          requireTls: settings.requireTls,
          user: settings.user,
          fromName: settings.fromName,
          fromEmail: settings.fromEmail,
          toEmail: settings.toEmail,
          replyToSender: settings.replyToSender,
          autoReply: settings.autoReply,
          autoReplySubject: settings.autoReplySubject,
          autoReplyBody: settings.autoReplyBody,
          allowInvalidCert: settings.allowInvalidCert,
          hasPassword: Boolean(settings.password),
        }}
      />
    </>
  );
}
