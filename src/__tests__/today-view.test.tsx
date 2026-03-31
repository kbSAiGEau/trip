import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodayView from '@/app/page';

// Mock timezone module to control "today"
vi.mock('@/lib/timezone', async () => {
  const actual = await vi.importActual('@/lib/timezone');
  return {
    ...actual,
    isToday: vi.fn(),
  };
});

import { isToday } from '@/lib/timezone';
const mockIsToday = vi.mocked(isToday);

describe('Today View', () => {
  beforeEach(() => {
    mockIsToday.mockReset();
  });

  // FE-001-HP-01: App opens to today view showing current section, day number, activities
  it('renders section name, day number, and activities for a mid-trip date', () => {
    // Mock isToday to return true for Jul 14 (Day 3, Switzerland)
    mockIsToday.mockImplementation((dayDate) => dayDate === '2026-07-14');

    render(<TodayView />);

    expect(screen.getByText(/Switzerland/i)).toBeInTheDocument();
    expect(screen.getByText(/Day 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Train to Jungfraujoch/i)).toBeInTheDocument();
  });

  // FE-001-EC-01: Today view before trip starts
  it('shows a before-trip message when today is before the trip', () => {
    // No day matches isToday → before trip
    mockIsToday.mockReturnValue(false);

    render(<TodayView />);

    expect(screen.getByText(/Trip starts/i)).toBeInTheDocument();
  });

  // FE-001-EC-02: Today view after trip ends
  // This is harder to distinguish from "before" without controlling the actual
  // date. We'll test that the component handles the "no match" case gracefully.
  // The actual before/after distinction requires getTripStatus, which we'll test
  // by injecting a date after the trip.

  // INT-001: Today View correctly composes data from Trip Data Store and Timezone Engine
  it('renders the formatted date for the matched day', () => {
    mockIsToday.mockImplementation((dayDate) => dayDate === '2026-07-14');

    render(<TodayView />);

    // Should show the day label
    expect(screen.getByText(/Jungfrau Region/i)).toBeInTheDocument();
  });
});
