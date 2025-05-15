/**
 * Get the first day of a month N months ago
 * @param months Number of months to go back
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getFirstDayOfMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

/**
 * Get the last day of a given month
 * @param date Date object representing any day in the target month
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getLastDayOfMonth(date: Date): string {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
} 