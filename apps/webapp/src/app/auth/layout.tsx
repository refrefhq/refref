import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Toaster } from "sonner";

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

  // Redirect to home if user is already authenticated (will redirect to product)
  if (session) {
    redirect("/");
  }

  return (
    <>
      <Toaster />
      <div className="bg-muted/30 min-h-screen w-full">{children}</div>
    </>
  );
}
