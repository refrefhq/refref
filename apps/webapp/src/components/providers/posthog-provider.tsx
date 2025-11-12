"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

function PostHogIdentifier() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Skip if session is still loading
    if (isPending) {
      return;
    }

    // Identify user when authenticated
    if (session?.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        ...(session.session?.activeOrganizationId && {
          activeOrganizationId: session.session.activeOrganizationId,
        }),
      });
    } else {
      // Reset PostHog when user logs out
      posthog.reset();
    }
  }, [session, isPending]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogIdentifier />
      {children}
    </PHProvider>
  );
}
