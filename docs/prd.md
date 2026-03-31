# Product Requirements Document: TripCompanion

## Problem Statement

International trips spanning multiple countries and transit modes are hard to keep track of. Flight numbers, ferry times, hotel addresses, and daily plans end up scattered across emails, PDFs, and booking apps. When you're standing in a Swiss train station or waiting at a Greek ferry port, you need one place to glance at and know: what's happening now, what's next, and where am I staying tonight.

## Solution

A personal PWA (Progressive Web App) that organizes an entire multi-country trip into a single glance-first interface. The trip is divided into destination sections, each with its own color theme. The default view shows today's plan and the next upcoming transit. A scrollable timeline lets you browse the full trip. All data lives in one editable file — no backend, no accounts, no live APIs. Works offline via service worker caching, installable to the iPhone home screen.

## User Stories

### Today View

- **US-001:** As the traveler, I want the app to open directly to today's view showing my current section, day number, and activity highlights, so that I get immediate context without scrolling or navigating.
- **US-002:** As the traveler, I want to see my "next transit" (flight, train, or ferry) prominently on the today view, so that I can quickly check departure time, carrier, and reference number.
- **US-003:** As the traveler, I want today's view to show the correct local time for my current destination, so that I'm never confused about timezone differences.

### Timeline Browse

- **US-004:** As the traveler, I want to scroll through the entire trip as a vertical timeline organized by section and day, so that I can browse upcoming or past days.
- **US-005:** As the traveler, I want each section in the timeline to be visually distinct through color theming, so that I instantly know which destination I'm viewing.
- **US-006:** As the traveler, I want to tap a day in the timeline to expand its details (activities, transit, accommodation), so that I can drill into specifics without the timeline being cluttered.

### Transit Cards

- **US-007:** As the traveler, I want transit cards for every flight, train, and ferry showing carrier/operator, reference number, departure time, arrival time, and origin/destination, so that I have all booking details in one place.
- **US-008:** As the traveler, I want transit times displayed in the local timezone of each endpoint (departure city timezone for departure, arrival city timezone for arrival), so that times match what I see at the station or airport.
- **US-009:** As the traveler, I want transit cards to include app notes (e.g., "Use SBB Mobile app", "Check-in online 24h before"), so that I remember which apps or actions are needed for each leg.

### Accommodation

- **US-010:** As the traveler, I want each section to display its accommodation block with hotel name and address, so that I can quickly find where I'm staying.

### Day Counter

- **US-011:** As the traveler, I want a cumulative day counter across the full trip starting from Day 1 (departure from Sydney), so that I have a sense of where I am in the overall journey.

### Section Theming

- **US-012:** As the traveler, I want each destination section to have its own color theme (Swiss red, Tomorrowland purple, Greek blue, Turkish turquoise) on a light cream base, so that the visual identity helps me orient within the trip.

### Data Management

- **US-013:** As the trip planner, I want all trip data (sections, days, activities, transit, accommodation) stored in a single editable TypeScript/JSON file, so that I can update a flight number or hotel without touching any components.
- **US-014:** As the trip planner, I want the data file to use placeholder data initially, so that I can build the app structure before the trip is finalized and fill in real details incrementally.

### Offline & PWA

- **US-015:** As the traveler, I want the app to work fully offline after first load, so that I can access my itinerary in the Swiss Alps, on ferries, or during international transit without connectivity.
- **US-016:** As the traveler, I want to install the app to my iPhone home screen as a PWA, so that it behaves like a native app without going through the App Store.
- **US-017:** As the traveler, I want a manual refresh option to update cached data when I'm online, so that I can pull in any data file changes I've made.

## Implementation Decisions

### Modules

