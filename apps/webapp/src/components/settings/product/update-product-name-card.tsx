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

const productNameSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Product name is too long"),
});

export function UpdateProductNameCard() {
  const { data: product, isLoading } = api.product.getCurrent.useQuery();
  const utils = api.useUtils();

  const updateProductMutation = api.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product name updated successfully");
      utils.product.getCurrent.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product name");
    },
  });

  const form = useForm({
    defaultValues: {
      name: product?.name || "",
    },
    onSubmit: async ({ value }) => {
      if (!product) return;

      if (value.name === product.name) {
        toast.error("Product name is the same");
        return;
      }

      await updateProductMutation.mutateAsync({
        productId: product.id,
        name: value.name,
      });
    },
  });

  // Update form values when product data loads
  useEffect(() => {
    if (product) {
      form.setFieldValue("name", product.name);
    }
  }, [product, form]);

  if (isLoading || !product) {
    return (
      <Card className="w-full pb-0 text-start">
        <div className="flex justify-between items-center px-6 pt-6">
          <div className="space-y-2">
            <div className="text-base font-medium">Product name</div>
            <div className="text-sm text-muted-foreground">
              The name of your product
            </div>
          </div>
        </div>
        <CardContent>
          <Skeleton className="h-9 w-full" />
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-4 rounded-b-xl md:flex-row border-t bg-sidebar !py-5">
          <div className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
            Please use 100 characters at maximum.
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
            <div className="text-base font-medium">Product name</div>
            <div className="text-sm text-muted-foreground">
              The name of your product
            </div>
          </div>
        </div>
        <CardContent>
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = productNameSchema.shape.name.safeParse(value);
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
                  disabled={updateProductMutation.isPending}
                  placeholder="Enter product name"
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
            Please use 100 characters at maximum.
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
