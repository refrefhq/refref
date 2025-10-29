"use client";

import React from "react";
import { withFieldGroup } from "@/lib/forms/onboarding-form";
import {
  appTypeLabels,
  appTypes,
  appTypeSchema,
} from "@/lib/validations/onboarding";
import { Button } from "@refref/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const AppTypeStep = withFieldGroup({
  // These values are only used for type-checking, not at runtime
  defaultValues: {
    appType: undefined as unknown as (typeof appTypes)[number] | undefined,
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
      // ! important otherwise if we go to previous step, the errors from next step will still be present
      group.form.setFieldMeta("*", (m) => ({ ...m, errors: [] }));
      const errors = await group.validateAllFields("change");
      // If any field returned an error, stop here
      if (errors.length > 0) {
        return;
      }
      onNext();
    };

    const onBefore = () => {
      // ! important otherwise if we go to previous step, the errors from next step will still be present
      Object.values(group.fieldsMap).forEach((field) => {
        console.log("field is ", field);
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
          <h2 className="text-2xl font-semibold">Type of application</h2>
          <p className="text-muted-foreground">
            Select the type that best describes your product
          </p>
        </div>

        <div className="space-y-4">
          <group.AppField
            name="appType"
            validators={{
              onChange: appTypeSchema.shape.appType,
            }}
          >
            {(field) => (
              <field.RadioField options={appTypes} labels={appTypeLabels} />
            )}
          </group.AppField>
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onBefore}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            ref={submitButtonRef}
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
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
