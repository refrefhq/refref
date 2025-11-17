"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Input } from "@refref/ui/components/input";
import { cn } from "@refref/ui/lib/utils";

interface EditableBreadcrumbProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  maxLength?: number;
  className?: string;
}

export function EditableBreadcrumb({
  value,
  onSave,
  maxLength = 100,
  className,
}: EditableBreadcrumbProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    // Validation
    if (!trimmedValue) {
      setError("Name is required");
      return;
    }

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    if (!isSaving) {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          maxLength={maxLength}
          disabled={isSaving}
          className={cn(
            "h-7 text-sm font-medium",
            error && "border-destructive"
          )}
          aria-invalid={!!error}
        />
        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {error && <span className="text-xs text-destructive absolute mt-8">{error}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-medium",
        className
      )}
    >
      <span className="text-sm">{value}</span>
      <button
        onClick={handleEdit}
        className="p-1 hover:bg-accent rounded transition-colors"
        aria-label="Edit program name"
        type="button"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
