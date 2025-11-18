"use client";

import { useState } from "react";
import { Button } from "@refref/ui/components/button";
import { Card, CardContent } from "@refref/ui/components/card";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Separator } from "@refref/ui/components/separator";
import { Eye, EyeOff, Copy } from "lucide-react";
import { ProductApiKeysCard } from "@/components/settings/product/product-api-keys-card";

export default function ProductAPIPage() {
  const { data: product } = api.product.getCurrent.useQuery();
  const { data: secrets, isLoading } = api.productSecrets.get.useQuery(
    product?.id ?? "",
    {
      enabled: !!product?.id,
    },
  );

  const [showClientSecret, setShowClientSecret] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            API & Secrets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product API credentials and integration settings
          </p>
        </div>
        <Separator />
        <div>
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
    <div className="flex flex-col gap-6 p-6 w-full max-w-[var(--content-max-width)] mx-auto">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API & Secrets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your product API credentials and integration settings
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* API Credentials Card */}
        <Card>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">API Credentials</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use these credentials to integrate RefRef with your application
              </p>
            </div>

            <Separator />

            {/* Client ID */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Client ID
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={secrets?.clientId ?? ""}
                  readOnly
                  className="bg-muted font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(secrets?.clientId ?? "", "Client ID")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Client Secret */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Client Secret
              </Label>
              <p className="text-xs text-muted-foreground">
                Keep this secret secure and never share it publicly
              </p>
              <div className="flex gap-2">
                <Input
                  type={showClientSecret ? "text" : "password"}
                  value={secrets?.clientSecret ?? ""}
                  readOnly
                  className="bg-muted font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                >
                  {showClientSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(
                      secrets?.clientSecret ?? "",
                      "Client Secret",
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Card */}
        <ProductApiKeysCard />
      </div>
    </div>
  );
}
