import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@refref/ui/components/sidebar";
import { ReferralWidgetInit } from "@/components/referral-widget-init";
import { GlobalSearch } from "@/components/global-search";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  if (!organizations.length) {
    redirect("/onboarding");
  }

  if (!session!.session.activeOrganizationId) {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: organizations[0]!.id,
      },
    });
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Toaster />
      <GlobalSearch />
      <AppSidebar variant="inset" />
      <SidebarInset
        className="overflow-hidden"
        style={{
          height: "calc(100vh - var(--spacing) * 4)",
        }}
      >
        <ReferralWidgetInit />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
