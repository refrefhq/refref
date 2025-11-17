import { differenceInDays, format, formatDistanceToNow } from "date-fns";

/**
 * Formats a date for display with smart relative/absolute formatting.
 * - Dates within 7 days: "2 hours ago", "3 days ago"
 * - Dates older than 7 days: "Nov 27, 2024"
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const daysDifference = differenceInDays(now, dateObj);

  // For dates within 7 days, show relative time
  if (daysDifference < 7) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  // For older dates, show formatted date
  return format(dateObj, "MMM d, yyyy");
}

/**
 * Formats a date for tooltip display with full date and time.
 * Format: "Nov 27, 2024, 10:30:45 AM"
 *
 * @param date - The date to format (Date object or ISO string)
 * @returns Full formatted date/time string
 */
export function formatFullDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy, h:mm:ss a");
}
