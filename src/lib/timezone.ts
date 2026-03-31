function dateOnlyUTC(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Returns the cumulative day number (1-based) from the trip start date.
 * Day 1 = tripStartDate.
 */
export function getCumulativeDay(date: Date, tripStartDate: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((dateOnlyUTC(date) - dateOnlyUTC(tripStartDate)) / msPerDay) + 1;
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
export function formatLocalTime(isoTime: string, _timezone: string): string {
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
  const todayUTC = dateOnlyUTC(today);
  const startUTC = dateOnlyUTC(tripStart);
  const endUTC = dateOnlyUTC(tripEnd);

  if (todayUTC < startUTC) return 'before';
  if (todayUTC > endUTC) return 'after';
  return 'during';
}
