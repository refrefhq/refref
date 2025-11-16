"use client";

import { OrganizationSettingsCards } from "@daveyplate/better-auth-ui";
import { Separator } from "@refref/ui/components/separator";

export default function OrganizationGeneralSettings() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization information and settings
        </p>
      </div>

      <Separator />

      <OrganizationSettingsCards />
    </div>
  );
}
