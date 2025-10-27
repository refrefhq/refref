"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

type UseAuthGuardOptions = {
  /**
   * If true, redirects authenticated users away (e.g., for sign-in pages)
   * If false (default), redirects unauthenticated users away (for protected pages)
   */
  redirectIfAuthenticated?: boolean;

  /**
   * Path to redirect to if conditions are met
   * Defaults to "/dashboard" for unauthorized redirects
   * Defaults to "/auth/sign-in" for authenticated redirects
   */
  redirectTo?: string;
};

/**
 * Client-side hook to guard routes based on authentication state
 *
 * @example
 * // In a protected page (redirect unauthenticated users to signin)
 * useAuthGuard();
 *
 * @example
 * // In an auth page (redirect authenticated users to dashboard)
 * useAuthGuard({ redirectIfAuthenticated: true });
 */
export function useAuthGuard({
  redirectIfAuthenticated = false,
  redirectTo,
}: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Skip during server-side rendering or while loading
    if (isPending) return;

    if (redirectIfAuthenticated && session) {
      // Redirect authenticated users (e.g., from auth pages)
      router.replace(redirectTo || "/dashboard");
    } else if (!redirectIfAuthenticated && !session) {
      // Redirect unauthenticated users (from protected pages)
      router.replace(redirectTo || "/auth/sign-in");
    }
  }, [session, isPending, redirectIfAuthenticated, redirectTo, router]);

  return { session, isPending };
}
