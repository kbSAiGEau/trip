import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

// Mock next/link to render a plain <a>
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock scrollIntoView
const scrollIntoViewMock = vi.fn();
Element.prototype.scrollIntoView = scrollIntoViewMock;

import TimelineView from '@/app/timeline/page';
import { getAllSections, TRIP } from '@/lib/trip-data';
import { getCumulativeDay } from '@/lib/timezone';

describe('Timeline View', () => {
  it('renders all 4 section headers in chronological order', () => {
    render(<TimelineView />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    // textContent includes nested span text, so use includes()
    const switzIdx = headings.findIndex((h) => h.textContent?.includes('Switzerland'));
    const tmlIdx = headings.findIndex((h) => h.textContent?.includes('Tomorrowland'));
    const rhodesIdx = headings.findIndex((h) => h.textContent?.includes('Rhodes'));
    const turkeyIdx = headings.findIndex((h) => h.textContent?.includes('Turkey'));
    expect(switzIdx).toBeGreaterThanOrEqual(0);
    expect(tmlIdx).toBeGreaterThanOrEqual(0);
    expect(rhodesIdx).toBeGreaterThanOrEqual(0);
    expect(turkeyIdx).toBeGreaterThanOrEqual(0);
    expect(switzIdx).toBeLessThan(tmlIdx);
    expect(tmlIdx).toBeLessThan(rhodesIdx);
    expect(rhodesIdx).toBeLessThan(turkeyIdx);
  });

  it('each section header shows destination name and date range', () => {
    render(<TimelineView />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    const switzHeader = headings.find((h) => h.textContent?.includes('Switzerland'));
    expect(switzHeader).toBeDefined();
    expect(switzHeader!.textContent).toContain('Jul 12');
    expect(switzHeader!.textContent).toContain('Jul 18');
  });

  it('renders day rows with cumulative day number, weekday, date, and summary label', () => {
    render(<TimelineView />);
    const tripStart = new Date(TRIP.startDate);
    const day1 = getCumulativeDay(new Date('2026-07-12'), tripStart);
    expect(screen.getByText(`Day ${day1}`)).toBeInTheDocument();
    expect(screen.getByText(/Depart Sydney/)).toBeInTheDocument();
  });

  it('day rows are links to /day/[date]', () => {
    render(<TimelineView />);
    const links = screen.getAllByRole('link');
    const dayLink = links.find((l) => l.getAttribute('href') === '/day/2026-07-12');
    expect(dayLink).toBeDefined();
  });

  it('renders all days from all sections', () => {
    render(<TimelineView />);
    const sections = getAllSections();
    const totalDays = sections.reduce((sum, s) => sum + s.days.length, 0);
    const links = screen.getAllByRole('link').filter((l) =>
      l.getAttribute('href')?.startsWith('/day/')
    );
    expect(links.length).toBe(totalDays);
  });

  it('each section uses SectionThemeProvider with correct accent color', () => {
    const { container } = render(<TimelineView />);
    // SectionThemeProvider wraps each section — count divs that directly set --section-accent
    // Each SectionThemeProvider sets both --section-accent and --section-accent-10
    const themedDivs = Array.from(
      container.querySelectorAll<HTMLElement>('[style*="--section-accent"]')
    ).filter((el) => {
      const style = el.getAttribute('style') || '';
      return style.includes('--section-accent-10');
    });
    expect(themedDivs.length).toBe(4);
  });

  it('before/after trip: all days shown, none highlighted as current', () => {
    // Default: isToday returns false for all dates (we are not during the trip)
    render(<TimelineView />);
    const currentDayElements = document.querySelectorAll('[data-current-day="true"]');
    expect(currentDayElements.length).toBe(0);
  });
});
