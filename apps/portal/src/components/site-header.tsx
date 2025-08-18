import { Button } from "@refref/ui/components/button";
import { Separator } from "@refref/ui/components/separator";
import { SidebarTrigger } from "@refref/ui/components/sidebar";
import { ReactNode } from "react";

interface SiteHeaderProps {
  breadcrumbs?: ReactNode;
  meta?: ReactNode;
}

export function SiteHeader({ breadcrumbs, meta }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {breadcrumbs}
        <div className="ml-auto flex items-center gap-2">{meta}</div>
      </div>
    </header>
  );
}
