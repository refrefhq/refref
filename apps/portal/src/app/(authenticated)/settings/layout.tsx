"use client";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@refref/ui/components/sidebar";
import Link from "next/link";
import {
  IconChevronLeft,
  IconUser,
  IconPalette,
  IconUsers,
  IconBuilding,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

const SidebarItems = [
  {
    group: "Account",
    items: [
      { label: "Profile", href: "/settings/profile", icon: IconUser },
      { label: "Appearance", href: "/settings/appearance", icon: IconPalette },
    ],
  },
  {
    group: "Team",
    items: [
      { label: "Project", href: "/settings/project", icon: IconBuilding },
      { label: "Members", href: "/settings/members", icon: IconUsers },
    ],
  },
];
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log("pathname", pathname);
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <Sidebar collapsible="offcanvas" variant="inset">
        {/* Back to app button */}
        <SidebarMenu className="my-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-min whitespace-nowrap text-muted-foreground"
              asChild
            >
              <Link href="/">
                <IconChevronLeft className="size-4" />
                Back to app
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarContent>
          {SidebarItems.map((group) => (
            <SidebarMenu key={group.group}>
              <SidebarGroup className="flex flex-col gap-1">
                <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
            </SidebarMenu>
          ))}
        </SidebarContent>
      </Sidebar>

      {/* Content area */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
