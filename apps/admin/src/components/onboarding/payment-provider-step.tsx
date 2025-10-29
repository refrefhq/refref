"use client";

import { withFieldGroup } from "@/lib/forms/onboarding-form";
import {
  paymentProviderLabels,
  paymentProviders,
  paymentProviderSchema,
} from "@/lib/validations/onboarding";
import { z } from "zod";
import { Button } from "@refref/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PaymentProviderStep = withFieldGroup({
  defaultValues: {
    paymentProvider: undefined as unknown as
      | (typeof paymentProviders)[number]
      | undefined,
    otherPaymentProvider: undefined as unknown as string | undefined,
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
          <h2 className="text-2xl font-semibold">Payment provider</h2>
          <p className="text-muted-foreground">
            Select your payment processing platform
          </p>
        </div>

        <div className="space-y-4">
          <group.AppField
            name="paymentProvider"
            validators={{
              onChange: paymentProviderSchema.shape.paymentProvider,
            }}
          >
            {(field) => (
              <field.RadioField
                options={paymentProviders}
                labels={paymentProviderLabels}
              />
            )}
          </group.AppField>

          <group.Subscribe selector={(s) => s.values.paymentProvider}>
            {(paymentProvider) =>
              paymentProvider === "other" && (
                <group.AppField
                  name="otherPaymentProvider"
                  validators={{
                    onChange: z
                      .string()
                      .min(1, "Please specify your payment provider"),
                  }}
                >
                  {(field) => (
                    <field.OptionalTextField
                      label="Please specify"
                      placeholder="Enter your payment provider"
                    />
                  )}
                </group.AppField>
              )
            }
          </group.Subscribe>
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
