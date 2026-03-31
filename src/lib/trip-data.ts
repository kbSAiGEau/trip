// ── Types ──────────────────────────────────────────────────────────

export interface Trip {
  name: string;
  startDate: string;       // YYYY-MM-DD
  startTimezone: string;   // IANA timezone
}

export interface Activity {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  description: string;
}

export interface TransitEvent {
  type: 'flight' | 'train' | 'ferry';
  carrier: string;
  reference: string;
  origin: { name: string; time: string; timezone: string };
  destination: { name: string; time: string; timezone: string };
  note?: string;
}

export interface Accommodation {
  hotelName: string;
  address: string;
}

export interface DayData {
  date: string;            // YYYY-MM-DD
  label: string;
  activities: Activity[];
  transit: TransitEvent[];
}

export interface Section {
  id: string;
  name: string;
  color: string;
  timezone: string;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  accommodation: Accommodation;
  days: DayData[];
}

// ── Trip Metadata ──────────────────────────────────────────────────

export const TRIP: Trip = {
  name: 'TripCompanion',
  startDate: '2026-07-12',
  startTimezone: 'Australia/Sydney',
};

// ── Placeholder Data ───────────────────────────────────────────────

const sections: Section[] = [
  {
    id: 'switzerland',
    name: 'Switzerland',
    color: '#DC2626',
    timezone: 'Europe/Zurich',
    startDate: '2026-07-12',
    endDate: '2026-07-18',
    accommodation: {
      hotelName: 'Hotel Interlaken',
      address: 'Höheweg 45, 3800 Interlaken',
    },
    days: [
      {
        date: '2026-07-12',
        label: 'Depart Sydney',
        activities: [
          { timeOfDay: 'morning', description: 'Flight from Sydney to Zürich' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Swiss Air',
            reference: 'LX9999',
            origin: { name: 'Sydney SYD', time: '2026-07-12T06:00', timezone: 'Australia/Sydney' },
            destination: { name: 'Zürich ZRH', time: '2026-07-12T18:00', timezone: 'Europe/Zurich' },
            note: 'Check-in online 24h before',
          },
        ],
      },
      {
        date: '2026-07-13',
        label: 'Arrive Zürich',
        activities: [
          { timeOfDay: 'morning', description: 'Arrive Zürich, transfer to Interlaken' },
          { timeOfDay: 'afternoon', description: 'Explore Interlaken' },
        ],
        transit: [],
      },
      {
        date: '2026-07-14',
        label: 'Jungfrau Region',
        activities: [
          { timeOfDay: 'morning', description: 'Train to Jungfraujoch' },
          { timeOfDay: 'afternoon', description: 'Top of Europe viewpoint' },
          { timeOfDay: 'evening', description: 'Dinner in Interlaken' },
        ],
        transit: [
          {
            type: 'train',
            carrier: 'SBB',
            reference: 'JFJ001',
            origin: { name: 'Interlaken Ost', time: '2026-07-14T09:30', timezone: 'Europe/Zurich' },
            destination: { name: 'Jungfraujoch', time: '2026-07-14T11:45', timezone: 'Europe/Zurich' },
            note: 'Use SBB Mobile app',
          },
        ],
      },
      {
        date: '2026-07-15',
        label: 'Lake Thun',
        activities: [
          { timeOfDay: 'morning', description: 'Boat cruise on Lake Thun' },
          { timeOfDay: 'afternoon', description: 'Visit Thun Castle' },
        ],
        transit: [],
      },
      {
        date: '2026-07-16',
        label: 'Grindelwald',
        activities: [
          { timeOfDay: 'morning', description: 'Hike First Cliff Walk' },
          { timeOfDay: 'afternoon', description: 'Grindelwald village walk' },
        ],
        transit: [],
      },
      {
        date: '2026-07-17',
        label: 'Lauterbrunnen Valley',
        activities: [
          { timeOfDay: 'morning', description: 'Staubbach Falls hike' },
          { timeOfDay: 'afternoon', description: 'Mürren via cable car' },
        ],
        transit: [],
      },
      {
        date: '2026-07-18',
        label: 'Travel to Belgium',
        activities: [
          { timeOfDay: 'morning', description: 'Transfer to Zürich airport' },
          { timeOfDay: 'afternoon', description: 'Flight to Brussels' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Swiss Air',
            reference: 'LX1234',
            origin: { name: 'Zürich ZRH', time: '2026-07-18T14:00', timezone: 'Europe/Zurich' },
            destination: { name: 'Brussels BRU', time: '2026-07-18T15:30', timezone: 'Europe/Brussels' },
          },
        ],
      },
    ],
  },
  {
    id: 'tomorrowland',
    name: 'Tomorrowland',
    color: '#7C3AED',
    timezone: 'Europe/Brussels',
    startDate: '2026-07-19',
    endDate: '2026-07-22',
    accommodation: {
      hotelName: 'Hotel Boom',
      address: 'Grote Markt 12, 2850 Boom',
    },
    days: [
      {
        date: '2026-07-19',
        label: 'Tomorrowland Day 1',
        activities: [
          { timeOfDay: 'morning', description: 'Festival grounds open' },
          { timeOfDay: 'evening', description: 'Main stage headliner' },
        ],
        transit: [],
      },
      {
        date: '2026-07-20',
        label: 'Tomorrowland Day 2',
        activities: [
          { timeOfDay: 'afternoon', description: 'Explore stages' },
          { timeOfDay: 'evening', description: 'Closing ceremony' },
        ],
        transit: [],
      },
      {
        date: '2026-07-21',
        label: 'Amsterdam Day Trip',
        activities: [
          { timeOfDay: 'morning', description: 'Train to Amsterdam' },
          { timeOfDay: 'afternoon', description: 'Canal cruise' },
        ],
        transit: [
          {
            type: 'train',
            carrier: 'Thalys',
            reference: 'THA789',
            origin: { name: 'Brussels Midi', time: '2026-07-21T08:00', timezone: 'Europe/Brussels' },
            destination: { name: 'Amsterdam Centraal', time: '2026-07-21T09:50', timezone: 'Europe/Amsterdam' },
          },
        ],
      },
      {
        date: '2026-07-22',
        label: 'Travel to Rhodes',
        activities: [
          { timeOfDay: 'morning', description: 'Flight to Rhodes' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Aegean',
            reference: 'A3456',
            origin: { name: 'Brussels BRU', time: '2026-07-22T10:00', timezone: 'Europe/Brussels' },
            destination: { name: 'Rhodes RHO', time: '2026-07-22T15:00', timezone: 'Europe/Athens' },
          },
        ],
      },
    ],
  },
  {
    id: 'rhodes',
    name: 'Rhodes',
    color: '#2563EB',
    timezone: 'Europe/Athens',
    startDate: '2026-07-23',
    endDate: '2026-07-28',
    accommodation: {
      hotelName: 'Lindos Blu Hotel',
      address: 'Vlicha Bay, 851 07 Lindos',
    },
    days: [
      {
        date: '2026-07-23',
        label: 'Explore Rhodes Old Town',
        activities: [
          { timeOfDay: 'morning', description: 'Palace of the Grand Master' },
          { timeOfDay: 'afternoon', description: 'Walk the Street of the Knights' },
        ],
        transit: [],
      },
      {
        date: '2026-07-24',
        label: 'Lindos',
        activities: [
          { timeOfDay: 'morning', description: 'Acropolis of Lindos' },
          { timeOfDay: 'afternoon', description: 'Lindos Beach' },
        ],
        transit: [],
      },
      {
        date: '2026-07-25',
        label: 'Symi Day Trip',
        activities: [
          { timeOfDay: 'morning', description: 'Ferry to Symi' },
          { timeOfDay: 'afternoon', description: 'Explore Symi harbor' },
        ],
        transit: [
          {
            type: 'ferry',
            carrier: 'Dodekanisos',
            reference: 'DS4421',
            origin: { name: 'Rhodes', time: '2026-07-25T08:30', timezone: 'Europe/Athens' },
            destination: { name: 'Symi', time: '2026-07-25T09:20', timezone: 'Europe/Athens' },
          },
          {
            type: 'ferry',
            carrier: 'Dodekanisos',
            reference: 'DS4422',
            origin: { name: 'Symi', time: '2026-07-25T16:00', timezone: 'Europe/Athens' },
            destination: { name: 'Rhodes', time: '2026-07-25T16:50', timezone: 'Europe/Athens' },
          },
        ],
      },
      {
        date: '2026-07-26',
        label: 'Valley of the Butterflies',
        activities: [
          { timeOfDay: 'morning', description: 'Visit Petaloudes (Valley of the Butterflies)' },
          { timeOfDay: 'afternoon', description: 'Wine tasting at Emery Winery' },
        ],
        transit: [],
      },
      {
        date: '2026-07-27',
        label: 'Beach Day',
        activities: [
          { timeOfDay: 'morning', description: 'Tsambika Beach' },
          { timeOfDay: 'afternoon', description: 'Anthony Quinn Bay' },
        ],
        transit: [],
      },
      {
        date: '2026-07-28',
        label: 'Travel to Turkey',
        activities: [
          { timeOfDay: 'morning', description: 'Flight to Istanbul' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Turkish Airlines',
            reference: 'TK890',
            origin: { name: 'Rhodes RHO', time: '2026-07-28T14:00', timezone: 'Europe/Athens' },
            destination: { name: 'Istanbul IST', time: '2026-07-28T15:30', timezone: 'Europe/Istanbul' },
          },
        ],
      },
    ],
  },
  {
    id: 'turkey',
    name: 'Turkey',
    color: '#0D9488',
    timezone: 'Europe/Istanbul',
    startDate: '2026-07-29',
    endDate: '2026-08-02',
    accommodation: {
      hotelName: 'Hotel Sultanahmet',
      address: 'Divanyolu Cd. 18, 34110 Fatih/Istanbul',
    },
    days: [
      {
        date: '2026-07-29',
        label: 'Istanbul Old City',
        activities: [
          { timeOfDay: 'morning', description: 'Hagia Sophia' },
          { timeOfDay: 'afternoon', description: 'Blue Mosque' },
          { timeOfDay: 'evening', description: 'Grand Bazaar' },
        ],
        transit: [],
      },
      {
        date: '2026-07-30',
        label: 'Bosphorus',
        activities: [
          { timeOfDay: 'morning', description: 'Bosphorus cruise' },
          { timeOfDay: 'afternoon', description: 'Dolmabahçe Palace' },
        ],
        transit: [],
      },
      {
        date: '2026-07-31',
        label: 'Cappadocia',
        activities: [
          { timeOfDay: 'morning', description: 'Flight to Cappadocia' },
          { timeOfDay: 'afternoon', description: 'Göreme Open Air Museum' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Turkish Airlines',
            reference: 'TK891',
            origin: { name: 'Istanbul IST', time: '2026-07-31T07:00', timezone: 'Europe/Istanbul' },
            destination: { name: 'Nevşehir NAV', time: '2026-07-31T08:30', timezone: 'Europe/Istanbul' },
          },
        ],
      },
      {
        date: '2026-08-01',
        label: 'Hot Air Balloon',
        activities: [
          { timeOfDay: 'morning', description: 'Hot air balloon ride at sunrise' },
          { timeOfDay: 'afternoon', description: 'Underground city of Derinkuyu' },
        ],
        transit: [],
      },
      {
        date: '2026-08-02',
        label: 'Return Home',
        activities: [
          { timeOfDay: 'morning', description: 'Flight home via Istanbul' },
        ],
        transit: [
          {
            type: 'flight',
            carrier: 'Turkish Airlines',
            reference: 'TK892',
            origin: { name: 'Nevşehir NAV', time: '2026-08-02T10:00', timezone: 'Europe/Istanbul' },
            destination: { name: 'Istanbul IST', time: '2026-08-02T11:30', timezone: 'Europe/Istanbul' },
          },
          {
            type: 'flight',
            carrier: 'Turkish Airlines',
            reference: 'TK893',
            origin: { name: 'Istanbul IST', time: '2026-08-02T14:00', timezone: 'Europe/Istanbul' },
            destination: { name: 'Sydney SYD', time: '2026-08-03T10:00', timezone: 'Australia/Sydney' },
          },
        ],
      },
    ],
  },
];

// ── Query Functions ────────────────────────────────────────────────

function toDateUTC(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getAllSections(): Section[] {
  return sections;
}

export function getSection(date: Date): Section | null {
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  for (const section of sections) {
    const start = toDateUTC(section.startDate);
    const end = toDateUTC(section.endDate);
    if (dateUTC >= start && dateUTC <= end) {
      return section;
    }
  }
  return null;
}

export function getDayData(date: Date): DayData | null {
  const dateStr = dateToString(date);
  for (const section of sections) {
    for (const day of section.days) {
      if (day.date === dateStr) {
        return day;
      }
    }
  }
  return null;
}

export function getAccommodation(date: Date): Accommodation | null {
  const section = getSection(date);
  return section?.accommodation ?? null;
}
