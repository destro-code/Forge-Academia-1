/**
 * Authoring Pipeline & Studio Quality Evaluator for Schema V1 Lessons
 */

import type { CanonicalLessonV1, ActivityV1 } from "../types-v1";
import type { CurriculumLintResult } from "./types";
import { lintLessonV1Full } from "./lint-lesson-v1";
import { capabilityCatalog } from "../capabilities";

export interface LessonQualityScore {
  overallScore: number; // 0 - 100
  dimensions: {
    schemaCompliance: number; // 0 - 100
    evidenceRigor: number; // 0 - 100
    pedagogicalArc: number; // 0 - 100
    capabilityCoverage: number; // 0 - 100
    scaffoldingBalance: number; // 0 - 100
  };
  passedCertification: boolean;
  lintResult: CurriculumLintResult;
}

export function evaluateLessonQuality(lesson: CanonicalLessonV1): LessonQualityScore {
  const lintResult = lintLessonV1Full(lesson);

  // 1. Schema Compliance (deduct 25 per error, 5 per warning)
  const schemaScore = Math.max(
    0,
    100 - lintResult.errors.length * 25 - lintResult.warnings.length * 5,
  );

  // 2. Evidence Rigor: ratio of activities producing explicit evidence
  const totalActivities = lesson.activities?.length || 0;
  const activitiesWithEvidence =
    lesson.activities?.filter((a) => a.evidence && a.evidence.types && a.evidence.types.length > 0)
      .length || 0;
  const evidenceRigor =
    totalActivities > 0 ? Math.round((activitiesWithEvidence / totalActivities) * 100) : 0;

  // 3. Pedagogical Arc: checks presence of key arc stages
  const arcStages = new Set(lesson.experience?.arc || []);
  const keyStages = [
    "encounter",
    "prediction",
    "investigation",
    "fix",
    "verification",
    "reflection",
  ];
  const matchedStages = keyStages.filter((s) => arcStages.has(s as any)).length;
  const pedagogicalArc = Math.round((matchedStages / keyStages.length) * 100);

  // 4. Capability Coverage
  const capIds = lesson.curriculum?.capabilityIds || [];
  const validCaps = capIds.filter((id) => capabilityCatalog.hasCapability(id)).length;
  const capabilityCoverage = capIds.length > 0 ? Math.round((validCaps / capIds.length) * 100) : 0;

  // 5. Scaffolding Balance (active vs passive, hint availability)
  const hasMultipleDifficulties = lesson.activities?.some(
    (a) => a.progression && a.progression.difficulty,
  );
  const hasHints = lesson.activities?.some((a) => a.hints && a.hints.length > 0);
  const scaffoldingBalance = (hasMultipleDifficulties ? 50 : 30) + (hasHints ? 50 : 40);

  const overallScore = Math.round(
    schemaScore * 0.35 +
      evidenceRigor * 0.25 +
      pedagogicalArc * 0.2 +
      capabilityCoverage * 0.1 +
      scaffoldingBalance * 0.1,
  );

  const passedCertification = lintResult.errors.length === 0 && overallScore >= 80;

  return {
    overallScore,
    dimensions: {
      schemaCompliance: schemaScore,
      evidenceRigor,
      pedagogicalArc,
      capabilityCoverage,
      scaffoldingBalance,
    },
    passedCertification,
    lintResult,
  };
}

export function generateLessonScaffold(params: {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  moduleId: string;
  primaryCapabilityId: string;
}): CanonicalLessonV1 {
  const cap = capabilityCatalog.getById(params.primaryCapabilityId);
  const capStatement =
    cap?.statement || "Demonstrate observable skill competence in browser environment.";

  return {
    id: params.id,
    schemaVersion: "1.0.0",
    identity: {
      title: params.title,
      description: params.description,
      learnerFacing: true,
      role: "encounter",
      estimatedMinutes: 15,
      slug: params.id.replace(/^lesson-/, ""),
    },
    curriculum: {
      phaseId: params.phaseId,
      moduleId: params.moduleId,
      capabilityIds: [params.primaryCapabilityId],
      conceptIds: cap?.conceptIds || [],
      prerequisiteLessonIds: [],
    },
    learning: {
      primaryCapability: {
        id: params.primaryCapabilityId,
        statement: capStatement,
      },
      secondaryCapabilities: [],
      startingState: {
        knows: [],
        canDo: [],
        likelyMisconceptions: cap?.misconceptionIds || [],
      },
      targetState: {
        canDo: [capStatement],
      },
      targetMentalModel: "Understand the causal mechanism and state transitions.",
    },
    experience: {
      guidanceLevel: "guided",
      arc: [
        "encounter",
        "prediction",
        "observation",
        "investigation",
        "fix",
        "verification",
        "reflection",
      ],
    },
    activities: [
      {
        id: `${params.id}-01`,
        type: "interactive-demo",
        role: "encounter",
        title: "Observe the Behavior",
        instruction: "Interact with the interface and observe the symptom.",
        content: {},
        evidence: {
          types: ["recognition"],
          capabilityIds: [params.primaryCapabilityId],
        },
      },
      {
        id: `${params.id}-02`,
        type: "prediction",
        role: "prediction",
        title: "Form a Hypothesis",
        instruction: "What is the expected mechanism causing this symptom?",
        content: {},
        validation: {
          type: "single-choice",
          correctAnswer: "opt-1",
        },
        evidence: {
          types: ["prediction"],
          capabilityIds: [params.primaryCapabilityId],
        },
      },
      {
        id: `${params.id}-03`,
        type: "interactive-code",
        role: "manipulation",
        title: "Apply the Targeted Fix",
        instruction: "Modify the code to repair the defect.",
        content: {},
        validation: {
          type: "tests",
          testCases: [{ description: "Repairs the defect" }],
        },
        evidence: {
          types: ["manipulation", "implementation"],
          capabilityIds: [params.primaryCapabilityId],
        },
      },
      {
        id: `${params.id}-04`,
        type: "reflection",
        role: "reflection",
        title: "Synthesize the Mechanism",
        instruction: "Explain how your fix resolved the root cause.",
        content: {},
        evidence: {
          types: ["explanation"],
          capabilityIds: [params.primaryCapabilityId],
        },
      },
    ],
    mastery: {
      requiredEvidence: ["recognition", "prediction", "manipulation", "explanation"],
      completionCriteria: {
        requiredActivities: [
          `${params.id}-01`,
          `${params.id}-02`,
          `${params.id}-03`,
          `${params.id}-04`,
        ],
      },
      masteryCriteria: {
        minimumDemonstrations: 1,
        requiresTransfer: false,
      },
    },
    relationships: {
      prerequisites: [],
      reinforces: [],
      extends: [],
      applies: [],
      challenges: [],
      debugs: [],
      revisits: [],
      transfers: [],
    },
    runtime: {
      required: true,
      environment: "browser",
    },
    accessibility: {
      requirements: ["Keyboard navigable", "Screen reader labeled"],
      keyboardNavigation: true,
      colorContrastCompliant: true,
    },
  };
}
