"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { SiteHeader } from "@/components/site-header";
import { SetupCard } from "@/components/program-setup-card";
import { useSidebar } from "@refref/ui/components/sidebar";
import { useWindowSize } from "@uidotdev/usehooks";
import { DesignConfig } from "./_components/design-config";
import { RewardStep } from "./setup/_components/RewardStep";
import { NotificationSetup } from "./_components/notification-setup";
import { Installation } from "./_components/installation";
import { canProceedToStep } from "@/lib/program";
import { toast } from "sonner";
import { Users, Rocket, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@refref/ui/components/alert-dialog";
import { Button } from "@refref/ui/components/button";

export default function ProgramSetupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const searchParams = useSearchParams();
  const step = searchParams?.get("step") ?? null;

  const { width } = useWindowSize();
  const { open, setOpen } = useSidebar();

  const { data: program } = api.program.getById.useQuery(params?.id ?? "");
  const updateConfig = api.program.updateConfig.useMutation({
    onSuccess: () => {
      // Refresh program data
      utils.program.getById.invalidate(params?.id ?? "");
    },
  });
  const utils = api.useUtils();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteProgram = api.program.delete.useMutation({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      router.push("/programs");
      utils.program.getAll.invalidate();
    },
  });

  // Redirect to setup if program is not configured yet
  useEffect(() => {
    if (!program) return;

    if (program.status === "pending_setup") {
      router.replace(`/programs/${params?.id}/setup`);
    }
  }, [program, params?.id, router]);

  // Handle URL step parameter and validation
  useEffect(() => {
    if (!program) return;

    const stepId = searchParams?.get("step");
  }, [program, searchParams, params?.id, router]);

  useEffect(() => {
    if (width && width < 1024 && open) {
      setOpen(false);
    }
  }, [width, open, setOpen]);

  if (!program) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading program...</span>
      </div>
    );
  }

  const pendingSteps = program.setup.steps.filter(
    (step) => step.isRequired && !step.isComplete,
  ).length;

  const allRequiredComplete = program.setup.steps
    .filter((step) => step.isRequired)
    .every((step) => step.isComplete);

  const handleGoLive = () => {};

  const breadcrumbs = [
    { label: "Programs", href: "/programs" },
    { label: program.name, href: `/programs/${params?.id}` },
  ];

  const handleStepChange = (stepId: string) => {
    if (!canProceedToStep(stepId, program?.config)) {
      toast.error("Please complete the previous required steps first");
      return;
    }
    router.push(`/programs/${params?.id}?step=${stepId}`);
  };

  const handleStepComplete = () => {
    // Refresh program data to update setup progress
    utils.program.getById.invalidate(params?.id ?? "");
  };

  return (
    <>
      <SiteHeader
        breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />}
        meta={
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Program
            </Button>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this program? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      deleteProgram.mutate({ id: params?.id ?? "" })
                    }
                    disabled={deleteProgram.isPending}
                  >
                    {deleteProgram.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />
      <div className="flex flex-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-40 border-r bg-muted/40">
          <div className="px-2 py-4 space-y-1">
            {program.setup.steps.map((s) => (
              <SetupCard
                key={s.id}
                title={s.title}
                onClick={() => handleStepChange(s.id)}
                isActive={step === s.id}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto ml-64">
          {step === "design" && (
            <DesignConfig
              programId={params?.id ?? ""}
              onStepComplete={handleStepComplete}
            />
          )}
          {step === "rewards" && (
            <RewardStep
              programId={params?.id ?? ""}
              onStepComplete={handleStepComplete}
            />
          )}
          {step === "notifications" && (
            <NotificationSetup
              programId={params?.id ?? ""}
              onStepComplete={handleStepComplete}
            />
          )}
          {(step === "installation" || !step) && (
            <Installation
              programId={params?.id ?? ""}
              onStepComplete={handleStepComplete}
            />
          )}
        </div>
      </div>
    </>
  );
}
