"use client";

import * as React from "react";
import {
  IconActivity,
  IconAward,
  IconChartBar,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { FaDiscord } from "react-icons/fa6";
import Image from "next/image";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@refref/ui/components/sidebar";
import { useSession } from "@/lib/auth-client";

const data = {
  navMain: [
    {
      title: "Programs",
      url: "/programs",
      icon: IconListDetails,
    },
    {
      title: "Participants",
      url: "/participants",
      icon: IconUsers,
    },
    {
      title: "Activity",
      url: "/activity",
      icon: IconActivity,
    },
    {
      title: "Rewards",
      url: "/rewards",
      icon: IconAward,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    /* {
      title: "Test Mode",
      url: "/test-mode",
      icon: IconTestPipe,
    }, */
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "https://refref.ai/docs",
      icon: IconHelp,
    },
    {
      title: "Community",
      url: "https://refref.ai/community",
      icon: FaDiscord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // Use email prefix as name if name is empty
  const displayName =
    session?.user?.name && session.user.name.trim()
      ? session.user.name
      : session?.user?.email?.split("@")[0] || "User";

  const user = {
    name: displayName,
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Image
                  src="/logo.svg"
                  width={24}
                  height={24}
                  alt="RefRef Logo"
                />
                <span className="font-logo text-2xl font-light">RefRef</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
