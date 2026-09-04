import type {
  ExperienceInterpretation,
  ExperienceComposition,
  ExperienceSurfacePlacement,
  SupportingSurface,
} from "./experience-types";

/**
 * Deterministic ordering and relative presentation priority for supporting surfaces.
 *
 * Focal surface receives priority 100.
 * Supporting surfaces receive hierarchically tiered priorities:
 * - evaluation:    90 (critical diagnostic feedback)
 * - misconception: 80 (targeted cognitive correction)
 * - inspector:     70 (runtime state inspection)
 * - console:       60 (standard execution stream)
 * - hint:          50 (progressive pedagogical scaffolding)
 * - model:         40 (reference mental model / diagram)
 */
const SUPPORTING_SURFACE_ORDER_AND_PRIORITY: ReadonlyArray<{
  surface: SupportingSurface;
  priority: number;
}> = [
  { surface: "evaluation", priority: 90 },
  { surface: "misconception", priority: 80 },
  { surface: "inspector", priority: 70 },
  { surface: "console", priority: 60 },
  { surface: "hint", priority: 50 },
  { surface: "model", priority: 40 },
];

/**
 * Pure Experience Composer.
 *
 * Converts a semantic ExperienceInterpretation into a presentation-only ExperienceComposition.
 * Governs focal and supporting surface arrangements, priorities, visibility, action metadata,
 * and presentation scaffolding without modifying runtime, evaluation, state, or progression.
 */
export function composeExperience(interpretation: ExperienceInterpretation): ExperienceComposition {
  const surfaces: ExperienceSurfacePlacement[] = [
    {
      surface: interpretation.focalSurface,
      role: "focal",
      priority: 100,
      visible: true,
    },
  ];

  const supportingSet = new Set(interpretation.supportingSurfaces);

  for (const config of SUPPORTING_SURFACE_ORDER_AND_PRIORITY) {
    if (supportingSet.has(config.surface)) {
      surfaces.push({
        surface: config.surface,
        role: "supporting",
        priority: config.priority,
        visible: true,
      });
    }
  }

  const composition: ExperienceComposition = {
    mode: interpretation.mode,
    spatialMode: interpretation.spatialMode,
    density: interpretation.density,
    focalSurface: interpretation.focalSurface,
    surfaces,
    primaryAction: { ...interpretation.primaryAction },
    assistance: { ...interpretation.assistance },
  };

  if (interpretation.headline !== undefined) {
    composition.headline = interpretation.headline;
  }
  if (interpretation.prompt !== undefined) {
    composition.prompt = interpretation.prompt;
  }
  if (interpretation.badgeText !== undefined) {
    composition.badgeText = interpretation.badgeText;
  }
  if (interpretation.tone !== undefined) {
    composition.tone = interpretation.tone;
  }

  return composition;
}
