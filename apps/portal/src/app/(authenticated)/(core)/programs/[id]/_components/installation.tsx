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
import { InstallationStep } from "./installation-step";

interface InstallationProps {
  programId: string;
  onStepComplete?: () => void;
}

export function Installation({ programId, onStepComplete }: InstallationProps) {
  const router = useRouter();
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

  return (
    <>
      <div className="py-4 border-b px-4 lg:px-6 flex items-center justify-between sticky">
        <h2 className="text-lg font-bold">Installation Steps</h2>
      </div>
      <div className="flex-1 p-4 lg:p-6">
        <div className="space-y-4">
          <InstallationStep
            step={1}
            title="Integrate Referral UI Elements"
            description="Add the necessary RefRef components or snippets to display referral links, forms, or dashboards within your application."
            docsUrl="https://refref.ai"
          />
          <InstallationStep
            step={2}
            title="Integrate Attribution Script"
            description="Add the RefRef attribution script to your landing pages and signup flow to track referred users."
            docsUrl="https://refref.ai"
          />
        </div>
      </div>
    </>
  );
}
