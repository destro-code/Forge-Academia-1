import type { IntroActivity } from "@/lib/curriculum/types";
import type { ActivityRendererProps } from "../types";
import { ActivityContainer } from "../primitives/activity-container";
import { MovementScene, MovementEyebrow } from "../primitives/movement-scene";
import { LessonMarkdown, splitMarkdownBlocks } from "@/components/lesson/shared/lesson-markdown";
import { ArrowUpRight } from "lucide-react";

/**
 * IntroRenderer — the trailhead of the journey (Orient).
 *
 * Establishes context and creates curiosity: a large movement identity, the
 * hook as an emotional lead, an optional "scene" brief, and goals framed as
 * forward-looking outcomes the learner is about to earn. Goals use accent
 * glyph markers rather than numbers — they are parallel outcomes, not a
 * sequence.
 */
export function IntroRenderer({ activity }: ActivityRendererProps<IntroActivity>) {
  const { title, hook, context, goals } = activity.content;

  const trimmedContext = (context ?? "").trim();
  const isContextDistinct =
    trimmedContext.length > 0 &&
    trimmedContext.toLowerCase() !== (hook ?? "").trim().toLowerCase();
  const contextBlocks = isContextDistinct ? splitMarkdownBlocks(trimmedContext) : [];

  return (
    <ActivityContainer id={`activity-${activity.id}`} variant="immersive">
      <MovementScene className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-5 py-1 sm:gap-6 sm:py-3">
          {/* Opening identity */}
          <MovementEyebrow type={activity.type} />

          {/* Title + hook */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold leading-[1.12] tracking-tight text-balance text-lesson-text-primary sm:text-3xl lg:text-4xl">
              <LessonMarkdown inline>{title}</LessonMarkdown>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-pretty text-lesson-text-secondary sm:text-lg">
              <LessonMarkdown inline>{hook}</LessonMarkdown>
            </p>
          </div>

          {/* Concise orienting context (only when distinct from hook) */}
          {contextBlocks.length > 0 && (
            <section
              aria-label="Lesson context"
              className="rounded-2xl border border-lesson-border bg-lesson-surface/60 p-4 sm:p-5"
            >
              <LessonMarkdown>{trimmedContext}</LessonMarkdown>
            </section>
          )}

          {/* Forward-looking outcomes — anticipation, not a checklist */}
          {goals && goals.length > 0 && (
            <div className="rounded-2xl border border-lesson-border/70 bg-lesson-surface/40 p-4 sm:p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-lesson-text-muted">
                By the end, you&apos;ll be able to
              </p>
              <ul className="space-y-2">
                {goals.map((goal, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm sm:text-[15px] leading-relaxed text-lesson-text-primary">
                      <LessonMarkdown inline>{goal}</LessonMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </MovementScene>
    </ActivityContainer>
  );
}
