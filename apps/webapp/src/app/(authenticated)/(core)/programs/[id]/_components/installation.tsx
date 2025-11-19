"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@refref/ui/components/card";
import { Button } from "@refref/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@refref/ui/components/tabs";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { InstallationStep } from "./installation-step";
import { CredentialsCard } from "./credentials-card";

interface InstallationProps {
  programId: string;
  onStepComplete?: () => void;
}

export function Installation({ programId, onStepComplete }: InstallationProps) {
  const router = useRouter();

  // Fetch program data to get productId
  const { data: program, isLoading: programLoading } =
    api.program.getById.useQuery(programId);

  // Fetch product secrets
  const { data: secrets, isLoading: secretsLoading } =
    api.productSecrets.get.useQuery(program?.productId ?? "", {
      enabled: !!program?.productId,
    });

  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Installation marked as complete");
      onStepComplete?.();
      router.push(`/programs/${programId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = programLoading || secretsLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">
              Loading credentials...
            </span>
          </div>
        ) : program && secrets ? (
          <div className="space-y-4">
            <CredentialsCard
              productId={program.productId}
              programId={programId}
              clientId={secrets.clientId}
              clientSecret={secrets.clientSecret}
            />
            <InstallationStep
              step={1}
              title="Integrate Referral UI Elements"
              description="Add the necessary RefRef components or snippets to display referral links, forms, or dashboards within your application."
              docsUrl="https://refref.ai/docs/platform/widget#installation"
            />
            <InstallationStep
              step={2}
              title="Integrate Attribution Script"
              description="Add the RefRef attribution script to your landing pages and signup flow to track referred users."
              docsUrl="https://refref.ai/docs/platform/attribution-script#installation"
            />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load installation credentials</p>
          </div>
        )}
      </div>
    </div>
  );
}
