"use client";

import { useEffect, useState } from "react";
import { Button } from "@refref/ui/components/button";
import { Card, CardContent } from "@refref/ui/components/card";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Separator } from "@refref/ui/components/separator";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export default function ProductSettings() {
  const {
    data: product,
    isLoading,
    refetch,
  } = api.product.getCurrent.useQuery();
  const updateProductMutation = api.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  // Zod validation schema
  const productSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    url: z.string().url({ message: "Invalid URL" }),
  });

  const form = useForm({
    defaultValues: {
      name: product?.name || "",
      url: product?.url || "",
    },
    onSubmit: async ({ value }) => {
      updateProductMutation.mutate({
        productId: product!.id,
        name: value.name,
        url: value.url,
      });
    },
  });

  // Update form values when product data loads
  useEffect(() => {
    if (product) {
      form.setFieldValue("name", product.name);
      form.setFieldValue("url", product.url || "");
    }
  }, [product, form]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Product</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your product information and settings
          </p>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">Product</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your product information and settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium text-foreground">
                  Product name
                </Label>

                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      const result = productSchema.shape.name.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-1">
                      <Input
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-background border-border text-foreground w-80 max-w-sm"
                        disabled={updateProductMutation.isPending}
                        placeholder="Enter product name"
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <Separator />

              {/* Product URL */}
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium text-foreground">
                  Product URL
                </Label>

                <form.Field
                  name="url"
                  validators={{
                    onChange: ({ value }) => {
                      const result = productSchema.shape.url.safeParse(value);
                      return result.success
                        ? undefined
                        : result.error.issues[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-1">
                      <Input
                        type="url"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-background border-border text-foreground w-80 max-w-sm"
                        disabled={updateProductMutation.isPending}
                        placeholder="https://example.com"
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <Separator />

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
