"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { env } from "@/env";

declare global {
  interface Window {
    RefRef: Array<[string, any]>;
  }
}

export function ReferralWidgetInit() {
  const isInitialized = useRef(false);

  // Check if referral credentials are configured
  const isConfigured = Boolean(
    env.NEXT_PUBLIC_REFREF_PROJECT_ID && env.NEXT_PUBLIC_REFREF_PROGRAM_ID,
  );

  // Only query for token if configured
  const { data } = api.referral.getWidgetToken.useQuery(undefined, {
    enabled: isConfigured,
  });

  useEffect(() => {
    // Skip initialization if not configured or no data
    if (!isConfigured || !data || isInitialized.current) return;

    // Initialize window.RefRef if it doesn't exist
    window.RefRef = window.RefRef || [];

    // Initialize the widget with the token from the backend
    window.RefRef.push([
      "init",
      {
        projectId: env.NEXT_PUBLIC_REFREF_PROJECT_ID,
        programId: env.NEXT_PUBLIC_REFREF_PROGRAM_ID,
        participantId: "dfsdfs",
        token: data.token,
      },
    ]);

    isInitialized.current = true;
  }, [data, isConfigured]);

  return null;
}
