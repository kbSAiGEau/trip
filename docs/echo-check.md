# Echo Check: TripCompanion

## Problem Statement
International trips spanning multiple countries and transit modes are hard to keep track of. Flight numbers, ferry times, hotel addresses, and daily plans end up scattered across emails, PDFs, and booking apps. This app provides a single glance-first reference for the entire trip, organized by destination section and day.

## Target Users
Solo use — the app owner, accessing it on iPhone during an international trip across Switzerland, Belgium/Netherlands, Greece, and Turkey.

## Core Requirements
1. Trip divided into 4 sections (Switzerland, Tomorrowland, Rhodes, Turkey) with per-section color theming on a light base
2. Cumulative day counter across the full trip, starting from departure day (Sydney)
3. Daily activity highlights per day
4. Transit cards for flights, trains, ferries — showing carrier, reference number, departure/arrival times in local timezone, and app notes (e.g. "Use SBB Mobile app")
5. Accommodation block per section (hotel name + address)
6. Glance-first "today" view as the default screen
7. "Next transit" surfaced prominently
8. Scrollable full-trip timeline for browsing
9. All trip data in a single editable data file (not scattered across components)
10. PWA — installable to iPhone home screen, works offline
11. Static data with date-aware smart presentation (no live APIs)

## Architectural Constraints
| Constraint | Detail |
|-----------|--------|
| Framework | Next.js with TypeScript |
| Hosting | Vercel |
| App model | PWA (service worker, offline-capable) |
| Auth | None — obscure URL only |
| Data | Static, pre-rendered at build time, single data file |
| Timezones | Local time per destination |
| Travel days | Belong to departing section |
| Day 1 | Departure day from Sydney |

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| Static data, no live APIs | Simplicity, reliability, no cost — live flight/weather tracking adds failure modes for a personal app |
| PWA over native app | No App Store needed, works on iPhone via home screen install, Vercel-hosted |
| Single data file for all trip info | Easy to update a flight number or hotel without touching components |
| Placeholder data throughout | Trip not finalized — structure supports easy updates later |
| Per-section color theming | Visual wayfinding — instantly know which destination you're viewing |
| No auth | Personal app, no sensitive data, obscure URL sufficient |
| Glance-first design | On a trip you need info fast, not scrolling walls of text |
| Offline-capable | Swiss Alps, ferries, international transit — can't rely on connectivity |

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| iOS PWA limitations (no push notifications, limited background sync) | Not needed — static display app, no notifications required |
| Timezone bugs across 4 timezone changes | Store all times with explicit timezone in data file, display in local time |
| Offline caching fails to update after data changes | Service worker cache-first strategy with manual refresh option |
| Placeholder data never gets updated before trip | Data file is simple JSON/TS — low friction to update |

## Confidence Level
12/12 Discovery Checklist topics covered. No topics waived.
