/**
 * Returns the cumulative day number (1-based) from the trip start date.
 * Day 1 = tripStartDate.
 */
export function getCumulativeDay(date: Date, tripStartDate: Date): number {
  const msPerDay = 86_400_000;
  const startUTC = Date.UTC(tripStartDate.getFullYear(), tripStartDate.getMonth(), tripStartDate.getDate());
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUTC - startUTC) / msPerDay) + 1;
}

/**
 * Returns true if the given YYYY-MM-DD date string matches "today"
 * in the specified IANA timezone.
 */
export function isToday(dayDate: string, timezone: string): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayInTz = formatter.format(now); // "YYYY-MM-DD" in en-CA locale
  return dayDate === todayInTz;
}

/**
 * Formats an ISO datetime string (without Z suffix) as HH:MM in the given
 * IANA timezone. The input is treated as a wall-clock time in that timezone.
 */
export function formatLocalTime(isoTime: string, timezone: string): string {
  // Parse as local wall-clock time in the target timezone.
  // We construct a Date from the ISO string (interpreted as UTC) then use
  // Intl to format in the target timezone. But since the input IS the local
  // time, we just extract HH:MM directly.
  const [, timePart] = isoTime.split('T');
  const [hours, minutes] = timePart.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Returns whether the given date falls before, during, or after the trip.
 * Comparison is date-only (ignores time component).
 */
export function getTripStatus(
  today: Date,
  tripStart: Date,
  tripEnd: Date,
): 'before' | 'during' | 'after' {
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const startUTC = Date.UTC(tripStart.getFullYear(), tripStart.getMonth(), tripStart.getDate());
  const endUTC = Date.UTC(tripEnd.getFullYear(), tripEnd.getMonth(), tripEnd.getDate());

  if (todayUTC < startUTC) return 'before';
  if (todayUTC > endUTC) return 'after';
  return 'during';
}
