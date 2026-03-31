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
