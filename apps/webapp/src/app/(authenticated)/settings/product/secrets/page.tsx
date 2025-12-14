"use client";

import { Separator } from "@refref/ui/components/separator";
import { ProductSecretsCard } from "@/components/settings/product/product-secrets-card";

export default function ProductSecretsSettings() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Secrets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your product credentials for API integration
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        <ProductSecretsCard />
      </div>
    </div>
  );
}
