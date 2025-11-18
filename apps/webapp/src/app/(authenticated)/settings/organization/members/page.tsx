"use client";

import {
  OrganizationMembersCard,
  OrganizationInvitationsCard,
} from "@daveyplate/better-auth-ui";
import { Separator } from "@refref/ui/components/separator";

export default function OrganizationMembersPage() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage organization members and invitations
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        <OrganizationMembersCard />
        <OrganizationInvitationsCard />
      </div>
    </div>
  );
}
