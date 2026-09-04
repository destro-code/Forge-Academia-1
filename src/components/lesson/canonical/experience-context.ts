import type { CanonicalActivity, ActivityIntent } from "@/lib/curriculum/types";

export type ExperienceStage = "encounter" | "understand" | "predict" | "practice" | "investigate" | "reflect" | "transfer";

export const experienceStageCopy: Record<ExperienceStage, { eyebrow: string; prompt: string }> = {
  encounter: { eyebrow: "Encounter", prompt: "Notice what the system is showing you." },
  understand: { eyebrow: "Build the model", prompt: "Connect the parts before you explain the whole." },
  predict: { eyebrow: "Make a prediction", prompt: "Commit to what you expect before the reveal." },
  practice: { eyebrow: "Try it yourself", prompt: "Make one deliberate move, then inspect the result." },
  investigate: { eyebrow: "Investigate", prompt: "We have a symptom. Now we need evidence." },
  reflect: { eyebrow: "Explain", prompt: "Put the mechanism into your own words." },
  transfer: { eyebrow: "Set the skill", prompt: "New surface. Same engineering thinking." },
};
export type ExperienceSurface = "reasoning" | "teaching" | "experiment" | "investigation" | "reflection" | "flow";
export type ExperienceMode = "focused" | "workspace" | "investigation" | "reflection";

export interface ExperienceContext {
  stage: ExperienceStage;
  surface: ExperienceSurface;
  mode: ExperienceMode;
  label: string;
  progress: { current: number; total: number };
  emphasis: { evidence: boolean; prediction: boolean; debugging: boolean };
}

const intentStage: Partial<Record<ActivityIntent, ExperienceStage>> = {
  orientation: "encounter", understanding: "understand", recognition: "understand",
  retrieval: "practice", prediction: "predict", application: "practice",
  modification: "practice", debugging: "investigate", reflection: "reflect",
  transfer: "transfer", assessment: "transfer",
};

const stageLabels: Record<ExperienceStage, string> = {
  encounter: "Get oriented", understand: "Build the model", predict: "Make a prediction",
  practice: "Try it yourself", investigate: "Investigate the result", reflect: "Put it into words", transfer: "Set the skill",
};

export function deriveExperienceContext(activity: CanonicalActivity, current: number, total: number): ExperienceContext {
  const stage = intentStage[activity.intent] ?? (activity.type === "debug" ? "investigate" : activity.type === "reflection" ? "reflect" : activity.type === "intro" ? "encounter" : activity.type === "completion" ? "transfer" : "practice");
  const surface: ExperienceSurface = stage === "encounter" || activity.type === "summary" || activity.type === "completion" ? "flow" : stage === "understand" ? "teaching" : stage === "predict" || ["multiple-choice", "multi-select", "fill-blank", "ordering", "output-prediction", "judgment"].includes(activity.type) ? "reasoning" : stage === "investigate" || activity.type === "debug" ? "investigation" : stage === "reflect" || activity.type === "reflection" ? "reflection" : activity.type === "interactive-code" ? "experiment" : "teaching";
  return { stage, surface, mode: surface === "experiment" ? "workspace" : surface === "investigation" ? "investigation" : surface === "reflection" ? "reflection" : "focused", label: stageLabels[stage], progress: { current, total }, emphasis: { evidence: Boolean(activity.evidence), prediction: activity.intent === "prediction" || activity.type === "output-prediction", debugging: activity.intent === "debugging" || activity.type === "debug" } };
}

export function getSurfaceForActivity(activity: CanonicalActivity): ExperienceSurface {
  return deriveExperienceContext(activity, 1, 1).surface;
}

export function getStageLabel(stage: ExperienceStage) { return stageLabels[stage]; }

export function isInteractiveSurface(surface: ExperienceSurface) { return surface === "experiment" || surface === "investigation"; }
