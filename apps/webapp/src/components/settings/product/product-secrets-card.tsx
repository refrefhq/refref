"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
} from "@refref/ui/components/card";
import { Button } from "@refref/ui/components/button";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { Skeleton } from "@refref/ui/components/skeleton";
import { Separator } from "@refref/ui/components/separator";
import { api } from "@/trpc/react";

export function ProductSecretsCard() {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: product, isLoading: productLoading } =
    api.product.getCurrent.useQuery();

  const { data: secrets, isLoading: secretsLoading } =
    api.productSecrets.get.useQuery(product?.id ?? "", {
      enabled: !!product?.id,
    });

  const isLoading = productLoading || secretsLoading;

  const copyToClipboard = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Failed to copy ${fieldName}`);
    }
  };

  if (isLoading || !secrets) {
    return (
      <Card className="w-full pb-0 text-start">
        <div className="flex justify-between items-center px-6 pt-6">
          <div className="space-y-2">
            <div className="text-base font-medium">Product Credentials</div>
            <div className="text-sm text-muted-foreground">
              Use these credentials to authenticate API requests
            </div>
          </div>
        </div>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-col justify-between gap-4 rounded-b-xl md:flex-row border-t bg-sidebar !py-5">
          <div className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
            Keep your client secret secure and never share it publicly.
          </div>
        </CardFooter>
      </Card>
    );
  }

  const credentials = [
    {
      id: "clientId",
      label: "Client ID",
      value: secrets.clientId,
      masked: false,
    },
    {
      id: "clientSecret",
      label: "Client Secret",
      value: secrets.clientSecret,
      masked: true,
    },
  ];

  return (
    <Card className="w-full pb-0 text-start">
      <div className="flex justify-between items-center px-6 pt-6">
        <div className="space-y-2">
          <div className="text-base font-medium">Product Credentials</div>
          <div className="text-sm text-muted-foreground">
            Use these credentials to authenticate API requests
          </div>
        </div>
      </div>
      <CardContent className="space-y-4">
        {credentials.map((credential) => (
          <div key={credential.id} className="space-y-2">
            <Label htmlFor={credential.id}>{credential.label}</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id={credential.id}
                  value={credential.value}
                  type={credential.masked && !showSecret ? "password" : "text"}
                  readOnly
                  className="font-mono pr-10"
                />
                {credential.masked && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(credential.value, credential.label)
                }
                className="shrink-0"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copiedField === credential.label ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col justify-between gap-4 rounded-b-xl md:flex-row border-t bg-sidebar !py-5">
        <div className="text-center text-muted-foreground text-xs md:text-start md:text-sm">
          Keep your client secret secure and never share it publicly.
        </div>
      </CardFooter>
    </Card>
  );
}
