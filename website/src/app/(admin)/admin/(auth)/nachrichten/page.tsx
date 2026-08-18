import Link from 'next/link';

import { getDb } from '@/lib/db';
import { isSmtpConfigured } from '@/lib/settings';
import { deleteMessageAction, markMessageAction } from '@/actions/admin';

export const dynamic = 'force-dynamic';

interface MessageRow {
  id: number;
  created_at: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  mail_sent: number;
  mail_error: string | null;
}

const FILTERS = [
  { key: 'alle', label: 'Alle' },
  { key: 'neu', label: 'Ungelesen' },
  { key: 'gelesen', label: 'Gelesen' },
  { key: 'erledigt', label: 'Erledigt' },
] as const;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Postfach der Anfragen aus dem Kontaktformular. */
export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = FILTERS.find((f) => f.key === params.filter)?.key ?? 'alle';

  const db = getDb();
  const messages = (
    filter === 'alle'
      ? db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200')
      : db.prepare(
          'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC LIMIT 200',
        )
  ).all(...(filter === 'alle' ? [] : [filter])) as MessageRow[];

  const { total, unread, failed } = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'neu' THEN 1 ELSE 0 END) AS unread,
              SUM(CASE WHEN mail_sent = 0 THEN 1 ELSE 0 END) AS failed
         FROM contact_messages`,
    )
    .get() as { total: number; unread: number | null; failed: number | null };

  return (
    <>
      <header className="ad__head">
        <div>
          <h1 className="ad__title">Nachrichten</h1>
          <p className="ad__lead">
            Anfragen aus dem Kontaktformular. Sie werden gespeichert, bevor der Versand versucht
            wird – eine fehlgeschlagene E-Mail bedeutet also keinen Verlust der Anfrage.
          </p>
        </div>
        <span className="ad-pill ad-pill--neutral">
          {total} gesamt · {unread ?? 0} ungelesen
        </span>
      </header>

      <div className="ad-stack">
        {(failed ?? 0) > 0 && (
          <div className="ad-note ad-note--warn">
            Bei {failed} {failed === 1 ? 'Anfrage' : 'Anfragen'} ist der E-Mail-Versand
            fehlgeschlagen. Die Inhalte stehen unten vollständig zur Verfügung.{' '}
            {!isSmtpConfigured() && (
              <>
                Es ist noch kein SMTP-Server hinterlegt – <Link href="/admin/smtp">jetzt einrichten</Link>.
              </>
            )}
          </div>
        )}

        <nav className="ad-filters" aria-label="Filter">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/nachrichten?filter=${f.key}`}
              aria-current={f.key === filter ? 'true' : undefined}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {messages.length === 0 ? (
          <div className="ad-empty">
            {filter === 'alle'
              ? 'Es sind noch keine Anfragen eingegangen.'
              : 'In dieser Ansicht liegen keine Anfragen.'}
          </div>
        ) : (
          messages.map((msg) => (
            <article
              key={msg.id}
              className={`ad-msg${msg.status === 'neu' ? ' ad-msg--unread' : ''}`}
            >
              <div className="ad-msg__head">
                <div>
                  <div className="ad-msg__from">
                    {msg.name} <span style={{ fontWeight: 400, color: 'var(--ad-muted)' }}>· {msg.subject}</span>
                  </div>
                  <div className="ad-msg__meta">
                    <span>{formatDate(msg.created_at)}</span>
                    <a href={`mailto:${msg.email}`}>{msg.email}</a>
                    {msg.phone && <a href={`tel:${msg.phone.replace(/\s/g, '')}`}>{msg.phone}</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {msg.status === 'neu' && <span className="ad-pill ad-pill--new">Neu</span>}
                  {msg.status === 'erledigt' && <span className="ad-pill ad-pill--ok">Erledigt</span>}
                  <span className={`ad-pill ad-pill--${msg.mail_sent ? 'ok' : 'error'}`}>
                    {msg.mail_sent ? 'E-Mail zugestellt' : 'Versand fehlgeschlagen'}
                  </span>
                </div>
              </div>

              {!msg.mail_sent && msg.mail_error && (
                <div className="ad-note ad-note--error" style={{ marginTop: 14 }}>
                  {msg.mail_error}
                </div>
              )}

              <div className="ad-msg__body">{msg.message}</div>

              <div className="ad-msg__foot">
                <a
                  className="ad-btn ad-btn--primary"
                  href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                >
                  Antworten
                </a>

                {msg.status !== 'erledigt' && (
                  <form action={markMessageAction}>
                    <input type="hidden" name="id" value={msg.id} />
                    <input type="hidden" name="status" value="erledigt" />
                    <button type="submit" className="ad-btn ad-btn--ghost">
                      Als erledigt markieren
                    </button>
                  </form>
                )}

                {msg.status !== 'neu' && (
                  <form action={markMessageAction}>
                    <input type="hidden" name="id" value={msg.id} />
                    <input type="hidden" name="status" value="neu" />
                    <button type="submit" className="ad-btn ad-btn--ghost">
                      Als ungelesen markieren
                    </button>
                  </form>
                )}

                {msg.status === 'neu' && (
                  <form action={markMessageAction}>
                    <input type="hidden" name="id" value={msg.id} />
                    <input type="hidden" name="status" value="gelesen" />
                    <button type="submit" className="ad-btn ad-btn--ghost">
                      Als gelesen markieren
                    </button>
                  </form>
                )}

                <form action={deleteMessageAction} style={{ marginLeft: 'auto' }}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button type="submit" className="ad-btn ad-btn--danger">
                    Löschen
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
