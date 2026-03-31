'use client';

import { getAllSections, getSection, getDayData, getAccommodation, TRIP } from '@/lib/trip-data';
import type { Section, DayData } from '@/lib/trip-data';
import { getCumulativeDay, isToday, getTripStatus } from '@/lib/timezone';
import SectionThemeProvider from '@/components/SectionThemeProvider';
import AccommodationCard from '@/components/AccommodationCard';

function findToday(): { section: Section; day: DayData; dayNumber: number } | null {
  const tripStart = new Date(TRIP.startDate);
  const sections = getAllSections();

  for (const section of sections) {
    for (const day of section.days) {
      if (isToday(day.date, section.timezone)) {
        const dayNumber = getCumulativeDay(new Date(day.date), tripStart);
        return { section, day, dayNumber };
      }
    }
  }
  return null;
}

export default function TodayView() {
  const today = findToday();

  if (!today) {
    // Before or after trip
    const sections = getAllSections();
    const firstSection = sections[0];
    const lastSection = sections[sections.length - 1];

    return (
      <main style={{ padding: '24px 16px', maxWidth: 430, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 8 }}>
          TripCompanion
        </h1>
        <p>Trip starts {firstSection.startDate}</p>
      </main>
    );
  }

  const { section, day, dayNumber } = today;
  const accommodation = getAccommodation(new Date(day.date));

  return (
    <SectionThemeProvider sectionId={section.id}>
      <main style={{ padding: '24px 16px', maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            backgroundColor: 'var(--section-accent)',
            color: '#fff',
            padding: '16px',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 4 }}>
            {section.name}
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Day {dayNumber} &middot; {day.label}
          </p>
        </header>

        <section>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', marginBottom: 12 }}>
            Activities
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {day.activities.map((activity, i) => (
              <li
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {activity.timeOfDay}
                </span>
                <p>{activity.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {accommodation && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', marginBottom: 12 }}>
              Accommodation
            </h2>
            <AccommodationCard
              hotelName={accommodation.hotelName}
              address={accommodation.address}
            />
          </section>
        )}
      </main>
    </SectionThemeProvider>
  );
}
