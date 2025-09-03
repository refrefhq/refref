"use client";

import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import { Input } from "@refref/ui/components/input";
import { Label } from "@refref/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@refref/ui/components/radio-group";
import type { appTypes, paymentProviders } from "@/lib/validations/onboarding";

// Define form values type
export type OnboardingFormValues = {
  projectName: string;
  projectUrl: string;
  appType: (typeof appTypes)[number] | undefined;
  paymentProvider: (typeof paymentProviders)[number] | undefined;
  otherPaymentProvider: string | undefined;
};

// Create form contexts - no type parameters needed
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

// Custom field component for text inputs
function TextField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  const field = useFieldContext<string>();

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {typeof field.state.meta.errors[0] === "string"
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0]?.message || "Invalid value"}
        </p>
      )}
    </div>
  );
}

// Custom field component for optional text inputs
function OptionalTextField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  const field = useFieldContext<string | undefined>();

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        placeholder={placeholder}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {typeof field.state.meta.errors[0] === "string"
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0]?.message || "Invalid value"}
        </p>
      )}
    </div>
  );
}

// Custom field component for radio groups
function RadioField<T extends string>({
  options,
  labels,
}: {
  options: readonly T[];
  labels: Record<T, string>;
}) {
  const field = useFieldContext<T | undefined>();

  return (
    <>
      <RadioGroup
        value={field.state.value}
        onValueChange={(v) => field.handleChange(v as T)}
        className="space-y-3"
      >
        {options.map((option) => (
          <Label
            key={option}
            htmlFor={option}
            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <RadioGroupItem value={option} id={option} />
            <span className="flex-1">{labels[option]}</span>
          </Label>
        ))}
      </RadioGroup>
      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          {typeof field.state.meta.errors[0] === "string"
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0]?.message || "Invalid value"}
        </p>
      )}
    </>
  );
}

// Create form hook with field components
export const {
  useAppForm: useOnboardingForm,
  withForm,
  withFieldGroup,
} = createFormHook({
  fieldComponents: {
    TextField,
    OptionalTextField,
    RadioField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

// Type for the form returned by useOnboardingForm
export type OnboardingFormApi = ReturnType<typeof useOnboardingForm>;
