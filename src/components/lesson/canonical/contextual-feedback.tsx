import type { CanonicalActivity } from "@/lib/curriculum/types";
import { experienceStageCopy } from "./experience-context";
import type { ExperienceContext } from "./experience-context";

export function ContextualFeedback({ activity, context }: { activity: CanonicalActivity; context: ExperienceContext }) {
  const copy = experienceStageCopy[context.stage];
  const message = context.emphasis.prediction
    ? "Commit to your prediction, then compare it with what the system does."
    : context.emphasis.debugging
      ? "We have a symptom. Use the result as evidence; look for the smallest clue that explains the behavior."
      : context.emphasis.evidence || activity.evidence
        ? "Keep the evidence in view as you build your explanation."
        : copy.prompt;
  return <aside className="mx-auto flex w-full max-w-3xl flex-col gap-1 rounded-xl border border-lesson-border bg-lesson-surface-subtle px-4 py-3 text-sm leading-6 text-lesson-text-secondary" aria-label="Learning context"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-lesson-text-muted">{copy.eyebrow}</span><span>{message}</span></aside>;
}
