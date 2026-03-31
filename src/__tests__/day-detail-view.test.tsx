import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(cleanup);

// Mock next/link to render a plain <a>
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  },
}));

import DayDetailView from '@/app/day/[date]/page';
import { getAllSections, TRIP } from '@/lib/trip-data';
import { getCumulativeDay } from '@/lib/timezone';

describe('Day Detail View', () => {
  it('renders day header with day badge, full date, and section name', () => {
    // Day 3 = Jul 14, Switzerland
    render(<DayDetailView params={{ date: '2026-07-14' }} />);
    const tripStart = new Date(TRIP.startDate);
    const dayNum = getCumulativeDay(new Date('2026-07-14'), tripStart);
    expect(screen.getByText(`Day ${dayNum}`)).toBeInTheDocument();
    expect(screen.getByText(/Jul 14/)).toBeInTheDocument();
    expect(screen.getByText(/Switzerland/)).toBeInTheDocument();
  });

  it('renders back navigation link to timeline', () => {
    render(<DayDetailView params={{ date: '2026-07-14' }} />);
    const backLink = screen.getByRole('link', { name: /timeline/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/timeline');
  });

  it('renders transit cards for a day with transit events', () => {
    // Jul 14 has a train to Jungfraujoch
    render(<DayDetailView params={{ date: '2026-07-14' }} />);
    expect(screen.getByText(/Jungfraujoch/)).toBeInTheDocument();
    expect(screen.getByText(/SBB/)).toBeInTheDocument();
  });

  it('renders multiple transit cards in chronological order', () => {
    // Jul 25 has two ferry transits (to Symi and back)
    render(<DayDetailView params={{ date: '2026-07-25' }} />);
    const transitTexts = screen.getAllByText(/Dodekanisos/);
    expect(transitTexts.length).toBe(2);
  });

  it('renders activities for the day', () => {
    // Jul 14: Train to Jungfraujoch, Top of Europe viewpoint, Dinner in Interlaken
    render(<DayDetailView params={{ date: '2026-07-14' }} />);
    expect(screen.getByText(/Train to Jungfraujoch/)).toBeInTheDocument();
    expect(screen.getByText(/Top of Europe viewpoint/)).toBeInTheDocument();
    expect(screen.getByText(/Dinner in Interlaken/)).toBeInTheDocument();
  });

  it('renders accommodation card for the day section', () => {
    // Jul 14 is Switzerland — Hotel Interlaken
    render(<DayDetailView params={{ date: '2026-07-14' }} />);
    expect(screen.getByText(/Hotel Interlaken/)).toBeInTheDocument();
  });

  it('renders day with no transit showing activities and accommodation only (FE-006-EC-01)', () => {
    // Jul 15 = Lake Thun, no transit events
    render(<DayDetailView params={{ date: '2026-07-15' }} />);
    expect(screen.getByText(/Boat cruise on Lake Thun/)).toBeInTheDocument();
    expect(screen.getByText(/Hotel Interlaken/)).toBeInTheDocument();
    // No transit card content should be present — check for absence of transit-specific UI
    expect(screen.queryByText(/✈/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🚂/)).not.toBeInTheDocument();
    expect(screen.queryByText(/⛴/)).not.toBeInTheDocument();
  });

  it('wraps content in SectionThemeProvider with correct section', () => {
    const { container } = render(<DayDetailView params={{ date: '2026-07-14' }} />);
    const themedDiv = container.querySelector<HTMLElement>('[style*="--section-accent"]');
    expect(themedDiv).not.toBeNull();
    // Switzerland accent = #DC2626
    expect(themedDiv!.getAttribute('style')).toContain('#DC2626');
  });

  it('redirects to /timeline for invalid date parameter', () => {
    expect(() => {
      render(<DayDetailView params={{ date: 'not-a-date' }} />);
    }).toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/timeline');
  });

  it('redirects to /timeline for date not in trip data', () => {
    expect(() => {
      render(<DayDetailView params={{ date: '2025-01-01' }} />);
    }).toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/timeline');
  });

  it('loads correct data for day navigated from timeline (INT-004)', () => {
    // Simulates tapping Day 11 (Jul 22) in timeline → Turkey travel day
    render(<DayDetailView params={{ date: '2026-07-22' }} />);
    const tripStart = new Date(TRIP.startDate);
    const dayNum = getCumulativeDay(new Date('2026-07-22'), tripStart);
    expect(screen.getByText(`Day ${dayNum}`)).toBeInTheDocument();
    // Should show the flight from Brussels to Rhodes
    expect(screen.getByText(/Rhodes RHO/)).toBeInTheDocument();
    expect(screen.getByText(/Aegean/)).toBeInTheDocument();
    // Should show Tomorrowland section (Jul 22 is in Tomorrowland section)
    expect(screen.getByText(/Tomorrowland/)).toBeInTheDocument();
  });
});
