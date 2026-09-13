/**
 * Canonical Lesson Schema V1 — Activity Content Contracts
 *
 * `ActivityV1.content` is declared as `Record<string, unknown>` in
 * schema-v1.ts (see FORGE_LAYER2_DESTINATION_AUDIT.md §3.A) — the lesson
 * *shape* is validated, but no activity *content* shape is. That gap is
 * the primary blocker identified for the Layer 2 vertical slice.
 *
 * This module adds strongly-typed, Zod-backed content contracts for
 * exactly the four activity types the golden lesson (lesson-0-1-1)
 * exercises: `interactive-demo`, `prediction`, `debug`, `interactive-code`.
 *
 * Deliberately NOT covering all 17 V1 activity types yet (per task scope).
 * The registry pattern below (`V1_CONTENT_SCHEMAS`, keyed by ActivityTypeV1)
 * is designed so adding the remaining 13 is additive — register a new
 * schema under its type key, no changes required here or in the adapter's
 * dispatch shape.
 */
import { z } from "zod";
import type { ActivityTypeV1, ActivityV1 } from "../types-v1";

// ---------------------------------------------------------------------------
// interactive-demo
// ---------------------------------------------------------------------------

/**
 * Two known shapes are in use for `interactive-demo` content today:
 *  - a `systemComponent` reference to a pre-built interactive visual
 *    (e.g. "AccountSettingsSystem", reused via Layer 1's `visual` activity
 *    interactive-registry — see ./adapter.ts), with an optional `symptom`.
 *  - a plain `expectedStatus` demo, used for verification-style beats that
 *    don't need a full bespoke component.
 * Both fields are optional so either shape (or a future third one) is
 * representable without a schema change; the adapter decides which visual
 * path to use based on which fields are present.
 */
export const interactiveDemoContentSchema = z
  .object({
    systemComponent: z.string().min(1).optional(),
    symptom: z.string().min(1).optional(),
    expectedStatus: z.string().min(1).optional(),
  })
  .refine((c) => c.systemComponent || c.expectedStatus, {
    message:
      "interactive-demo content must declare either a systemComponent (for a bespoke interactive visual) or an expectedStatus (for a simple confirm-style demo).",
  });
export type InteractiveDemoContentV1 = z.infer<typeof interactiveDemoContentSchema>;

// ---------------------------------------------------------------------------
// prediction
// ---------------------------------------------------------------------------

export const predictionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const predictionContentSchema = z.object({
  options: z.array(predictionOptionSchema).min(2, "A prediction needs at least two options."),
});
export type PredictionContentV1 = z.infer<typeof predictionContentSchema>;

// ---------------------------------------------------------------------------
// debug (investigation-oriented — see FORGE_LAYER2_DESTINATION_AUDIT.md §3.B)
// ---------------------------------------------------------------------------

export const debugContentSchema = z.object({
  targetElement: z.string().min(1),
  inspectionFields: z.array(z.string().min(1)).min(1, "At least one inspection field is required."),
});
export type DebugContentV1 = z.infer<typeof debugContentSchema>;

// ---------------------------------------------------------------------------
// interactive-code
// ---------------------------------------------------------------------------

export const interactiveCodeContentSchema = z.object({
  starterCode: z.string().min(1),
  solutionCode: z.string().min(1).optional(),
});
export type InteractiveCodeContentV1 = z.infer<typeof interactiveCodeContentSchema>;

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Partial by design — only the four types in scope for this slice are
 * registered. Types without a registered schema are treated as
 * "not yet content-typed" rather than invalid (see validateActivityV1Content).
 */
export const V1_CONTENT_SCHEMAS: Partial<Record<ActivityTypeV1, z.ZodTypeAny>> = {
  "interactive-demo": interactiveDemoContentSchema,
  prediction: predictionContentSchema,
  debug: debugContentSchema,
  "interactive-code": interactiveCodeContentSchema,
};

export interface ActivityV1ContentValidationResult {
  /** true if a schema was registered for this activity's type AND content passed it */
  isValid: boolean;
  /** false only when a schema is registered for this type — an unregistered type is never "unknown" as a failure, just unchecked */
  hasSchema: boolean;
  errors: string[];
}

/**
 * Validates `activity.content` against the registered schema for its type.
 * An activity whose type has no registered schema yet is reported as
 * `hasSchema: false, isValid: true` (not yet content-typed, not wrong) — this
 * is what lets the registry expand to the remaining 13 types incrementally
 * without every existing V1 lesson suddenly failing validation.
 */
export function validateActivityV1Content(activity: ActivityV1): ActivityV1ContentValidationResult {
  const schema = V1_CONTENT_SCHEMAS[activity.type];
  if (!schema) {
    return { isValid: true, hasSchema: false, errors: [] };
  }
  const result = schema.safeParse(activity.content);
  if (result.success) {
    return { isValid: true, hasSchema: true, errors: [] };
  }
  return {
    isValid: false,
    hasSchema: true,
    errors: result.error.issues.map((issue) => `${issue.path.join(".") || "$"}: ${issue.message}`),
  };
}
