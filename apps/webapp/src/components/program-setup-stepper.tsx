import type * as React from "react";
import { ChevronRightIcon } from "lucide-react";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@refref/ui/components/timeline";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@refref/ui/components/scroll-area";

interface ProgramSetupStepperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    id: number;
    title: string;
    description: string;
  }[];
  currentStep: number;
}

export function ProgramSetupStepper({
  items,
  currentStep = 1,
  className,
  ...props
}: ProgramSetupStepperProps) {
  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-muted/40",
        className,
      )}
      {...props}
    >
      <ScrollArea className="flex-1">
        <div className="px-2 py-4">
          <div className="space-y-1">
            <Timeline value={currentStep}>
              {items.map((item) => (
                <TimelineItem
                  key={item.id}
                  step={item.id}
                  className="group-data-[orientation=vertical]/timeline:ms-10"
                >
                  <TimelineHeader>
                    <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                    <TimelineTitle>{item.title}</TimelineTitle>
                    <TimelineIndicator className="group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center group-data-completed/timeline-item:border-none group-data-[orientation=vertical]/timeline:-left-7">
                      <CheckIcon
                        className="group-not-data-completed/timeline-item:hidden"
                        size={16}
                      />
                    </TimelineIndicator>
                  </TimelineHeader>
                  <TimelineContent>{item.description}</TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
