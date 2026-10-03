/**
 * Curriculum Mode Configuration
 *
 * Supported modes:
 * - "build": Active construction mode. Only active canonical lessons from
 *   `src/data/canonical/lessons/*.json` are visible. Legacy lessons and archived
 *   lessons are hidden. Gracefully supports partial curriculums (0, 1, 5, etc. lessons).
 * - "production": Normal operational mode where full canonical and legacy fallback pathways run.
 */

export type CurriculumMode = "build" | "production";

let modeOverride: CurriculumMode | null = null;

export function getCurriculumMode(): CurriculumMode {
  if (modeOverride !== null) {
    return modeOverride;
  }
  const envMode = import.meta.env?.VITE_FORGE_CURRICULUM_MODE;
  if (envMode === "production") {
    return "production";
  }
  return "build";
}

export function isCurriculumBuildMode(): boolean {
  return getCurriculumMode() === "build";
}

/**
 * For testing and toggling runtime modes in tests or developer workflows.
 */
export function setCurriculumModeForTesting(mode: CurriculumMode | null): void {
  modeOverride = mode;
}
