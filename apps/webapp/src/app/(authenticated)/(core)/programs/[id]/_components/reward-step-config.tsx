import React from "react";
import { useForm } from "@tanstack/react-form";
import { api } from "@/trpc/react";
import {
  programTemplateRewardStepSchemaV2,
  ProgramTemplateRewardStepV2Type,
  RewardRuleConfigV1Type,
} from "@refref/types";
import { toast } from "sonner";
import { StickySaveBarRelative } from "@/components/sticky-save-bar";
import { RewardStepForm } from "../setup/_components/RewardStepForm";

interface RewardStepConfigProps {
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

/**
 * Converts reward rules from database format back to form format
 */
function convertRewardRulesToFormData(
  rules: Array<{
    id: string;
    config: RewardRuleConfigV1Type;
    isActive: boolean | null;
  }>
): ProgramTemplateRewardStepV2Type {
  // Find referrer and referee rules
  const referrerRule = rules.find(
    (rule) => rule.config.participantType === "referrer"
  );
  const refereeRule = rules.find(
    (rule) => rule.config.participantType === "referee"
  );

  // Helper to validate currency
  const validateCurrency = (currency: string | undefined): "USD" | "EUR" | "GBP" => {
    if (currency === "EUR" || currency === "GBP") return currency;
    return "USD"; // Default to USD if invalid or undefined
  };

  return {
    referrerReward: {
      enabled: !!referrerRule && (referrerRule.isActive ?? true),
      valueType:
        referrerRule?.config.reward.unit === "percent" ? "percentage" : "fixed",
      value: referrerRule?.config.reward.amount ?? 10,
      currency: validateCurrency(referrerRule?.config.reward.currency),
    },
    refereeReward: {
      enabled: !!refereeRule && (refereeRule.isActive ?? true),
      valueType:
        refereeRule?.config.reward.unit === "percent" ? "percentage" : "fixed",
      value: refereeRule?.config.reward.amount ?? 20,
      currency: validateCurrency(refereeRule?.config.reward.currency),
      minPurchaseAmount: refereeRule?.config.reward.minPurchaseAmount ?? 50,
      validityDays: refereeRule?.config.reward.validityDays ?? 30,
    },
  };
}

export function RewardStepConfig({
  programId,
  onStepComplete,
}: RewardStepConfigProps) {
  const { data: program } = api.program.getById.useQuery(programId);
  const { data: rewardRules } = api.rewardRules.getByProgram.useQuery(programId);
  const utils = api.useUtils();

  // Mutation to save template configuration
  const saveTemplateConfig =
    api.program.saveTemplateConfiguration.useMutation();

  // Compute initial values from reward rules if they exist
  const initialValues = React.useMemo(() => {
    if (rewardRules && rewardRules.length > 0) {
      return convertRewardRulesToFormData(rewardRules);
    }
    return DEFAULTS;
  }, [rewardRules]);

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: programTemplateRewardStepSchemaV2,
    },
    onSubmit: async ({ value }) => {
      // Transform form values to rewardConfig format
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

      // Save template configuration with reward config
      try {
        await saveTemplateConfig.mutateAsync({
          id: programId,
          templateConfig: {
            rewardConfig:
              value.referrerReward.enabled || value.refereeReward.enabled
                ? rewardConfig
                : undefined,
          },
        });

        toast.success("Reward settings saved successfully");
        form.reset();
        onStepComplete?.();
        await utils.program.getById.invalidate(programId);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save reward settings",
        );
        throw error;
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-[var(--content-max-width)] mx-auto space-y-6">
          <RewardStepForm form={form} />
        </div>
      </div>

      {/* Sticky Save Bar */}
      <form.Subscribe selector={(state) => state.isDirty}>
        {(isDirty) => (
          <StickySaveBarRelative
            isDirty={isDirty}
            onSave={() => form.handleSubmit()}
            onDiscard={() => form.reset()}
            isSaving={saveTemplateConfig.isPending}
            saveText="Save reward settings"
            message="You have unsaved reward changes"
          />
        )}
      </form.Subscribe>
    </div>
  );
}
