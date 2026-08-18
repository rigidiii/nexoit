'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin', label: 'Statistik' },
  { href: '/admin/nachrichten', label: 'Nachrichten' },
  { href: '/admin/smtp', label: 'SMTP' },
  { href: '/admin/einstellungen', label: 'Einstellungen' },
];

export default function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <nav className="ad__nav" aria-label="Verwaltung">
      {items.map((item) => {
        // '/admin' darf nicht bei jeder Unterseite als aktiv gelten.
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
            {item.label}
            {item.href === '/admin/nachrichten' && unread > 0 && (
              <span className="ad__nav-badge">
                {unread}
                <span className="nx-sr"> ungelesene Nachrichten</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
