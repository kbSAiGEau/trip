'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAllSections, TRIP } from '@/lib/trip-data';
import { getCumulativeDay, isToday } from '@/lib/timezone';
import SectionThemeProvider from '@/components/SectionThemeProvider';

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDayDate(dateStr: string): { weekday: string; formatted: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { weekday, formatted };
}

export default function TimelineView() {
  const sections = getAllSections();
  const tripStart = new Date(TRIP.startDate);
  const currentDayRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <main style={{ padding: '16px 16px 80px', maxWidth: 430, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 16 }}>
        Timeline
      </h1>

      {sections.map((section) => {
        const dateRange = formatDateRange(section.startDate, section.endDate);

        return (
          <SectionThemeProvider key={section.id} sectionId={section.id}>
            <section style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.125rem',
                  backgroundColor: 'var(--section-accent)',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                {section.name}
                <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9, marginTop: 2 }}>
                  {dateRange}
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.days.map((day) => {
                  const dayNumber = getCumulativeDay(new Date(day.date), tripStart);
                  const { weekday, formatted } = formatDayDate(day.date);
                  const isCurrent = isToday(day.date, section.timezone);

                  return (
                    <Link
                      key={day.date}
                      href={`/day/${day.date}`}
                      ref={isCurrent ? currentDayRef : undefined}
                      data-current-day={isCurrent ? 'true' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        minHeight: 48,
                        borderRadius: 6,
                        textDecoration: 'none',
                        color: 'var(--color-text, #1e1e1e)',
                        backgroundColor: isCurrent ? 'var(--section-accent-10)' : 'transparent',
                        borderLeft: isCurrent ? '3px solid var(--section-accent)' : '3px solid transparent',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          minWidth: 48,
                        }}
                      >
                        Day {dayNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', minWidth: 72 }}>
                        {weekday}, {formatted}
                      </span>
                      <span style={{ fontSize: '0.875rem', flex: 1 }}>
                        {day.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </SectionThemeProvider>
        );
      })}
    </main>
  );
}
