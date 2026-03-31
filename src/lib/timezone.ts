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
