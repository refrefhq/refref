"use client";

import { useEffect } from "react";
import { Card, CardContent, CardFooter } from "@refref/ui/components/card";
import { Input } from "@refref/ui/components/input";
import { Button } from "@refref/ui/components/button";
import { Skeleton } from "@refref/ui/components/skeleton";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Separator } from "@refref/ui/components/separator";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const productUrlSchema = z.object({
  url: z.string().url({ message: "Invalid URL" }).or(z.literal("")),
});

export function UpdateProductUrlCard() {
  const { data: product, isLoading } = api.product.getCurrent.useQuery();
  const utils = api.useUtils();

  const updateProductMutation = api.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product URL updated successfully");
      utils.product.getCurrent.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product URL");
    },
  });

  const form = useForm({
    defaultValues: {
      url: product?.url || "",
    },
    onSubmit: async ({ value }) => {
      if (!product) return;

      if (value.url === product.url) {
        toast.error("Product URL is the same");
        return;
      }

      await updateProductMutation.mutateAsync({
        productId: product.id,
        url: value.url || null,
      });
    },
  });

  // Update form values when product data loads
  useEffect(() => {
    if (product) {
      form.setFieldValue("url", product.url || "");
    }
  }, [product, form]);

  if (isLoading || !product) {
    return (
      <Card className="w-full pb-0 text-start">
        <div className="flex justify-between items-center px-6 pt-6">
          <div className="space-y-2">
            <div className="text-base font-medium">Product URL</div>
            <div className="text-sm text-muted-foreground">
              The website URL for your product
            </div>
          </div>
        </div>
        <CardContent>
          <Skeleton className="h-9 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-4 rounded-b-xl md:flex-row border-t bg-sidebar !py-5">
          <div className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
            Enter a valid URL for your product website.
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Card className="w-full pb-0 text-start">
        <div className="flex justify-between items-center px-6 pt-6">
          <div className="space-y-2">
            <div className="text-base font-medium">Product URL</div>
            <div className="text-sm text-muted-foreground">
              The website URL for your product
            </div>
          </div>
        </div>
        <CardContent>
          <form.Field
            name="url"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const result = productUrlSchema.shape.url.safeParse(value);
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
                  disabled={updateProductMutation.isPending}
                  placeholder="https://example.com"
                />
                {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col justify-between gap-4 rounded-b-xl md:flex-row border-t bg-sidebar !py-5">
          <div className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
            Enter a valid URL for your product website.
          </div>
          <Button
            type="submit"
            disabled={updateProductMutation.isPending}
          >
            {updateProductMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
