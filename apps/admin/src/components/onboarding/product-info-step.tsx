"use client";

import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import type { ProductInfoFormData } from "@/lib/validations/onboarding";
import { useFormContext } from "react-hook-form";

export function ProductInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductInfoFormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Tell us about your product</h2>
        <p className="text-muted-foreground">
          We'll use this information to tailor your setup process
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">Product name</Label>
          <Input
            id="projectName"
            placeholder="Enter your product name"
            {...register("projectName")}
          />
          {errors.projectName && (
            <p className="text-sm text-destructive">
              {errors.projectName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectUrl">Website URL</Label>
          <Input
            id="projectUrl"
            type="url"
            placeholder="https://your-product.com"
            {...register("projectUrl")}
          />
          {errors.projectUrl && (
            <p className="text-sm text-destructive">
              {errors.projectUrl.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
