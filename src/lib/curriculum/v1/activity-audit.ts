/**
 * Activity Type Audit & Production Approval Matrix
 *
 * Authoritative classification of all 18 activity types in Canonical Lesson Schema V1.
 * Only activity types classified as 'production-approved' are permitted in learner-facing
 * curriculum lessons.
 */

import type { ActivityTypeV1 } from "../types-v1";

export type ActivityApprovalStatus =
  "first-class-forge-surface" | "intentionally-delegated" | "shared-primitive" | "not-yet-approved";

export interface ActivityTypeAuditRecord {
  type: ActivityTypeV1;
  status: ActivityApprovalStatus;
  isProductionApproved: boolean;
  notes: string;
}

export const ACTIVITY_TYPE_AUDIT: Record<ActivityTypeV1, ActivityTypeAuditRecord> = {
  intro: {
    type: "intro",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Renders orientation title, hook, context, and learning goals.",
  },
  explanation: {
    type: "explanation",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Renders concept explanation with key takeaways and structured typography.",
  },
  visual: {
    type: "visual",
    status: "shared-primitive",
    isProductionApproved: true,
    notes: "Renders architectural diagrams, layout schemas, and DOM hierarchies.",
  },
  "interactive-demo": {
    type: "interactive-demo",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Renders sandbox interaction surfaces (e.g. AccountSettingsSystem).",
  },
  prediction: {
    type: "prediction",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Hypothesis commitment surface before debugging or observation.",
  },
  "multiple-choice": {
    type: "multiple-choice",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Single-choice selection with explanation rationale.",
  },
  "multi-select": {
    type: "multi-select",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Multiple-choice selection with all-or-nothing evaluation.",
  },
  ordering: {
    type: "ordering",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Sequence assembly surface for execution order and lifecycle phases.",
  },
  "fill-blank": {
    type: "fill-blank",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Inline code token completion surface with deterministic answers.",
  },
  "output-prediction": {
    type: "output-prediction",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Code evaluation surface predicting console or rendering output.",
  },
  "code-modification": {
    type: "code-modification",
    status: "intentionally-delegated",
    isProductionApproved: true,
    notes: "Delegates to Monaco/CodeMirror code editor runtime with AST diff validation.",
  },
  "interactive-code": {
    type: "interactive-code",
    status: "intentionally-delegated",
    isProductionApproved: true,
    notes: "Delegates to executable code runtime with live output test runners.",
  },
  debug: {
    type: "debug",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Investigation and bug repair surface with element inspection validation.",
  },
  reflection: {
    type: "reflection",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Metacognitive causal explanation and reasoning capture.",
  },
  summary: {
    type: "summary",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Closure review summarizing mastered capabilities and next steps.",
  },
  completion: {
    type: "completion",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Lesson end celebration surface showing mastered concepts.",
  },
  judgment: {
    type: "judgment",
    status: "first-class-forge-surface",
    isProductionApproved: true,
    notes: "Trade-off evaluation and architectural decision scenario.",
  },
  "replicate-this": {
    type: "replicate-this",
    status: "shared-primitive",
    isProductionApproved: true,
    notes: "Target reproduction surface with visual diff inspection.",
  },
};

export const PRODUCTION_APPROVED_ACTIVITY_TYPES = new Set<string>(
  Object.values(ACTIVITY_TYPE_AUDIT)
    .filter((a) => a.isProductionApproved)
    .map((a) => a.type),
);

export function isActivityTypeProductionApproved(type: string): boolean {
  return PRODUCTION_APPROVED_ACTIVITY_TYPES.has(type);
}
