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
} from "@refref/ui/components/sidebar";
import Link from "next/link";
import {
  IconChevronLeft,
  IconUser,
  IconPalette,
  IconUsers,
} from "@tabler/icons-react";

const SidebarItems = [
  { label: "Profile", href: "/settings/profile", icon: IconUser },
  { label: "Appearance", href: "/settings/appearance", icon: IconPalette },
  { label: "Members", href: "/settings/members", icon: IconUsers },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
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
          <SidebarMenu>
            {SidebarItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* Content area */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
