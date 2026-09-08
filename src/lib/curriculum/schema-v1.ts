/**
 * Canonical Lesson Schema V1 Zod Validation
 * Authoritative runtime validator as specified in docs/FORGE_LESSON_SCHEMA_V1.md
 */

import { z } from "zod";
import type {
  CanonicalLessonV1,
  ActivityV1,
  LessonIdentityV1,
  LessonCurriculumV1,
  LessonLearningV1,
  LessonExperienceV1,
  LessonMasteryV1,
  LessonRelationshipsV1,
  LessonRuntimeV1,
  LessonAccessibilityV1,
} from "./types-v1";

// ---------------------------------------------------------------------------
// Primitive & Enum Schemas
// ---------------------------------------------------------------------------

export const guidanceLevelSchema = z.enum(["guided", "semi-guided", "autonomous", "exploratory"]);

export const arcStageSchema = z.enum([
  "encounter",
  "prediction",
  "failure",
  "observation",
  "interaction",
  "investigation",
  "hypothesis",
  "fix",
  "verification",
  "explanation",
  "transfer",
  "reflection",
]);

export const evidenceTypeSchema = z.enum([
  "recognition",
  "prediction",
  "manipulation",
  "implementation",
  "debugging",
  "explanation",
  "transfer",
  "judgment",
]);

export const activityRoleV1Schema = z.enum([
  "encounter",
  "discovery",
  "explanation",
  "prediction",
  "manipulation",
  "practice",
  "challenge",
  "debugging",
  "investigation",
  "hypothesis",
  "verification",
  "reflection",
  "transfer",
  "mastery",
  "judgment",
]);

export const activityTypeV1Schema = z.enum([
  "intro",
  "explanation",
  "visual",
  "interactive-demo",
  "prediction",
  "multiple-choice",
  "multi-select",
  "ordering",
  "fill-blank",
  "output-prediction",
  "code-modification",
  "interactive-code",
  "debug",
  "reflection",
  "summary",
  "completion",
  "judgment",
]);

export const runtimeEnvironmentSchema = z.enum([
  "none",
  "browser",
  "javascript",
  "typescript",
  "react",
  "react-native",
  "http",
  "nextjs",
]);

// ---------------------------------------------------------------------------
// Top-Level Section Schemas
// ---------------------------------------------------------------------------

export const lessonIdentityV1Schema = z.object({
  title: z.string().min(1, "Lesson title is required."),
  description: z.string().min(1, "Lesson description is required."),
  learnerFacing: z.boolean().default(true),
  role: z.string().min(1, "Lesson role is required."),
  estimatedMinutes: z.number().int().positive("Estimated minutes must be positive."),
  slug: z.string().optional(),
});

export const lessonCurriculumV1Schema = z.object({
  phaseId: z.string().min(1, "phaseId is required (e.g., 'phase-0')."),
  moduleId: z.string().min(1, "moduleId is required (e.g., 'module-0-1')."),
  topicId: z.string().optional(),
  capabilityIds: z.array(z.string()).min(1, "At least one capabilityId is required in curriculum."),
  conceptIds: z.array(z.string()),
  prerequisiteLessonIds: z.array(z.string()).default([]),
});

export const capabilityDeclarationSchema = z.object({
  id: z.string().min(1, "Capability ID is required."),
  statement: z.string().min(1, "Capability statement is required."),
});

export const learnerStartingStateSchema = z.object({
  knows: z.array(z.string()).default([]),
  canDo: z.array(z.string()).default([]),
  likelyMisconceptions: z.array(z.string()).default([]),
});

export const learnerTargetStateSchema = z.object({
  canDo: z.array(z.string()).min(1, "Target state must declare at least one 'canDo' ability."),
});

export const lessonLearningV1Schema = z.object({
  primaryCapability: capabilityDeclarationSchema,
  secondaryCapabilities: z.array(capabilityDeclarationSchema).optional().default([]),
  startingState: learnerStartingStateSchema,
  targetState: learnerTargetStateSchema,
  targetMentalModel: z.string().optional(),
});

export const lessonExperienceV1Schema = z.object({
  guidanceLevel: guidanceLevelSchema.default("guided"),
  arc: z.array(arcStageSchema).min(1, "Experience arc must contain at least one stage."),
  emotionalJourney: z.array(z.string()).optional(),
  startingState: z.string().optional(),
  narrativeContext: z.string().optional(),
  primaryInteraction: z.string().optional(),
  expectedOutcome: z.string().optional(),
});

export const activityHintV1Schema = z.object({
  level: z.number().int().min(1),
  type: z.enum(["direction", "specific-area", "concept", "resolution"]).optional(),
  text: z.string().min(1, "Hint text cannot be empty."),
});

export const activityFeedbackLayerSchema = z.object({
  result: z.string().optional(),
  observation: z.string().optional(),
  mechanism: z.string().optional(),
  generalization: z.string().optional(),
});

export const feedbackContentSchema = z.union([z.string().min(1), activityFeedbackLayerSchema]);

export const activityFeedbackV1Schema = z.object({
  correct: feedbackContentSchema,
  incorrect: feedbackContentSchema,
  misconceptionMap: z.record(feedbackContentSchema).optional(),
  hints: z.array(activityHintV1Schema).optional(),
});

