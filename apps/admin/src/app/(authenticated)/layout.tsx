import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@refref/ui/components/sidebar";
import { ReferralWidgetInit } from "@/components/referral-widget-init";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Server-side redirect if no session is found
  if (!session) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
