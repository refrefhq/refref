"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  Button as RACButton,
  DateRangePicker as RACDateRangePicker,
  Dialog as RACDialog,
  Group as RACGroup,
  Popover as RACPopover,
} from "react-aria-components";
import {
  today,
  getLocalTimeZone,
  CalendarDate,
  DateValue,
} from "@internationalized/date";
import { cn } from "@/lib/utils";
import { RangeCalendar } from "@refref/ui/components/calendar-rac";
import { DateInput, dateInputStyle } from "@refref/ui/components/datefield-rac";
import { Button } from "@refref/ui/components/button";

interface DateRange {
  start: DateValue | null;
  end: DateValue | null;
}

interface DateRangePickerWithPresetsProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

interface Preset {
  label: string;
  getValue: () => DateRange;
}

export function DateRangePickerWithPresets({
  value,
  onChange,
  className,
}: DateRangePickerWithPresetsProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
    null,
  );

  const presets: Preset[] = React.useMemo(() => {
    const now = today(getLocalTimeZone());

    return [
      {
        label: "Last 7 days",
        getValue: () => ({
          start: now.subtract({ days: 6 }),
          end: now,
        }),
      },
      {
        label: "Last 30 days",
        getValue: () => ({
          start: now.subtract({ days: 29 }),
          end: now,
        }),
      },
      {
        label: "Last 60 days",
        getValue: () => ({
          start: now.subtract({ days: 59 }),
          end: now,
        }),
      },
      {
        label: "Last 90 days",
        getValue: () => ({
          start: now.subtract({ days: 89 }),
          end: now,
        }),
      },
      {
        label: "This month",
        getValue: () => ({
          start: now.set({ day: 1 }),
          end: now,
        }),
      },
      {
        label: "Last month",
        getValue: () => {
          const lastMonth = now.subtract({ months: 1 });
          const lastDayOfLastMonth = lastMonth.set({
            day: lastMonth.calendar.getDaysInMonth(lastMonth),
          });
          return {
            start: lastMonth.set({ day: 1 }),
            end: lastDayOfLastMonth,
          };
        },
      },
    ];
  }, []);

  const handlePresetClick = (preset: Preset) => {
    const range = preset.getValue();
    setSelectedPreset(preset.label);
    onChange?.(range);
  };

  const handleDateRangeChange = (
    range: { start: DateValue; end: DateValue } | null,
  ) => {
    setSelectedPreset(null);
    if (range) {
      onChange?.({
        start: range.start,
        end: range.end,
      });
    } else {
      onChange?.({
        start: null,
        end: null,
      });
    }
  };

  React.useEffect(() => {
    if (value) {
      const matchingPreset = presets.find((preset) => {
        const presetRange = preset.getValue();
        return (
          value.start?.compare(presetRange.start as CalendarDate) === 0 &&
          value.end?.compare(presetRange.end as CalendarDate) === 0
        );
      });
      setSelectedPreset(matchingPreset?.label || null);
    }
  }, [value, presets]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="hidden md:flex items-center gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="ghost"
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className={cn(
              "h-8 px-2 text-xs",
              selectedPreset === preset.label &&
                "bg-accent text-accent-foreground",
            )}
          >
            {preset.label}
          </Button>
        ))}
        <div className="h-4 w-px bg-border mx-1" />
      </div>

      <RACDateRangePicker
        className="*:not-first:mt-2"
        value={
          value && value.start && value.end
            ? { start: value.start, end: value.end }
            : null
        }
        onChange={handleDateRangeChange}
      >
        <div className="flex">
          <RACGroup className={cn(dateInputStyle, "pe-9")}>
            <DateInput slot="start" unstyled />
            <span aria-hidden="true" className="text-muted-foreground/70 px-2">
              -
            </span>
            <DateInput slot="end" unstyled />
          </RACGroup>
          <RACButton className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
            <CalendarIcon size={16} />
          </RACButton>
        </div>
        <RACPopover
          className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-md border shadow-lg outline-hidden"
          offset={4}
        >
          <RACDialog className="max-h-[inherit] overflow-auto p-2">
            <RangeCalendar />
          </RACDialog>
        </RACPopover>
      </RACDateRangePicker>
    </div>
  );
}
