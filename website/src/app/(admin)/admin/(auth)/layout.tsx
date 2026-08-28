import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { getDb, housekeeping } from '@/lib/db';
import { applyRetention } from '@/lib/analytics';
import { logoutAction } from '@/actions/admin';
import AdminNav from '@/components/admin/AdminNav';
import { NexoMark } from '@/components/Icons';

export const dynamic = 'force-dynamic';

/**
 * Geschützter Rahmen des Verwaltungsbereichs.
 *
 * Die Prüfung sitzt bewusst im Layout und nicht in einer Middleware: sie läuft
 * damit in der Node-Runtime und kann direkt gegen die Datenbank prüfen, statt
 * nur das Vorhandensein eines Cookies zu sehen.
 */
export default async function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  // Aufräumarbeiten bei jedem Aufruf des Verwaltungsbereichs: abgelaufene
  // Sitzungen entfernen und die Aufbewahrungsfrist der Statistik durchsetzen.
  housekeeping();
  applyRetention();

  const { unread } = getDb()
    .prepare("SELECT COUNT(*) AS unread FROM contact_messages WHERE status = 'neu'")
    .get() as { unread: number };

  return (
    <div className="ad__shell">
      <aside className="ad__side">
        <Link href="/admin" className="ad__brand" style={{ textDecoration: 'none', color: '#fff' }}>
          <span className="ad__brand-mark">
            <NexoMark size={24} />
          </span>
          <span className="ad__brand-word">
            Nexo<b>IT</b>
            <span className="ad__brand-sub">Verwaltung</span>
          </span>
        </Link>

        <AdminNav unread={unread} />

        <div className="ad__side-foot">
          <div>
            Angemeldet als <strong style={{ color: '#fff' }}>{user.username}</strong>
          </div>
          <Link href="/" target="_blank" rel="noopener">
            Webseite ansehen ↗
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                font: 'inherit',
                color: 'rgba(255,255,255,.72)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      <main className="ad__main">{children}</main>
    </div>
  );
}
