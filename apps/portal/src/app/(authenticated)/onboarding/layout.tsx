import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });
  const hasProjects = organizations.length > 0;
  if (hasProjects) {
    redirect("/programs");
  }

  return <>{children}</>;
}
