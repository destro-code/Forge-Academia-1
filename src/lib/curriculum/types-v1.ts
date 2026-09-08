/**
 * Canonical Lesson Schema V1 TypeScript Interfaces
 * Authoritative data contract as specified in docs/FORGE_LESSON_SCHEMA_V1.md
 */

export type GuidanceLevel = "guided" | "semi-guided" | "autonomous" | "exploratory";

export type ArcStage =
  | "encounter"
  | "prediction"
  | "failure"
  | "observation"
  | "interaction"
  | "investigation"
  | "hypothesis"
  | "fix"
  | "verification"
  | "explanation"
  | "transfer"
  | "reflection";

export type EvidenceType =
  | "recognition"
  | "prediction"
  | "manipulation"
  | "implementation"
  | "debugging"
  | "explanation"
  | "transfer"
  | "judgment";

export type ActivityRoleV1 =
  | "encounter"
  | "discovery"
  | "explanation"
  | "prediction"
  | "manipulation"
  | "practice"
  | "challenge"
  | "debugging"
  | "investigation"
  | "hypothesis"
  | "verification"
  | "reflection"
  | "transfer"
  | "mastery"
  | "judgment";

export type ActivityTypeV1 =
  | "intro"
  | "explanation"
  | "visual"
  | "interactive-demo"
  | "prediction"
  | "multiple-choice"
  | "multi-select"
  | "ordering"
  | "fill-blank"
  | "output-prediction"
  | "code-modification"
  | "interactive-code"
  | "debug"
  | "reflection"
  | "summary"
  | "completion"
  | "judgment";

export type RuntimeEnvironment =
  "none" | "browser" | "javascript" | "typescript" | "react" | "react-native" | "http" | "nextjs";

export interface LessonIdentityV1 {
  title: string;
  description: string;
  learnerFacing: boolean;
  role: string;
  estimatedMinutes: number;
  slug?: string;
}

export interface LessonCurriculumV1 {
  phaseId: string;
  moduleId: string;
  topicId?: string;
  capabilityIds: string[];
  conceptIds: string[];
  prerequisiteLessonIds: string[];
}

export interface CapabilityDeclaration {
  id: string;
  statement: string;
}

export interface LearnerStartingState {
  knows: string[];
  canDo: string[];
  likelyMisconceptions: string[];
}

export interface LearnerTargetState {
  canDo: string[];
}

export interface LessonLearningV1 {
  primaryCapability: CapabilityDeclaration;
  secondaryCapabilities?: CapabilityDeclaration[];
  startingState: LearnerStartingState;
  targetState: LearnerTargetState;
  targetMentalModel?: string;
}

export interface LessonExperienceV1 {
  guidanceLevel: GuidanceLevel;
  arc: ArcStage[];
  emotionalJourney?: string[];
  startingState?: string;
  narrativeContext?: string;
  primaryInteraction?: string;
  expectedOutcome?: string;
}

export interface ActivityHintV1 {
  level: number;
  type?: "direction" | "specific-area" | "concept" | "resolution";
  text: string;
}

export interface ActivityFeedbackLayer {
  result?: string;
  observation?: string;
  mechanism?: string;
  generalization?: string;
}

export interface ActivityFeedbackV1 {
  correct: string | ActivityFeedbackLayer;
  incorrect: string | ActivityFeedbackLayer;
  misconceptionMap?: Record<string, string | ActivityFeedbackLayer>;
  hints?: ActivityHintV1[];
}

export interface ActivityEvidenceV1 {
  types: EvidenceType[];
  capabilityIds: string[];
  weight?: number;
  observedOutcome?: string;
}

export interface ActivityProgressionV1 {
  guidance?: GuidanceLevel;
  difficulty?: {
    conceptualComplexity?: number;
    interactionComplexity?: number;
    ambiguity?: number;
    debuggingComplexity?: number;
    environmentComplexity?: number;
    communicationDemand?: number;
  };
}

export interface ActivityValidationV1 {
  type: string;
  correctAnswer?: string | number | boolean;
  correctAnswers?: (string | number | boolean)[];
  correctSequence?: string[];
  expectedOutput?: string;
  testCases?: Array<{ id?: string; description: string; assertion?: string; testCode?: string }>;
  expectedState?: Record<string, unknown>;
  rubricId?: string;
}

export interface ActivityV1 {
  id: string;
  type: ActivityTypeV1;
  role: ActivityRoleV1;
  title: string;
  instruction?: string;
  content: Record<string, unknown>;
  validation?: ActivityValidationV1;
  feedback?: ActivityFeedbackV1;
  hints?: ActivityHintV1[];
  evidence?: ActivityEvidenceV1;
  progression?: ActivityProgressionV1;
  dependsOn?: string[];
}

export interface LessonMasteryV1 {
  requiredEvidence: EvidenceType[];
  completionCriteria: {
    requiredActivities: string[];
    minimumEvidence?: Partial<Record<EvidenceType, number>>;
    minimumScore?: number;
  };
  masteryCriteria: {
    minimumDemonstrations?: number;
    requiresTransfer?: boolean;
    threshold?: number;
  };
  retentionTriggers?: Array<{
    conceptId: string;
    intervalDays: number;
    triggerType: string;
  }>;
}

export interface LessonRelationshipsV1 {
  prerequisites: string[];
  reinforces: string[];
  extends: string[];
  applies: string[];
  challenges: string[];
  debugs: string[];
  revisits: string[];
  transfers: string[];
}

export interface LessonRuntimeV1 {
  required: boolean;
  environment: RuntimeEnvironment | null;
  dependencies?: string[];
  requiredFeatures?: string[];
}

export interface LessonAccessibilityV1 {
  requirements: string[];
  screenReaderNotes?: string;
  keyboardNavigation?: boolean;
  colorContrastCompliant?: boolean;
}

export interface CanonicalLessonV1 {
  id: string;
  schemaVersion: "1.0.0" | string;
  identity: LessonIdentityV1;
  curriculum: LessonCurriculumV1;
  learning: LessonLearningV1;
  experience: LessonExperienceV1;
  activities: ActivityV1[];
  mastery: LessonMasteryV1;
  relationships: LessonRelationshipsV1;
  runtime: LessonRuntimeV1;
  accessibility: LessonAccessibilityV1;
}
