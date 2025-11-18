"use client";

import { AuthUIProvider as BetterAuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { env } from "@/env";

export function AuthUIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <BetterAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      magicLink={env.NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH}
      credentials={env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH}
      social={{
        providers: env.NEXT_PUBLIC_ENABLED_SOCIAL_AUTH,
      }}
      organization={{
        logo: true,
      }}
    >
      {children}
    </BetterAuthUIProvider>
  );
}
