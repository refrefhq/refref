"use client";

import { Label } from "@refref/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@refref/ui/components/radio-group";
import {
  appTypes,
  appTypeLabels,
  type AppTypeFormData,
} from "@/lib/validations/onboarding";
import { useFormContext, Controller } from "react-hook-form";

export function AppTypeStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AppTypeFormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Type of application</h2>
        <p className="text-muted-foreground">
          Select the type that best describes your product
        </p>
      </div>

      <div className="space-y-4">
        <Controller
          name="appType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-3"
            >
              {appTypes.map((type) => (
                <Label
                  key={type}
                  htmlFor={type}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={type} id={type} />
                  <span className="flex-1">{appTypeLabels[type]}</span>
                </Label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.appType && (
          <p className="text-sm text-destructive">{errors.appType.message}</p>
        )}
      </div>
    </div>
  );
}
