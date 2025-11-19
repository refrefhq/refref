import type { ProgramConfigV1Type } from "@refref/types";

export interface ProgramConfig {
  style?: string | null;
  notification?: string | null;
  reward?: string | null;
}

export interface ParsedProgramConfig {
  notification: Record<string, any> | null;
  reward: Record<string, any> | null;
  version: number;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isComplete: boolean;
  docLink?: string;
}

export interface SetupProgress {
  steps: SetupStep[];
  isComplete: boolean;
}

export const SETUP_STEPS = [
  {
    id: "design",
    title: "Design",
    description:
      "Configure the appearance and behavior of your referral widget.",
    isRequired: true,
    docLink: "/docs/design-configuration",
  },
  {
    id: "rewards",
    title: "Rewards",
    description:
      "Configure how referrers and new users will be rewarded in your program.",
    isRequired: true,
    docLink: "/docs/reward-configuration",
  },
  // {
  //   id: "notifications",
  //   title: "Notifications",
  //   description:
  //     "Set up email and in-app notifications for your referral program.",
  //   isRequired: false,
  //   docLink: "/docs/notifications",
  // },
  {
    id: "installation",
    title: "Installation",
    description: "Get the code to add the referral widget to your application.",
    isRequired: true,
    docLink: "/docs/installation",
  },
] as const;

export function parseConfig(
  config: ProgramConfigV1Type | null | undefined,
): ParsedProgramConfig {
  if (!config) {
    return {
      notification: null,
      reward: null,
      version: 1,
    };
  }

  return {
    notification: config.notification ?? null,
    reward:
      config.actions?.find((action) => action.actionId === "referral")
        ?.reward ?? null,
    version: config.schemaVersion,
  };
}

export function getSetupProgress(
  config: ProgramConfigV1Type | null | undefined,
): SetupProgress {
  const parsedConfig = parseConfig(config);

  // Map steps with completion status
  const steps = SETUP_STEPS.map((step) => {
    let isComplete = false;

    switch (step.id) {
      case "design":
        isComplete = true;
        break;
      case "rewards":
        isComplete = true;
        break;
      // case "notifications":
      //   isComplete = !!(
      //     parsedConfig.notification &&
      //     Object.keys(parsedConfig.notification).length > 0 &&
      //     !parsedConfig.notification.installation?.completed
      //   );
      //   break;
      case "installation":
        isComplete = !!parsedConfig.notification?.installation?.completed;
        break;
    }

    return {
      ...step,
      isComplete,
    };
  });

  return {
    steps,
    isComplete: steps.every((step) => !step.isRequired || step.isComplete),
  };
}

export function isStepRequired(stepId: string): boolean {
  return SETUP_STEPS.find((step) => step.id === stepId)?.isRequired ?? false;
}

export function getNextIncompleteStep(
  config: ProgramConfigV1Type | null | undefined,
): string {
  const { steps } = getSetupProgress(config);
  const nextIncompleteStep = steps.find((step) => !step.isComplete);
  return nextIncompleteStep?.id ?? SETUP_STEPS[0].id;
}

export function canProceedToStep(
  stepId: string,
  config: ProgramConfigV1Type | null | undefined,
): boolean {
  const { steps } = getSetupProgress(config);
  const stepIndex = steps.findIndex((step) => step.id === stepId);

  if (stepIndex === -1) return false;
  if (stepIndex === 0) return true;

  // Check if all required steps before this one are complete
  return steps
    .slice(0, stepIndex)
    .every((step) => !step.isRequired || step.isComplete);
}
