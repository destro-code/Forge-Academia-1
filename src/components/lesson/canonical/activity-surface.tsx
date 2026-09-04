import type { CanonicalActivity } from "@/lib/curriculum/types";
import { CanonicalActivityView, type CanonicalActivityViewProps } from "./canonical-activity-view";
import { deriveExperienceContext, getSurfaceForActivity } from "./experience-context";
import { ExperienceSurfaceFrame } from "./surface-families";
import { LessonExperienceShell } from "./lesson-experience-shell";

export function ActivitySurface(props: CanonicalActivityViewProps) {
  const surface = getSurfaceForActivity(props.activity);
  const tone = surface === "experiment" ? "workspace" : surface === "investigation" ? "investigation" : surface === "reflection" ? "reflection" : "focused";
  const context = deriveExperienceContext(props.activity, 1, 1);
  return <LessonExperienceShell context={context} header={null} navigation={null} className="min-h-0 bg-transparent"><ExperienceSurfaceFrame tone={tone}><CanonicalActivityView {...props} className="w-full" /></ExperienceSurfaceFrame></LessonExperienceShell>;
}
export function selectActivitySurface(activity: CanonicalActivity) { return getSurfaceForActivity(activity); }
