import type { CanonicalActivity } from "@/lib/curriculum/types";
import { CanonicalActivityView, type CanonicalActivityViewProps } from "./canonical-activity-view";
import { getSurfaceForActivity } from "./experience-context";
import { ExperienceSurfaceFrame } from "./surface-families";

export function ActivitySurface(props: CanonicalActivityViewProps) {
  const surface = getSurfaceForActivity(props.activity);
  const tone = surface === "experiment" ? "workspace" : surface === "investigation" ? "investigation" : surface === "reflection" ? "reflection" : "focused";
  return <ExperienceSurfaceFrame tone={tone}><CanonicalActivityView {...props} className="w-full" /></ExperienceSurfaceFrame>;
}
export function selectActivitySurface(activity: CanonicalActivity) { return getSurfaceForActivity(activity); }
