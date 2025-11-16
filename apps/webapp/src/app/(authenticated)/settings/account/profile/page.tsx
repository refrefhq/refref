"use client";

import { UpdateNameCard, UpdateAvatarCard, ChangeEmailCard } from "@daveyplate/better-auth-ui";
import { Separator } from "@refref/ui/components/separator";

export default function AccountProfilePage() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account information
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        <UpdateAvatarCard />
        <UpdateNameCard />
        <ChangeEmailCard />
      </div>
    </div>
  );
}
