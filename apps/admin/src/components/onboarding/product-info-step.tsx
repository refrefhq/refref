"use client";

import { withFieldGroup } from "@/lib/forms/onboarding-form";
import { productInfoSchema } from "@/lib/validations/onboarding";
import { Button } from "@refref/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ProductInfoStep = withFieldGroup({
  // These values are only used for type-checking, not at runtime
  defaultValues: {
    productName: "",
    productUrl: "",
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
      const errors = await group.validateAllFields("submit");
      if (errors.length > 0) {
        return;
      }
      onNext();
    };

    const onBefore = () => {
      // ! important otherwise if we go to previous step, the errors from next step will still be present
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
          <h2 className="text-2xl font-semibold">Tell us about your product</h2>
          <p className="text-muted-foreground">
            We'll use this information to tailor your setup process
          </p>
        </div>

        <div className="space-y-4">
          <group.AppField
            name="productName"
            validators={{
              onChange: productInfoSchema.shape.productName,
            }}
          >
            {(field) => (
              <field.TextField
                label="Product name"
                placeholder="Enter your product name"
              />
            )}
          </group.AppField>

          <group.AppField
            name="productUrl"
            validators={{
              onChange: productInfoSchema.shape.productUrl,
            }}
          >
            {(field) => (
              <field.TextField
                label="Website URL"
                placeholder="example.com or https://example.com"
                type="text"
              />
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
