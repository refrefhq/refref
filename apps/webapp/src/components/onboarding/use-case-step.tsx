"use client";

import React from "react";
import { withFieldGroup } from "@/lib/forms/onboarding-form";
import {
  useCaseLabels,
  useCaseDescriptions,
  useCases,
  useCaseSchema,
} from "@/lib/validations/onboarding";
import { Button } from "@refref/ui/components/button";
import { Checkbox } from "@refref/ui/components/checkbox";
import { Label } from "@refref/ui/components/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const UseCaseStep = withFieldGroup({
  defaultValues: {
    useCase: [] as (typeof useCases)[number][],
  },
  props: {
    onNext: () => {},
    onPrevious: () => {},
    isFirstStep: false,
    isLastStep: false,
    isSubmitting: false,
    submitButtonRef: {
      current: null,
    } as React.RefObject<HTMLButtonElement | null>,
  },
  render: function Render({
    group,
    onNext,
    onPrevious,
    isFirstStep,
    isLastStep,
    isSubmitting,
    submitButtonRef,
  }) {
    const onSubmit = async () => {
      group.form.setFieldMeta("*", (m) => ({ ...m, errors: [] }));
      const errors = await group.validateAllFields("change");
      if (errors.length > 0) {
        return;
      }
      onNext();
    };

    const onBefore = () => {
      Object.values(group.fieldsMap).forEach((field) => {
        group.form.setFieldMeta(field, (m) => ({
          ...m,
          errors: [],
          errorMap: {},
        }));
      });

      onPrevious();
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Which programs are you interested in?
          </h2>
          <p className="text-muted-foreground">
            Choose all that apply. You can change this later.
          </p>
        </div>

        <div className="space-y-3">
          <group.AppField
            name="useCase"
            validators={{
              onChange: useCaseSchema.shape.useCase,
            }}
          >
            {(field) => {
              const value = field.state.value ?? [];

              const toggleOption = (option: (typeof useCases)[number]) => {
                const next = value.includes(option)
                  ? value.filter((v) => v !== option)
                  : [...value, option];
                field.handleChange(next);
              };

              return (
                <>
                  {useCases.map((option) => (
                    <Label
                      key={option}
                      htmlFor={`usecase-${option}`}
                      className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      data-testid={`checkbox-option-${option}`}
                    >
                      <Checkbox
                        id={`usecase-${option}`}
                        checked={value.includes(option)}
                        onCheckedChange={() => toggleOption(option)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-1">
                        <span className="font-medium">
                          {useCaseLabels[option]}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {useCaseDescriptions[option]}
                        </p>
                      </div>
                    </Label>
                  ))}
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive mt-2">
                        {typeof field.state.meta.errors[0] === "string"
                          ? field.state.meta.errors[0]
                          : field.state.meta.errors[0]?.message ||
                            "Invalid value"}
                      </p>
                    )}
                </>
              );
            }}
          </group.AppField>
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBefore}
            disabled={isFirstStep}
            data-testid="onboarding-previous-btn"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            ref={submitButtonRef}
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            data-testid="onboarding-next-btn"
          >
            {isLastStep
              ? isSubmitting
                ? "Creating..."
                : "Complete Setup"
              : "Next"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    );
  },
});
