# Plan: TripCompanion

> Source PRD: `docs/prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Framework**: Next.js (App Router) with TypeScript, static export (`output: 'export'`)
- **Hosting**: Vercel (zero-config, automatic HTTPS, global CDN)
- **Data**: Single `trip-data.ts` file exporting typed data + query functions. No database, no API routes.
- **Timezones**: All times stored with explicit IANA timezone (e.g., `{ time: "2026-07-15T09:30", tz: "Europe/Zurich" }`). Formatting via `Intl.DateTimeFormat`.
- **Theming**: CSS custom properties (`--section-accent`) set by `SectionThemeProvider`, consumed by all components.
- **Routes**: `/` (Today View), `/timeline` (Timeline View), `/day/[date]` (Day Detail View)
- **Testing**: Vitest + React Testing Library. Real data module in Data Store tests, mock fixtures in component tests.
- **Fonts**: Plus Jakarta Sans (headings), Inter (body) — Google Fonts
- **Colors**: Cream base `#FFFBF5`, section accents: Switzerland `#DC2626`, Tomorrowland `#7C3AED`, Rhodes `#2563EB`, Turkey `#0D9488`

---

## Phase 1: Tracer Bullet — Data + Today View

**User stories**: US-001, US-003, US-011, US-013, US-014

### What to build

The thinnest possible slice proving the full stack: Next.js project scaffold → `trip-data.ts` with typed data and query functions (`getAllSections`, `getSection`, `getDayData`, `getCumulativeDay`) → Date/Timezone Engine (`getCumulativeDay`, `isToday`, `formatLocalTime`, `getTripStatus`) → Today View page rendering the current day's section name, day number, date, and activity highlights. Placeholder data for all 4 sections. Deploy to Vercel.

### Acceptance criteria

- [ ] Next.js project scaffolded with TypeScript, App Router, static export
- [ ] `trip-data.ts` defines typed Trip/Section/Day/Activity data and exports query functions
- [ ] Placeholder data covers all 4 sections with at least 2 days each
- [ ] Date/Timezone Engine correctly computes cumulative day number from trip start
- [ ] `isToday()` works across timezone boundaries
- [ ] Today View renders section name, "Day N", formatted date, and activity list
- [ ] Before-trip and after-trip states render appropriate messages
- [ ] Deploys to Vercel and renders correctly on iPhone viewport

---

## Phase 2: Transit Cards on Today View

**User stories**: US-002, US-007, US-008, US-009

### What to build

Transit Card component displaying carrier, reference number, departure/arrival times in local timezone, origin/destination, and optional app note. `getNextTransit()` query function scanning chronologically across all sections. Next Transit Banner integrated into Today View as the most prominent card.

### Acceptance criteria

- [ ] Transit Card renders all fields: type icon, carrier, reference, origin/destination with local times, app note
- [ ] `getNextTransit(from)` returns the first transit event after the given datetime, crossing section boundaries
- [ ] Departure time shown in departure city timezone, arrival in arrival city timezone
- [ ] App note renders in italic muted text when present, hidden when absent
- [ ] Today View shows Next Transit Banner prominently; hidden when no future transit exists
- [ ] Multiple transit types work: flight, train, ferry

---

## Phase 3: Section Theming + Accommodation

**User stories**: US-005, US-010, US-012

### What to build

`SectionThemeProvider` component that sets CSS custom properties (`--section-accent`, `--section-accent-10`) based on section ID. Accommodation Card component showing hotel name and address. Both integrated into Today View — section header uses accent color, accommodation card appears below activities.

### Acceptance criteria

- [ ] `SectionThemeProvider` maps all 4 section IDs to correct accent colors
- [ ] Unknown section ID falls back to neutral gray
- [ ] CSS custom properties available to all child components
- [ ] Accommodation Card renders hotel icon, name, and address
- [ ] `getAccommodation(date)` returns the hotel for the given date's section
- [ ] Today View section header banner uses section accent as background color
- [ ] Transit Card left border uses section accent color

---

## Phase 4: Timeline View

**User stories**: US-004, US-005, US-006 (partial)

### What to build

Scrollable full-trip timeline at `/timeline`. Section headers with accent-colored banners and date ranges. Compact day rows showing day number and summary label. Current day highlighted with accent left border and auto-scrolled into view. Bottom navigation bar with Today and Timeline tabs. Day rows are tappable (navigation target built in Phase 5).

### Acceptance criteria

- [ ] Timeline View renders all 4 sections in chronological order with themed headers
- [ ] Each section header shows destination name and date range
- [ ] Day rows show cumulative day number, weekday, date, and summary label
- [ ] Current day has accent-colored left border
- [ ] Page auto-scrolls to current day on mount
- [ ] Bottom navigation bar with two tabs (Today / Timeline), active tab highlighted
- [ ] Before/after trip: all days shown, none highlighted
- [ ] Day rows are tappable (link to `/day/[date]`)

---

## Phase 5: Day Detail View

**User stories**: US-006

### What to build

Day Detail View at `/day/[date]` showing the expanded view of a single day. Back navigation to Timeline. Day header with badge, date, and section name. All transit cards for the day in chronological order. Full activity list. Accommodation card.

### Acceptance criteria

- [ ] Route `/day/[date]` renders Day Detail View for the given date
- [ ] Back navigation returns to Timeline View
- [ ] Day header shows day badge, full date, and section name
- [ ] All transit cards for the day render in chronological order
- [ ] Activities card shows full activity list
- [ ] Accommodation card shows hotel for that day's section
- [ ] Days with no transit show activities and accommodation only
- [ ] Invalid date parameter redirects to Timeline View

---

## Phase 6: PWA + Offline

**User stories**: US-015, US-016, US-017

### What to build

Service worker registration via `next-pwa` or Serwist. Web manifest with app name, icons, standalone display mode. Cache-first strategy for all static assets. iOS-specific meta tags for home screen installation. Manual refresh option to invalidate cache and re-fetch.

### Acceptance criteria

- [ ] Service worker registers and activates on first load
- [ ] All static assets (HTML, JS, CSS, fonts) cached after first load
- [ ] App loads fully offline after initial cache
- [ ] Web manifest valid: name, short_name, start_url, display: standalone, icons (192px, 512px)
- [ ] iOS meta tags: apple-mobile-web-app-capable, status-bar-style
- [ ] Manual refresh option clears cache and re-fetches from network
- [ ] App installable to iPhone home screen via Safari "Add to Home Screen"
