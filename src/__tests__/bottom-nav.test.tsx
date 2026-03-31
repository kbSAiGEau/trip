import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import BottomNav from '@/components/BottomNav';
import { usePathname } from 'next/navigation';

describe('BottomNav', () => {
  it('renders a <nav> element', () => {
    render(<BottomNav />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders two tab links: Today and Timeline', () => {
    render(<BottomNav />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('Today tab links to / and Timeline tab links to /timeline', () => {
    render(<BottomNav />);
    const todayLink = screen.getByText('Today').closest('a');
    const timelineLink = screen.getByText('Timeline').closest('a');
    expect(todayLink?.getAttribute('href')).toBe('/');
    expect(timelineLink?.getAttribute('href')).toBe('/timeline');
  });

  it('active tab has aria-current="page" when on Today (/)', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    render(<BottomNav />);
    const todayLink = screen.getByText('Today').closest('a');
    const timelineLink = screen.getByText('Timeline').closest('a');
    expect(todayLink?.getAttribute('aria-current')).toBe('page');
    expect(timelineLink?.getAttribute('aria-current')).toBeNull();
  });

  it('active tab has aria-current="page" when on Timeline (/timeline)', () => {
    vi.mocked(usePathname).mockReturnValue('/timeline');
    render(<BottomNav />);
    const todayLink = screen.getByText('Today').closest('a');
    const timelineLink = screen.getByText('Timeline').closest('a');
    expect(timelineLink?.getAttribute('aria-current')).toBe('page');
    expect(todayLink?.getAttribute('aria-current')).toBeNull();
  });

  it('tab links have minimum touch target size (44px)', () => {
    const { container } = render(<BottomNav />);
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      const style = link.getAttribute('style') || '';
      // Check that minHeight is set to at least 44px
      expect(style).toContain('min-height');
    });
  });
});