export const activityEvidenceV1Schema = z.object({
  types: z.array(evidenceTypeSchema).min(1, "At least one evidence type must be declared."),
  capabilityIds: z
    .array(z.string())
    .min(1, "At least one capabilityId must be associated with evidence."),
  weight: z.number().min(0).max(10).optional().default(1),
  observedOutcome: z.string().optional(),
});

export const activityProgressionV1Schema = z.object({
  guidance: guidanceLevelSchema.optional(),
  difficulty: z
    .object({
      conceptualComplexity: z.number().min(1).max(5).optional(),
      interactionComplexity: z.number().min(1).max(5).optional(),
      ambiguity: z.number().min(1).max(5).optional(),
      debuggingComplexity: z.number().min(1).max(5).optional(),
      environmentComplexity: z.number().min(1).max(5).optional(),
      communicationDemand: z.number().min(1).max(5).optional(),
    })
    .optional(),
});

export const activityValidationV1Schema = z.object({
  type: z.string().min(1),
  correctAnswer: z.union([z.string(), z.number(), z.boolean()]).optional(),
  correctAnswers: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
  correctSequence: z.array(z.string()).optional(),
  expectedOutput: z.string().optional(),
  testCases: z
    .array(
      z.object({
        id: z.string().optional(),
        description: z.string().min(1),
        assertion: z.string().optional(),
        testCode: z.string().optional(),
      }),
    )
    .optional(),
  expectedState: z.record(z.unknown()).optional(),
  rubricId: z.string().optional(),
});

export const activityV1Schema = z.object({
  id: z.string().min(1, "Activity ID is required."),
  type: activityTypeV1Schema,
  role: activityRoleV1Schema,
  title: z.string().min(1, "Activity title is required."),
  instruction: z.string().optional(),
  content: z.record(z.unknown()).default({}),
  validation: activityValidationV1Schema.optional(),
  feedback: activityFeedbackV1Schema.optional(),
  hints: z.array(activityHintV1Schema).optional(),
  evidence: activityEvidenceV1Schema.optional(),
  progression: activityProgressionV1Schema.optional(),
  dependsOn: z.array(z.string()).optional(),
});

export const lessonMasteryV1Schema = z.object({
  requiredEvidence: z.array(evidenceTypeSchema).default([]),
  completionCriteria: z.object({
    requiredActivities: z.array(z.string()).default([]),
    minimumEvidence: z.record(z.number()).optional(),
    minimumScore: z.number().min(0).max(100).optional(),
  }),
  masteryCriteria: z.object({
    minimumDemonstrations: z.number().int().min(1).optional().default(1),
    requiresTransfer: z.boolean().optional().default(false),
    threshold: z.number().min(0).max(100).optional(),
  }),
  retentionTriggers: z
    .array(
      z.object({
        conceptId: z.string().min(1),
        intervalDays: z.number().positive(),
        triggerType: z.string().min(1),
      }),
    )
    .optional(),
});

export const lessonRelationshipsV1Schema = z.object({
  prerequisites: z.array(z.string()).default([]),
  reinforces: z.array(z.string()).default([]),
  extends: z.array(z.string()).default([]),
  applies: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  debugs: z.array(z.string()).default([]),
  revisits: z.array(z.string()).default([]),
  transfers: z.array(z.string()).default([]),
});

export const lessonRuntimeV1Schema = z.object({
  required: z.boolean().default(false),
  environment: runtimeEnvironmentSchema.nullable().default(null),
  dependencies: z.array(z.string()).optional(),
  requiredFeatures: z.array(z.string()).optional(),
});

export const lessonAccessibilityV1Schema = z.object({
  requirements: z.array(z.string()).default([]),
  screenReaderNotes: z.string().optional(),
  keyboardNavigation: z.boolean().optional().default(true),
  colorContrastCompliant: z.boolean().optional().default(true),
});

// ---------------------------------------------------------------------------
// Master Canonical Lesson V1 Schema
// ---------------------------------------------------------------------------

export const canonicalLessonV1Schema = z.object({
  id: z.string().min(1, "Lesson ID is required."),
  schemaVersion: z.string().min(1, "schemaVersion is required (e.g., '1.0.0')."),
  identity: lessonIdentityV1Schema,
  curriculum: lessonCurriculumV1Schema,
  learning: lessonLearningV1Schema,
  experience: lessonExperienceV1Schema,
  activities: z.array(activityV1Schema).min(1, "Lesson must contain at least one activity."),
  mastery: lessonMasteryV1Schema,
  relationships: lessonRelationshipsV1Schema,
  runtime: lessonRuntimeV1Schema,
  accessibility: lessonAccessibilityV1Schema,
});

// ---------------------------------------------------------------------------
// Validation Helper Functions
// ---------------------------------------------------------------------------

export function validateLessonV1(data: unknown): CanonicalLessonV1 {
  return canonicalLessonV1Schema.parse(data);
}

export function safeValidateLessonV1(data: unknown) {
  return canonicalLessonV1Schema.safeParse(data);
}

export function validateActivityV1(data: unknown): ActivityV1 {
  return activityV1Schema.parse(data);
}
