"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@refref/ui/components/button";
import { signOut, useSession } from "@/lib/auth-client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@refref/ui/components/card";
import { LogOut, ChevronRight, ChevronLeft } from "lucide-react";
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
  onboardingSchema,
  type OnboardingFormData,
  productInfoSchema,
  appTypeSchema,
  paymentProviderSchema,
} from "@/lib/validations/onboarding";

const steps = [
  {
    id: 1,
    title: "Product Info",
    component: ProductInfoStep,
    fields: ["projectName", "projectUrl"] as const,
    schema: productInfoSchema,
  },
  {
    id: 2,
    title: "App Type",
    component: AppTypeStep,
    fields: ["appType"] as const,
    schema: appTypeSchema,
  },
  {
    id: 3,
    title: "Payment Provider",
    component: PaymentProviderStep,
    fields: ["paymentProvider", "otherPaymentProvider"] as const,
    schema: paymentProviderSchema,
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

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      projectName: "",
      projectUrl: "",
      appType: undefined,
      paymentProvider: undefined,
      otherPaymentProvider: "",
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    const currentStepData = steps[currentStep - 1];
    if (currentStepData && currentStepData.schema) {
      const fieldsToValidate = currentStepData.fields;
      const isValid = await form.trigger(fieldsToValidate as any);

      if (!isValid) {
        return;
      }
    }

    // Clear errors for next step's fields to prevent showing errors prematurely
    const nextStepData = steps[currentStep];
    if (nextStepData) {
      form.clearErrors(nextStepData.fields as any);
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: OnboardingFormData) => {
    createProject.mutate({
      name: data.projectName,
      url: data.projectUrl,
      appType: data.appType,
      paymentProvider: data.paymentProvider,
      otherPaymentProvider: data.otherPaymentProvider,
    });
  };

  function handleLogout() {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
        },
      },
    });
  }

  const CurrentStepComponent = steps[currentStep - 1]?.component;

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
              <FormProvider {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentStep < steps.length) {
                      handleNext();
                    } else {
                      form.handleSubmit(handleSubmit)();
                    }
                  }}
                  className="space-y-6"
                >
                  {CurrentStepComponent && <CurrentStepComponent />}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep < steps.length ? (
                      <Button type="submit">
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={createProject.isPending}>
                        {createProject.isPending
                          ? "Creating..."
                          : "Complete Setup"}
                      </Button>
                    )}
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
