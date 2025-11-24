"use client";

import { OrganizationApiKeysCard } from "@/components/settings/organization/organization-api-keys-card";
import { Separator } from "@refref/ui/components/separator";

export default function OrganizationAPIKeysPage() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys for accessing your organization's data
          programmatically
        </p>
      </div>

      <Separator />

      {/* API Keys Card */}
      <OrganizationApiKeysCard />
    </div>
  );
}
