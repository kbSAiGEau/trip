import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAllSections, getDayData, getSection, getAccommodation, TRIP } from '@/lib/trip-data';
import { getCumulativeDay } from '@/lib/timezone';
import SectionThemeProvider from '@/components/SectionThemeProvider';
import TransitCard from '@/components/TransitCard';
import AccommodationCard from '@/components/AccommodationCard';

interface DayDetailViewProps {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  const sections = getAllSections();
  const params: { date: string }[] = [];
  for (const section of sections) {
    for (const day of section.days) {
      params.push({ date: day.date });
    }
  }
  return params;
}

export default async function DayDetailView({ params }: DayDetailViewProps) {
  const { date: dateStr } = await params;

  // Validate date format and existence in trip data
  const dateObj = new Date(dateStr + 'T00:00:00');
  if (isNaN(dateObj.getTime())) {
    redirect('/timeline');
  }

  const dayData = getDayData(dateObj);
  const section = getSection(dateObj);

  if (!dayData || !section) {
    redirect('/timeline');
  }

  const tripStart = new Date(TRIP.startDate);
  const dayNumber = getCumulativeDay(dateObj, tripStart);
  const accommodation = getAccommodation(dateObj);

  const fullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SectionThemeProvider sectionId={section.id}>
      <main style={{ padding: '16px 16px 80px', maxWidth: 430, margin: '0 auto' }}>
        <Link
          href="/timeline"
          style={{
            display: 'inline-block',
            marginBottom: 16,
            fontSize: '0.875rem',
            color: 'var(--section-accent)',
            textDecoration: 'none',
          }}
        >
          ← Back to Timeline
        </Link>

        <div
          style={{
            backgroundColor: 'var(--section-accent)',
            color: '#fff',
            padding: '16px',
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.25rem',
              marginBottom: 4,
            }}
          >
            Day {dayNumber}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{fullDate}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: 2 }}>
            {section.name}
          </div>
        </div>

        {dayData.transit.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: 8,
              }}
            >
              Transit
            </h2>
            {dayData.transit.map((t, i) => (
              <TransitCard key={i} {...t} />
            ))}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              marginBottom: 8,
            }}
          >
            Activities
          </h2>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              padding: '12px 16px',
            }}
          >
            {dayData.activities.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 0',
                  borderBottom:
                    i < dayData.activities.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {a.timeOfDay}
                </span>
                <div style={{ fontSize: '0.875rem', marginTop: 2 }}>{a.description}</div>
              </div>
            ))}
          </div>
        </div>

        {accommodation && (
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: 8,
              }}
            >
              Accommodation
            </h2>
            <AccommodationCard
              hotelName={accommodation.hotelName}
              address={accommodation.address}
            />
          </div>
        )}
      </main>
    </SectionThemeProvider>
  );
}
