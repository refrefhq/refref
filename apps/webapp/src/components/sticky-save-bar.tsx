"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@refref/ui/components/button";
import { cn } from "@/lib/utils";

interface StickySaveBarProps {
  isDirty: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  isSaving?: boolean;
  saveText?: string;
  discardText?: string;
  message?: string;
  className?: string;
}

export function StickySaveBar({
  isDirty,
  onSave,
  onDiscard,
  isSaving = false,
  saveText = "Save changes",
  discardText = "Discard",
  message = "You have unsaved changes",
  className,
}: StickySaveBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            className,
          )}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>{message}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDiscard}
                  disabled={isSaving}
                >
                  {discardText}
                </Button>

                <Button size="sm" onClick={onSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSaving ? "Saving..." : saveText}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Alternative version for use within a specific container (not fixed to viewport)
export function StickySaveBarRelative({
  isDirty,
  onSave,
  onDiscard,
  isSaving = false,
  saveText = "Save changes",
  discardText = "Discard",
  message = "You have unsaved changes",
  className,
}: StickySaveBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          className={cn(
            "sticky bottom-0 left-0 right-0 z-40",
            "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "mt-auto", // Push to bottom of flex container
            className,
          )}
        >
          <div className="px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span>{message}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDiscard}
                  disabled={isSaving}
                >
                  {discardText}
                </Button>

                <Button size="sm" onClick={onSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSaving ? "Saving..." : saveText}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
