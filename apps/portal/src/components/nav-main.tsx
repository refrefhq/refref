"use client";

import {
  IconCirclePlusFilled,
  IconMail,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@refref/ui/components/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@refref/ui/components/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          <SidebarMenuItem key="search">
            <SidebarMenuButton
              variant="outline"
              className="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64 cursor-pointer"
              data-search-trigger
            >
              <IconSearch />
              <span className="inline-flex">Search...</span>
              <kbd className="pointer-events-none absolute right-[0.4rem] top-[0.4rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.url}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
