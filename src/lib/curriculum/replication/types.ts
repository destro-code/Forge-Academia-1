import { z } from "zod";
import type {
  ActivityIntent,
  ActivityValidationConfig,
  ActivityFeedback,
  ActivityEvidenceConfig,
} from "../types";

/**
 * Scaffolding stages for the Replicate This activity engine.
 * - guided: starter code with locked scaffold and slotted token chips
 * - constrained: starter scaffold with open editing but restricted patterns
 * - independent: clean slate recreation from visual/structural specs
 */
export type ScaffoldingStage = "guided" | "constrained" | "independent";

export const scaffoldingStageSchema = z.enum(["guided", "constrained", "independent"]);

/**
 * Validates structural invariants in the user's DOM AST.
 */
export interface StructuralRule {
  id: string;
  description: string;
  selector: string;
  expectedCount?: number;
  minCount?: number;
  forbiddenParent?: string;
  mustContainText?: string;
  feedbackOnFail: string;
}

export const structuralRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  selector: z.string(),
  expectedCount: z.number().optional(),
  minCount: z.number().optional(),
  forbiddenParent: z.string().optional(),
  mustContainText: z.string().optional(),
  feedbackOnFail: z.string(),
});

/**
 * Validates computed CSS properties in the rendered DOM.
 */
export interface StyleRule {
  id: string;
  description: string;
  selector: string;
  property: string;
  expectedValue?: string | string[];
  numericRange?: {
    min: number;
    max: number;
    unit: "px" | "rem" | "%";
  };
  feedbackOnFail: string;
}

export const styleRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  selector: z.string(),
  property: z.string(),
  expectedValue: z.union([z.string(), z.array(z.string())]).optional(),
  numericRange: z
    .object({
      min: z.number(),
      max: z.number(),
      unit: z.enum(["px", "rem", "%"]),
    })
    .optional(),
  feedbackOnFail: z.string(),
});

/**
 * Restricts harmful or hacky anti-patterns.
 */
export interface ProhibitedPattern {
  id: string;
  rule: "no-inline-styles" | "no-absolute-position-hacks" | "semantic-elements-only";
  feedbackOnFail: string;
}

export const prohibitedPatternSchema = z.object({
  id: z.string(),
  rule: z.enum(["no-inline-styles", "no-absolute-position-hacks", "semantic-elements-only"]),
  feedbackOnFail: z.string(),
});

/**
 * Complete activity content payload for Replicate This.
 */
export interface ReplicateThisActivityContent {
  stage: ScaffoldingStage;
  prompt: string;
  hints?: string[];
  target: {
    html: string;
    css?: string;
    viewportHeight?: number;
  };
  workspace: {
    starterHtml: string;
    starterCss?: string;
    availableTokens?: string[];
  };
  evaluation: {
    structuralRules: StructuralRule[];
    styleRules: StyleRule[];
    prohibitedPatterns?: ProhibitedPattern[];
  };
}

export const replicateThisActivityContentSchema = z.object({
  stage: scaffoldingStageSchema,
  prompt: z.string(),
  hints: z.array(z.string()).optional(),
  target: z.object({
    html: z.string(),
    css: z.string().optional(),
    viewportHeight: z.number().optional(),
  }),
  workspace: z.object({
    starterHtml: z.string(),
    starterCss: z.string().optional(),
    availableTokens: z.array(z.string()).optional(),
  }),
  evaluation: z.object({
    structuralRules: z.array(structuralRuleSchema),
    styleRules: z.array(styleRuleSchema),
    prohibitedPatterns: z.array(prohibitedPatternSchema).optional(),
  }),
});

/**
 * Discrete rule evaluation outcome.
 */
export interface EvaluationResult {
  ruleId: string;
  category: "structure" | "style" | "engineering";
  description: string;
  passed: boolean;
  feedback: string;
}

export const evaluationResultSchema = z.object({
  ruleId: z.string(),
  category: z.enum(["structure", "style", "engineering"]),
  description: z.string(),
  passed: z.boolean(),
  feedback: z.string(),
});

/**
 * Full evaluation summary across all rules.
 */
export interface EvaluationSummary {
  isFullyReplicated: boolean;
  passCount: number;
  totalCount: number;
  results: EvaluationResult[];
}

export const evaluationSummarySchema = z.object({
  isFullyReplicated: z.boolean(),
  passCount: z.number(),
  totalCount: z.number(),
  results: z.array(evaluationResultSchema),
});

/**
 * Canonical activity definition conforming to Forge's lesson content model.
 */
export interface ReplicateThisActivity {
  id: string;
  type: "replicate-this";
  intent?: ActivityIntent;
  objectiveIds?: string[];
  content: ReplicateThisActivityContent;
  validation?: ActivityValidationConfig;
  feedback?: ActivityFeedback;
  evidence?: ActivityEvidenceConfig;
  optional?: boolean;
}

export const replicateThisActivitySchema = z.object({
  id: z.string(),
  type: z.literal("replicate-this"),
  intent: z.string().optional(),
  objectiveIds: z.array(z.string()).optional(),
  content: replicateThisActivityContentSchema,
  validation: z.record(z.unknown()).optional(),
  feedback: z.record(z.unknown()).optional(),
  evidence: z.record(z.unknown()).optional(),
  optional: z.boolean().optional(),
});
