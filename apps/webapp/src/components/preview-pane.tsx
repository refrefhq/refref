"use client";

import type * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@refref/ui/components/button";
import { ScrollArea } from "@refref/ui/components/scroll-area";
import { Separator } from "@refref/ui/components/separator";

interface PreviewPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function PreviewPane({
  className,
  isOpen = true,
  onClose,
  children,
  ...props
}: PreviewPaneProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "flex h-full w-xl flex-col border-l bg-muted/40",
        className,
      )}
      {...props}
    >
      {/* <div className="flex h-12 items-center justify-between border-b px-4">
        <h3 className="text-sm font-medium">Preview</h3>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div> */}
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}
