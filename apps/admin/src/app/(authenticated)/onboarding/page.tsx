"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@refref/ui/components/button";
import { signOut, useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@refref/ui/components/card";
import { LogOut } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
} from "@refref/ui/components/stepper";
import { ProductInfoStep } from "@/components/onboarding/product-info-step";
import { AppTypeStep } from "@/components/onboarding/app-type-step";
import { PaymentProviderStep } from "@/components/onboarding/payment-provider-step";
import {
  OnboardingFormValues,
  useOnboardingForm,
} from "@/lib/forms/onboarding-form";
import { onboardingSchema } from "@/lib/validations/onboarding";
import z from "zod";
import { appTypes } from "@/lib/validations/onboarding";
import { paymentProviders } from "@/lib/validations/onboarding";

const steps = [
  {
    id: 1,
    title: "Product Info",
  },
  {
    id: 2,
    title: "App Type",
  },
  {
    id: 3,
    title: "Payment Provider",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [currentStep, setCurrentStep] = useState(1);

  const createProject = api.project.createWithOnboarding.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      router.push("/programs");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  const form = useOnboardingForm({
    defaultValues: {
      projectName: "",
      projectUrl: "",
      appType: "saas",
      paymentProvider: "stripe",
      otherPaymentProvider: "",
    } as z.input<typeof onboardingSchema>,
    validators: {
      onSubmit: onboardingSchema,
    },
    onSubmit: async ({ value }) => {
      // Transform URL if needed
      let url = value.projectUrl;
      if (!url.match(/^https?:\/\//)) {
        url = `https://${url}`;
      }

      createProject.mutate({
        name: value.projectName,
        url,
        appType: value.appType,
        paymentProvider: value.paymentProvider,
        otherPaymentProvider: value.otherPaymentProvider,
      });
    },
  });

  // Ref for the submit button to enable Enter key submission.
  // We use a ref to programmatically click the button because the validation logic
  // lives inside each step component's onSubmit handler. This ensures we reuse the
  // same validation → progression flow rather than duplicating validation logic here.
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Enter key press to submit form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Trigger the button click. The button's disabled state already prevents
        // double-submission, so no need to check isPending here.
        submitButtonRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      form.handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  function handleLogout() {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Setup your project</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Horizontal Stepper with Labels */}
          <Stepper
            value={currentStep}
            onValueChange={setCurrentStep}
            className="items-start gap-4"
          >
            {steps.map((step) => (
              <StepperItem
                key={step.id}
                step={step.id}
                completed={currentStep > step.id}
                className="flex-1"
              >
                <StepperTrigger className="w-full flex-col items-start gap-2 rounded pointer-events-none">
                  <StepperIndicator
                    asChild
                    className="bg-border h-1 w-full data-[state=active]:bg-primary data-[state=completed]:bg-primary transition-colors"
                  >
                    <span className="sr-only">{step.id}</span>
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

          {/* Form Content Card */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <ProductInfoStep
                  form={form}
                  fields={{
                    projectName: "projectName",
                    projectUrl: "projectUrl",
                  }}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirstStep={true}
                  isLastStep={false}
                  isSubmitting={createProject.isPending}
                  submitButtonRef={submitButtonRef}
                />
              )}
              {currentStep === 2 && (
                <AppTypeStep
                  form={form}
                  fields={{ appType: "appType" }}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirstStep={false}
                  isLastStep={false}
                  isSubmitting={createProject.isPending}
                  submitButtonRef={submitButtonRef}
                />
              )}
              {currentStep === 3 && (
                <PaymentProviderStep
                  form={form}
                  fields={{
                    paymentProvider: "paymentProvider",
                    otherPaymentProvider: "otherPaymentProvider",
                  }}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirstStep={false}
                  isLastStep={true}
                  isSubmitting={createProject.isPending}
                  submitButtonRef={submitButtonRef}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
