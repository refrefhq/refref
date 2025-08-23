import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Auth layout that redirects authenticated users to the dashboard
 * and provides a consistent layout for all authentication pages.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to dashboard if user is already authenticated
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}
