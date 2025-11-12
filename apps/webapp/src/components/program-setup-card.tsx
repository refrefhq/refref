"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SetupCardProps {
  title: string;
  docLink?: string;
  className?: string;
  onClick?: () => void;
  isActive: boolean;
}

export function SetupCard({
  title,
  docLink,
  className,
  onClick,
  isActive,
}: SetupCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors cursor-pointer",
        !isActive ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      onClick={onClick}
    >
      <span className="truncate">{title}</span>
      {docLink && (
        <Link
          href={docLink}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto"
        >
          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Documentation</span>
        </Link>
      )}
    </div>
  );
}
