'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Today', href: '/' },
  { label: 'Timeline', href: '/timeline' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'var(--color-cream, #FFFBF5)',
        zIndex: 50,
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-text, #1e1e1e)' : 'var(--color-text-muted, #6b7280)',
              textDecoration: 'none',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
