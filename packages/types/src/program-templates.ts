import type { ProgramTemplateConfigType } from "./program-config";

/**
 * Program template definition
 */
export interface ProgramTemplate {
  id: string;
  templateName: string;
  description: string;
  config: ProgramTemplateConfigType;
  status?: "available" | "coming_soon";
}

/**
 * Available program template IDs
 */
export const PROGRAM_TEMPLATE_IDS = {
  STANDARD: "standard",
  SINGLE_SIDED: "single-sided",
  AFFILIATE: "affiliate",
} as const;

export type ProgramTemplateId =
  (typeof PROGRAM_TEMPLATE_IDS)[keyof typeof PROGRAM_TEMPLATE_IDS];

/**
 * Program template definitions
 * These templates define the setup wizard flow for creating programs
 */
export const PROGRAM_TEMPLATES: Record<ProgramTemplateId, ProgramTemplate> = {
  [PROGRAM_TEMPLATE_IDS.SINGLE_SIDED]: {
    id: PROGRAM_TEMPLATE_IDS.SINGLE_SIDED,
    templateName: "Single-Sided Referral Program",
    description:
      "Reward only the referrer - perfect for affiliate-style programs where advocates earn for bringing new customers",
    status: "available",
    config: {
      schemaVersion: 1,
      steps: [
        {
          key: "brand",
          title: "Brand",
          description: "Set your brand color",
        },
        {
          key: "reward",
          title: "Rewards",
          description: "Configure referrer rewards",
        },
      ],
      meta: {
        rewardModel: "single-sided",
        recommendedFor: ["affiliate", "advocate", "influencer"],
      },
    },
  },
  [PROGRAM_TEMPLATE_IDS.STANDARD]: {
    id: PROGRAM_TEMPLATE_IDS.STANDARD,
    templateName: "Double-Sided Referral Program",
    description: "Reward both referrer and referee - classic referral program where both parties benefit",
    status: "coming_soon",
    config: {
      schemaVersion: 1,
      steps: [
        {
          key: "brand",
          title: "Brand",
          description: "Set your brand color",
        },
        {
          key: "reward",
          title: "Rewards",
          description: "Configure reward structure",
        },
      ],
      meta: {},
    },
  },
  [PROGRAM_TEMPLATE_IDS.AFFILIATE]: {
    id: PROGRAM_TEMPLATE_IDS.AFFILIATE,
    templateName: "Affiliate Program",
    description:
      "Commission-based program with ongoing revenue sharing - ideal for partners and content creators",
    status: "coming_soon",
    config: {
      schemaVersion: 1,
      steps: [
        {
          key: "brand",
          title: "Brand",
          description: "Set your brand color",
        },
        {
          key: "reward",
          title: "Commission",
          description: "Configure commission structure",
        },
      ],
      meta: {
        rewardModel: "commission",
        recommendedFor: ["partners", "creators", "resellers"],
      },
    },
  },
};

/**
 * Get all program templates as an array
 */
export function getAllProgramTemplates(): ProgramTemplate[] {
  return Object.values(PROGRAM_TEMPLATES);
}

/**
 * Get a program template by ID
 * @param id - Template ID
 * @returns Program template or undefined if not found
 */
export function getProgramTemplateById(
  id: string,
): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES[id as ProgramTemplateId];
}

/**
 * Check if a template ID is valid
 */
export function isValidTemplateId(id: string): id is ProgramTemplateId {
  return id in PROGRAM_TEMPLATES;
}
