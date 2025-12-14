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
  IconSettings,
  IconKey,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

const SidebarItems = [
  {
    group: "Account",
    items: [
      { label: "Profile", href: "/settings/account/profile", icon: IconUser },
      {
        label: "Appearance",
        href: "/settings/account/appearance",
        icon: IconPalette,
      },
    ],
  },
  {
    group: "Organization",
    items: [
      {
        label: "General",
        href: "/settings/organization/general",
        icon: IconSettings,
      },
      {
        label: "Members",
        href: "/settings/organization/members",
        icon: IconUsers,
      },
      {
        label: "API",
        href: "/settings/organization/api-keys",
        icon: IconKey,
      },
    ],
  },
  {
    group: "Product",
    items: [
      {
        label: "General",
        href: "/settings/product/general",
        icon: IconBuilding,
      },
      {
        label: "Secrets",
        href: "/settings/product/secrets",
        icon: IconKey,
      },
    ],
  },
];
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 54)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarContent>
          {/* Back to app button */}
          <SidebarMenu className="my-4">
            <SidebarMenuItem className="px-2">
              <SidebarMenuButton asChild>
                <Link href="/">
                  <IconChevronLeft className="size-4" />
                  Back to app
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
