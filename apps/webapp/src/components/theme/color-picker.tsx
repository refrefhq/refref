"use client";

import { Label } from "@refref/ui/components/label";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

const DEBOUNCE_DELAY = 300;

function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFunc = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };

  debouncedFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunc;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  name?: string;
}

export function ColorPicker({
  color,
  onChange,
  label,
  name,
}: ColorPickerProps) {
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update the text input value using ref when color prop changes
    if (textInputRef.current) {
      textInputRef.current.value = color;
    }
  }, [color]);

  const debouncedOnChange = useMemo(
    () =>
      debounce((value: string) => {
        onChange(value);
      }, DEBOUNCE_DELAY),
    [onChange],
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      debouncedOnChange(newColor);
    },
    [debouncedOnChange],
  );

  const handleTextInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const colorString = e.target.value;
      debouncedOnChange(colorString);
    },
    [debouncedOnChange],
  );

  useEffect(() => {
    return () => debouncedOnChange.cancel();
  }, [debouncedOnChange]);

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <Label
          htmlFor={`color-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-xs font-medium"
        >
          {label}
        </Label>
      </div>
      <div className="relative flex items-center gap-1.5">
        <div
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border"
          style={{ backgroundColor: color }}
        >
          <input
            type="color"
            id={`color-${label.replace(/\s+/g, "-").toLowerCase()}`}
            value={color}
            onChange={handleColorChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <input
          ref={textInputRef}
          type="text"
          defaultValue={color}
          onChange={handleTextInputChange}
          className="bg-input/25 border-border/20 h-8 flex-1 rounded border px-2 text-sm"
          placeholder="#a995c9"
        />
      </div>
    </div>
  );
}
