import type { CanonicalActivity } from "@/lib/curriculum/types";
import type { ExperienceContext } from "./experience-context";

export function ContextualFeedback({ activity, context }: { activity: CanonicalActivity; context: ExperienceContext }) {
  if (!context.emphasis.evidence && !context.emphasis.prediction && !context.emphasis.debugging) return null;
  const message = context.emphasis.prediction ? "Commit to your prediction, then compare it with what the system does." : context.emphasis.debugging ? "Use the result as evidence. Look for the smallest clue that explains the behavior." : activity.evidence ? "Keep the evidence in view as you build your explanation." : null;
  return message ? <aside className="mx-auto w-full max-w-3xl rounded-xl border border-lesson-border bg-lesson-surface-subtle px-4 py-3 text-sm leading-6 text-lesson-text-secondary" aria-label="Learning context">{message}</aside> : null;
}
