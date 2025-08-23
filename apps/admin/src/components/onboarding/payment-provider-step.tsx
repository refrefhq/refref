"use client";

import { Label } from "@refref/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@refref/ui/components/radio-group";
import { Input } from "@refref/ui/components/input";
import {
  paymentProviders,
  paymentProviderLabels,
  type PaymentProviderFormData,
} from "@/lib/validations/onboarding";
import { useFormContext, Controller } from "react-hook-form";

export function PaymentProviderStep() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<PaymentProviderFormData>();

  const selectedProvider = watch("paymentProvider");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Payment provider</h2>
        <p className="text-muted-foreground">
          Select your payment processing platform
        </p>
      </div>

      <div className="space-y-4">
        <Controller
          name="paymentProvider"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-3"
            >
              {paymentProviders.map((provider) => (
                <Label
                  key={provider}
                  htmlFor={provider}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={provider} id={provider} />
                  <span className="flex-1">
                    {paymentProviderLabels[provider]}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.paymentProvider && (
          <p className="text-sm text-destructive">
            {errors.paymentProvider.message}
          </p>
        )}

        {selectedProvider === "other" && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="otherPaymentProvider">Please specify</Label>
            <Input
              id="otherPaymentProvider"
              placeholder="Enter your payment provider"
              {...register("otherPaymentProvider")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
