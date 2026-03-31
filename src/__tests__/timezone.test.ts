import { describe, it, expect } from 'vitest';
import { getCumulativeDay } from '@/lib/timezone';

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
