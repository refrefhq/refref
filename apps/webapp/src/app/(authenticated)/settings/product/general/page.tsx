"use client";

import { Separator } from "@refref/ui/components/separator";
import { UpdateProductNameCard } from "@/components/settings/product/update-product-name-card";
import { UpdateProductUrlCard } from "@/components/settings/product/update-product-url-card";

export default function ProductGeneralSettings() {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your product information and settings
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-6">
        <UpdateProductNameCard />
        <UpdateProductUrlCard />
      </div>
    </div>
  );
}
