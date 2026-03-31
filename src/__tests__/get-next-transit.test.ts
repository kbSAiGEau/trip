import { describe, it, expect } from 'vitest';
import { getNextTransit } from '@/lib/trip-data';

describe('getNextTransit', () => {
  // FE-002-HP-01: Next transit card shows chronologically next transit from current time
  it('returns the next transit event after the given datetime', () => {
    // 2026-07-14 08:00 CET — before the SBB train at 09:30
    const from = new Date('2026-07-14T08:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.carrier).toBe('SBB');
    expect(result!.reference).toBe('JFJ001');
    expect(result!.type).toBe('train');
  });

  // FE-002-EC-01: No transit today — shows next future transit
  it('returns the next future transit when no transit exists on the current day', () => {
    // 2026-07-15 12:00 — Lake Thun day, no transit. Next is Jul 18 flight.
    const from = new Date('2026-07-15T12:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.reference).toBe('LX1234');
    expect(result!.type).toBe('flight');
  });

  // FE-002-EC-02: No transit remaining in entire trip
  it('returns null when no future transit events exist', () => {
    // 2026-08-03 after the last flight arrives in Sydney
    const from = new Date('2026-08-03T12:00');
    const result = getNextTransit(from);
    expect(result).toBeNull();
  });

  // INT-003: getNextTransit crosses section boundaries
  it('crosses section boundaries to find the next transit', () => {
    // 2026-07-18 16:00 — after the Switzerland→Belgium flight lands.
    // Next transit is Thalys train on Jul 21.
    const from = new Date('2026-07-18T16:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.carrier).toBe('Thalys');
    expect(result!.reference).toBe('THA789');
  });

  it('returns the very first transit when queried before trip starts', () => {
    const from = new Date('2026-07-01T00:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.reference).toBe('LX9999');
    expect(result!.type).toBe('flight');
  });

  // FE-007-EC-01: Multiple transit cards same day — verifies chronological ordering
  it('returns the earlier transit when multiple exist on the same day', () => {
    // 2026-07-25 before both Symi ferries — should get the 08:30 one
    const from = new Date('2026-07-25T07:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.reference).toBe('DS4421');
    expect(result!.origin.name).toBe('Rhodes');
  });

  it('skips past transit and returns the next one on the same day', () => {
    // 2026-07-25 10:00 — after the first Symi ferry, before the return
    const from = new Date('2026-07-25T10:00');
    const result = getNextTransit(from);
    expect(result).not.toBeNull();
    expect(result!.reference).toBe('DS4422');
    expect(result!.origin.name).toBe('Symi');
  });
});
