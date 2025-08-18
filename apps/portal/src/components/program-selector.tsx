"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@refref/ui/components/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface ProgramSelectorProps {
  className?: string;
}

export function ProgramSelector({ className }: ProgramSelectorProps) {
  const router = useRouter();
  const params = useParams();
  const currentProgramId = params.id as string;

  const { data: programs, isLoading } = api.program.getAll.useQuery();

  const currentProgram = programs?.find((p) => p.id === currentProgramId);

  const handleProgramChange = (programId: string) => {
    router.push(`/analytics/${programId}/performance`);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-input hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className,
          )}
        >
          {currentProgram?.name || "Select Program"}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {programs.map((program) => (
          <DropdownMenuItem
            key={program.id}
            onClick={() => handleProgramChange(program.id)}
            className={cn(
              "cursor-pointer",
              program.id === currentProgramId && "bg-muted",
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{program.name}</span>
              {program.status && (
                <span className="text-xs text-muted-foreground capitalize">
                  {program.status.replace("_", " ")}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