| Module | Responsibility | Interface |
|--------|---------------|-----------|
| **Trip Data Store** | Single TS data file defining all sections, days, activities, transit events, and accommodation. Exposes query functions: `getTodaySection()`, `getTodayActivities()`, `getNextTransit()`, `getAllSections()`, `getDayNumber(date)` | Import and call — no async, no API layer |
| **Date/Timezone Engine** | Cumulative day counting from Day 1 (Sydney departure date), "is today" detection, local time formatting per section timezone | Pure functions: `getCumulativeDay(date)`, `formatLocalTime(utcTime, timezone)`, `isToday(day)` |
| **Today View** | Default screen composing day number, section header, activity list, next transit card, accommodation | React component consuming Data Store + Timezone Engine |
| **Timeline View** | Scrollable full-trip timeline grouped by section → day, with expand/collapse per day | React component consuming Data Store |
| **Transit Card** | Reusable display component for flight/train/ferry with all fields | Presentational React component |
| **Section Theming** | Color token map keyed by section ID, applied via CSS custom properties | Theme provider or CSS variable injection |
| **PWA Shell** | Service worker registration, web manifest, offline caching strategy, manual refresh | Next.js PWA plugin + custom service worker config |

### Architectural Decisions

- **Next.js with TypeScript** — static site generation (SSG) for zero-runtime data fetching; all pages pre-rendered at build time
- **Vercel hosting** — zero-config deployment, automatic HTTPS, global CDN
- **Single data file** — a TypeScript file exporting typed trip data; components import directly; no database, no API routes
- **All times stored with explicit IANA timezone** — e.g., `{ time: "2026-07-15T09:30", tz: "Europe/Zurich" }`; display functions convert to local time
- **Travel days belong to the departing section** — a day flying from Switzerland to Belgium is a Switzerland day
- **Day 1 = departure day from Sydney** — the cumulative counter anchors to this date
- **No authentication** — personal use only, obscure Vercel URL is sufficient

## Testing Decisions

### Thorough Testing (Deep Modules)

**Trip Data Store query logic:**
- Given a date, returns the correct section, day's activities, and accommodation
- `getNextTransit()` returns the chronologically next transit event from a given datetime
- Edge cases: date before trip start, date after trip end, travel days (section boundary), multiple transits in one day

**Date/Timezone Engine:**
- Cumulative day counter produces correct day numbers across the full trip span
- `isToday()` correctly identifies today across timezone boundaries
- Local time formatting handles all 4 timezone regions (AEST, CET, EEST, TRT)
- Edge cases: timezone transition days, midnight boundaries, DST if applicable

### Light Testing (Presentational Components)

- **Transit Card** — renders all fields (carrier, reference, times, notes) without crashing; snapshot or render test
- **Today View** — renders with mock data; shows day number, section name, activities, next transit
- **Timeline View** — renders all sections and days from mock data; expand/collapse works
- **Section Theming** — each section ID maps to expected color tokens

### Testing Approach

- Integration-style tests against the real data store module (no mocking the data file in Data Store tests)
- Presentational component tests use mock/fixture data passed as props
- Test runner: Jest or Vitest (whichever Next.js scaffolding provides)

## Out of Scope

- Live APIs (flight tracking, weather, maps)
- Authentication or multi-user access
- Push notifications or background sync
- Budget tracking, expense splitting, or currency conversion
- Packing lists or checklists
- Multi-user sharing or collaborative editing
- Native mobile app (iOS/Android)
- Server-side data storage or database
- Search functionality
- Dark mode (light cream base only)

## Further Notes

- The trip covers 4 destination sections: **Switzerland**, **Tomorrowland** (Belgium/Netherlands), **Rhodes** (Greece), and **Turkey**
- Section color palette: Swiss red (#DC2626), Tomorrowland purple (#7C3AED), Greek blue (#2563EB), Turkish turquoise (#0D9488) on a light cream base (#FFFBF5)
- The trip is not yet finalized — all data should be placeholder initially, structured for easy incremental updates
- Target device is iPhone; design should prioritize mobile viewport
- Four timezone transitions during the trip: AEST → CET → EEST → TRT
