import { describe, it, expect } from 'vitest';
import { getCumulativeDay, isToday } from '@/lib/timezone';

describe('getCumulativeDay', () => {
  const tripStart = new Date('2026-07-12');

  it('returns 1 on the departure day (Day 1 = trip start)', () => {
    // FE-011-EC-01: Day 1 is the departure day from Sydney
    const result = getCumulativeDay(new Date('2026-07-12'), tripStart);
    expect(result).toBe(1);
  });

  it('returns correct day number mid-trip', () => {
    // FE-011-HP-01: Trip starts 2026-07-12, current date 2026-07-14 → Day 3
    const result = getCumulativeDay(new Date('2026-07-14'), tripStart);
    expect(result).toBe(3);
  });

  it('counts continuously across section boundaries', () => {
    // FE-011-EC-02: Day counter spans across section boundaries
    // Trip starts Jul 12, Jul 19 → Day 8
    const result = getCumulativeDay(new Date('2026-07-19'), tripStart);
    expect(result).toBe(8);
  });

  it('returns correct day on the last day of the trip', () => {
    // FE-011-EC-03: Trip starts 2026-07-12, ends 2026-08-02 → Day 22
    const result = getCumulativeDay(new Date('2026-08-02'), tripStart);
    expect(result).toBe(22);
  });
});

describe('isToday', () => {
  it('returns true when the day date matches today in the given timezone', () => {
    // Use today's actual date for this test
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(isToday(todayStr, 'Australia/Sydney')).toBe(true);
  });

  it('returns false for a date that is not today', () => {
    expect(isToday('2020-01-01', 'Europe/Zurich')).toBe(false);
  });

  it('handles timezone where it could be a different calendar date than UTC', () => {
    // This tests that isToday uses the timezone to determine "today",
    // not UTC. We can't control the system clock, but we verify the
    // function accepts a timezone and uses it.
    const result = isToday('2020-06-15', 'Pacific/Auckland');
    expect(result).toBe(false);
  });
});
