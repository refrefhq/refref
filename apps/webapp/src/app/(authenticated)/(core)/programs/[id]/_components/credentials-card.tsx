"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Button } from "@refref/ui/components/button";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";

interface CredentialsCardProps {
  productId: string;
  programId: string;
  clientId: string;
  clientSecret: string;
}

export function CredentialsCard({
  productId,
  programId,
  clientId,
  clientSecret,
}: CredentialsCardProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error(`Failed to copy ${fieldName}`);
    }
  };

  const credentials = [
    {
      id: "productId",
      label: "Product ID",
      value: productId,
      masked: false,
    },
    {
      id: "programId",
      label: "Program ID",
      value: programId,
      masked: false,
    },
    {
      id: "clientId",
      label: "Client ID",
      value: clientId,
      masked: false,
    },
    {
      id: "clientSecret",
      label: "Client Secret",
      value: clientSecret,
      masked: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation Credentials</CardTitle>
        <CardDescription>
          Use these credentials to integrate RefRef into your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {credentials.map((credential) => (
            <div key={credential.id} className="grid gap-2">
              <Label htmlFor={credential.id}>{credential.label}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id={credential.id}
                    value={credential.value}
                    type={
                      credential.masked && !showSecret ? "password" : "text"
                    }
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
        </div>
      </CardContent>
    </Card>
  );
}
