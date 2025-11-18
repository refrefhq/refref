import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import {
  programTemplateRewardStepSchemaV2,
  ProgramTemplateRewardStepV2Type,
  RewardConfigType,
} from "@refref/types";
import { RewardStepForm } from "./RewardStepForm";

interface RewardStepProps {
  programId: string;
  onStepComplete?: () => void;
}

const DEFAULTS: ProgramTemplateRewardStepV2Type = {
  referrerReward: {
    enabled: true,
    valueType: "fixed",
    value: 10,
    currency: "USD",
  },
  refereeReward: {
    enabled: true,
    valueType: "percentage",
    value: 20,
    currency: "USD",
    minPurchaseAmount: 50,
    validityDays: 30,
  },
};

export interface RewardStepRef {
  submitForm: () => Promise<RewardConfigType | undefined>;
}

export const RewardStep = forwardRef<RewardStepRef, RewardStepProps>(
  ({ programId }, ref) => {
    const { data: program } = api.program.getById.useQuery(programId);

    const form = useForm({
      defaultValues: DEFAULTS,
      validators: {
        onSubmit: programTemplateRewardStepSchemaV2,
      },
      onSubmit: async ({ value }) => {
        console.log("RewardStep internal onSubmit called:", value);
        // Just return the data, don't save here
        return Promise.resolve();
      },
    });

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        // Validate the form
        await form.validateAllFields("submit");

        // Check if the form is valid
        if (form.state.isValidating || !form.state.isValid) {
          console.log("RewardStep validation failed", form.state.errors);
          throw new Error(
            "Reward configuration is invalid. Please check the fields.",
          );
        }

        const value = form.state.values;

        // Transform the data to match the expected schema
        const rewardConfig = {
          referrer: {
            type: "cash" as const,
            valueType: value.referrerReward.valueType,
            value: value.referrerReward.value,
            currency: value.referrerReward.currency,
          },
          referee: {
            type: "discount" as const,
            valueType: value.refereeReward.valueType,
            value: value.refereeReward.value,
            currency: value.refereeReward.currency,
            minPurchaseAmount: value.refereeReward.minPurchaseAmount,
            validityDays: value.refereeReward.validityDays,
          },
        };

        console.log(
          "RewardStep submitForm resolving with config:",
          rewardConfig,
        );

        // Return the transformed reward config
        return value.referrerReward.enabled || value.refereeReward.enabled
          ? rewardConfig
          : undefined;
      },
    }));

    return (
      <div className="max-w-3xl mx-auto space-y-6 p-4">
        <RewardStepForm form={form} />
      </div>
    );
  },
);

RewardStep.displayName = "RewardStep";
