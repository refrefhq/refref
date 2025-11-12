"use client";
import { useState, ReactNode, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperTitle,
  StepperTrigger,
} from "@refref/ui/components/stepper";
import { Loader2, Users, Rocket } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { Button } from "@refref/ui/components/button";
import { RewardStep } from "./_components/RewardStep";
import { BrandStep } from "@/components/program-setup/brand-step";
import { toast } from "sonner";
import assert from "assert";
import { ProgramTemplateStepKeyType } from "@refref/types";

// Map step keys to their respective components
const stepComponentMap: Record<
  ProgramTemplateStepKeyType,
  React.ComponentType<any>
> = {
  brand: BrandStep,
  reward: RewardStep,
};

// Define a common interface for step refs
interface StepRef {
  submitForm: () => Promise<any>; // Return type depends on step, use 'any' for now
}

// Dynamically build steps from template config
type StepDef = {
  key: string;
  title: string;
  description: string | undefined;
  Component: React.ComponentType<any>;
};

export default function ProgramSetupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: program, isLoading: isLoadingProgram } =
    api.program.getById.useQuery(params?.id ?? "");

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //! aggregated config for steps done till now
  const [aggregatedConfig, setAggregatedConfig] = useState<Record<string, any>>(
    {},
  );

  const stepRef = useRef<StepRef>(null);

  const saveTemplateConfigurationMutation =
    api.program.saveTemplateConfiguration.useMutation({
      onSuccess: (data) => {
        toast.success("Program setup completed successfully!");
      },
      onError: (error) => {
        toast.error(`Program setup failed: ${error.message}`);
        console.error("Program setup failed:", error);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });

  if (isLoadingProgram || !program) {
    return (
      <div className="flex flex-1 items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading program...</span>
      </div>
    );
  }

  // Dynamically build steps from template config
  const templateSteps: Array<{
    key: ProgramTemplateStepKeyType;
    title: string;
    description?: string;
  }> = program.programTemplate?.config?.steps ?? [];

  const STEPS: StepDef[] = templateSteps
    .map(
      (step: {
        key: ProgramTemplateStepKeyType;
        title: string;
        description?: string;
      }) => {
        const Comp = stepComponentMap[step.key];
        return {
          key: step.key,
          title: step.title,
          description: step.description,
          Component: Comp,
        };
      },
    )
    .filter((step) => !!step);

  // Calculate pending steps and completion status for the top bar
  const pendingSteps =
    program?.setup?.steps?.filter((step) => step.isRequired && !step.isComplete)
      .length ?? 0;

  const allRequiredComplete = program?.setup?.steps
    ?.filter((step) => step.isRequired)
    .every((step) => step.isComplete);

  // Breadcrumbs for the top bar
  const breadcrumbs = [
    { label: "Programs", href: "/programs" },
    { label: program?.name ?? "...", href: `/programs/${params?.id}` },
    { label: "Setup", href: `/programs/${params?.id}/setup` },
  ];

  // Go Live handler (stub, as in edit page)
  const handleGoLive = () => {
    // TODO: Implement Go Live logic if needed
  };

  // Helper to map step data to the consolidated config structure
  // Now returns raw data under a key specific to the step
  function mapStepDataToConsolidated(stepKey: string, data: any) {
    return { [stepKey]: data };
  }

  // Function to handle moving to the previous step
  function handlePrevious() {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }

  // Function to handle moving to the next step or completing the setup
  async function handleNextOrComplete() {
    if (!stepRef.current) return;

    try {
      setIsSubmitting(true);

      const currentStepKey = STEPS[activeStep]?.key;

      if (!currentStepKey) {
        throw new Error("Could not determine current step key.");
      }

      // Validate and get data from the current step
      const stepData = await stepRef.current.submitForm();

      // Aggregate the data
      const newAggregatedConfig = {
        ...aggregatedConfig,
        ...mapStepDataToConsolidated(currentStepKey, stepData),
      };
      setAggregatedConfig(newAggregatedConfig);

      assert(program);

      // If it's the last step, submit the whole form
      if (activeStep === STEPS.length - 1) {
        // Get brand and reward config from aggregated data
        const brandConfig = newAggregatedConfig.brand;
        const rewardConfig = newAggregatedConfig.reward;

        // Save both brand and reward config together
        // Brand config is at root level, reward config is in templateConfig
        const finalInput = {
          id: program.id,
          templateConfig: {
            rewardConfig: rewardConfig,
          },
          brandConfig: brandConfig,
        };

        console.log("Submitting template config:", finalInput);
        await saveTemplateConfigurationMutation.mutateAsync(finalInput);

        // Navigate to program page on success
        router.push(`/programs/${program.id}`);
      } else {
        // Otherwise, move to the next step
        setActiveStep((prev) => prev + 1);
        setIsSubmitting(false); // Reset submitting state for next step
      }
    } catch (error) {
      console.error("Error in setup step:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during setup",
      );
      setIsSubmitting(false); // Reset submitting state on error
    }
  }

  return (
    <>
      <SiteHeader breadcrumbs={<SiteBreadcrumbs items={breadcrumbs} />} />

      <div className="overflow-auto">
        {/* Simplified Stepper */}
        <div className="border-b bg-background px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <Stepper value={activeStep} className="items-start gap-4">
              {STEPS.map((step: StepDef, idx: number) => (
                <StepperItem key={step.key} step={idx} className="flex-1">
                  <StepperTrigger className="w-full flex-col items-start gap-2 rounded">
                    <StepperIndicator asChild className="bg-border h-1 w-full">
                      <span className="sr-only">{idx + 1}</span>
                    </StepperIndicator>
                    <div className="space-y-0.5">
                      <StepperTitle className="text-sm font-medium">
                        {step.title}
                      </StepperTitle>
                    </div>
                  </StepperTrigger>
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {(() => {
            const step = STEPS[activeStep];
            if (!step || !step.Component) return null;
            const StepComponent = step.Component;
            return <StepComponent ref={stepRef} programId={params?.id ?? ""} />;
          })()}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto bg-background border-t">
          <div className="flex justify-between items-center p-4 max-w-3xl mx-auto">
            <Button
              onClick={handlePrevious}
              disabled={activeStep === 0 || isSubmitting}
              variant="outline"
              size="default"
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {activeStep + 1} of {STEPS.length}
            </div>

            <Button
              onClick={handleNextOrComplete}
              disabled={isSubmitting}
              size="default"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {activeStep === STEPS.length - 1
                    ? "Completing..."
                    : "Saving..."}
                </>
              ) : activeStep === STEPS.length - 1 ? (
                "Complete Setup"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
