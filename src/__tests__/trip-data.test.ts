import { describe, it, expect } from 'vitest';
import {
  getAllSections,
  getSection,
  getDayData,
  getAccommodation,
  TRIP,
} from '@/lib/trip-data';

describe('Trip Data Store', () => {
  // FE-014-HP-01: Placeholder data for all 4 sections
  describe('getAllSections', () => {
    it('returns all 4 sections in chronological order', () => {
      const sections = getAllSections();
      expect(sections).toHaveLength(4);
      expect(sections[0].id).toBe('switzerland');
      expect(sections[1].id).toBe('tomorrowland');
      expect(sections[2].id).toBe('rhodes');
      expect(sections[3].id).toBe('turkey');
    });

    it('each section has at least 2 days', () => {
      const sections = getAllSections();
      for (const section of sections) {
        expect(section.days.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  // FE-013-HP-01: Query functions return typed data
  describe('getSection', () => {
    it('returns the correct section for a mid-section date', () => {
      // Jul 14 is within Switzerland section
      const section = getSection(new Date('2026-07-14'));
      expect(section).not.toBeNull();
      expect(section!.id).toBe('switzerland');
      expect(section!.name).toBe('Switzerland');
    });

    it('returns null for a date before the trip', () => {
      const section = getSection(new Date('2026-07-01'));
      expect(section).toBeNull();
    });

    it('returns null for a date after the trip', () => {
      const section = getSection(new Date('2026-09-01'));
      expect(section).toBeNull();
    });

    // INT-007: Travel day assigned to departing section
    it('assigns a travel day to the departing section', () => {
      // The last day of Switzerland (travel day to Tomorrowland)
      // should be a Switzerland day per architecture decision
      const sections = getAllSections();
      const switzerlandEnd = sections[0].endDate;
      const section = getSection(new Date(switzerlandEnd));
      expect(section).not.toBeNull();
      expect(section!.id).toBe('switzerland');
    });
  });

  describe('getDayData', () => {
    it('returns day data with activities for a valid date', () => {
      const dayData = getDayData(new Date('2026-07-14'));
      expect(dayData).not.toBeNull();
      expect(dayData!.date).toBe('2026-07-14');
      expect(dayData!.activities.length).toBeGreaterThan(0);
    });

    it('returns null for a date outside the trip', () => {
      const dayData = getDayData(new Date('2026-06-01'));
      expect(dayData).toBeNull();
    });
  });

  describe('getAccommodation', () => {
    it('returns accommodation for a date within a section', () => {
      const accommodation = getAccommodation(new Date('2026-07-14'));
      expect(accommodation).not.toBeNull();
      expect(accommodation!.hotelName).toBeTruthy();
      expect(accommodation!.address).toBeTruthy();
    });

    it('returns null for a date outside the trip', () => {
      const accommodation = getAccommodation(new Date('2026-06-01'));
      expect(accommodation).toBeNull();
    });
  });

  describe('TRIP metadata', () => {
    it('has trip start date anchoring the day counter', () => {
      expect(TRIP.startDate).toBe('2026-07-12');
    });

    it('has Sydney as the start timezone', () => {
      expect(TRIP.startTimezone).toBe('Australia/Sydney');
    });
  });
});
