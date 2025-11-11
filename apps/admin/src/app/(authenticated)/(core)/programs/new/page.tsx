"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function NewProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams?.get("templateId");
  const templateName = searchParams?.get("title");
  const { data: activeProduct } = authClient.useActiveOrganization();

  // Create program mutation
  const createProgram = api.program.create.useMutation({
    onSuccess: (program) => {
      toast.success("Program created");
      router.replace(`/programs/${program.id}/setup`);
    },
    onError: (error) => {
      toast.error(error.message);
      router.replace("/programs");
    },
  });

  // If no template ID, redirect back
  useEffect(() => {
    if (!templateId) router.replace("/programs");
  }, [templateId, router]);

  // Create program as soon as templateId and activeProduct are available
  useEffect(() => {
    if (!templateId || !activeProduct?.id) return;
    // Only trigger if not already loading or succeeded
    if (
      !createProgram.isPending &&
      !createProgram.isSuccess &&
      !createProgram.isError
    ) {
      createProgram.mutate({
        name: templateName ?? "Untitled Program",
        description: "",
        productId: activeProduct.id,
        templateId,
      });
    }
  }, [templateId, activeProduct, createProgram]);

  // Minimal loading spinner
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Creating program...</span>
    </div>
  );
}
