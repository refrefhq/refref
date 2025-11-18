"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@refref/ui/components/tooltip";
import { formatFullDateTime, formatRelativeDate } from "@/lib/date-utils";

interface DateDisplayProps {
  date: Date | string;
  className?: string;
}

/**
 * Displays a date with GitHub-style formatting:
 * - Shows relative time for recent dates (e.g., "2 hours ago")
 * - Shows formatted date for older dates (e.g., "Nov 27, 2024")
 * - Hover to see full date/time tooltip (e.g., "Nov 27, 2024, 10:30:45 AM")
 */
export function DateDisplay({ date, className }: DateDisplayProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{formatRelativeDate(date)}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{formatFullDateTime(date)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
