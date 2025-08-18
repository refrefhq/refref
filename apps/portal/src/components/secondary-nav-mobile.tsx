import type * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@refref/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@refref/ui/components/dropdown-menu";

interface SecondaryNavMobileProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
  }[];
}

export function SecondaryNavMobile({
  className,
  items,
  ...props
}: SecondaryNavMobileProps) {
  const activeItem = items.find((item) => item.isActive);

  return (
    <div
      className={cn("flex items-center border-b p-4 md:hidden", className)}
      {...props}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              {activeItem?.icon && <activeItem.icon className="h-4 w-4" />}
              {activeItem?.title || "Navigation"}
            </span>
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {items.map((item) => (
            <DropdownMenuItem key={item.title} asChild>
              <a href={item.href} className="flex items-center">
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
