import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LessonExperiencePlayer } from "@/components/lesson-experience/lesson-experience-player";
import { DEMO_LESSON } from "@/lib/lesson-experience/demo-lesson";
import { GOLDEN_JAVASCRIPT_LESSON } from "@/lib/lesson-experience/golden-javascript-lesson";

/**
 * Isolated proof-of-concept route for the content-agnostic lesson-experience
 * engine. Allows testing both the Golden JavaScript Lesson and the synthetic
 * demo lesson through `LessonExperiencePlayer`. Does not read from `lessons.json`,
 * does not use `/lesson/$lessonId`, and does not touch the legacy learning engine.
 */
export const Route = createFileRoute("/dev/lesson-experience-demo")({
  head: () => ({
    meta: [{ title: "Lesson Experience Engine · Interactive Showcase" }],
  }),
  component: DevLessonExperienceDemo,
});

const LESSONS = [
  {
    id: GOLDEN_JAVASCRIPT_LESSON.lesson.id,
    title: "Golden JS: Objects & Mutation",
    badge: "Canonical Golden",
    definition: GOLDEN_JAVASCRIPT_LESSON,
  },
  {
    id: DEMO_LESSON.lesson.id,
    title: "Synthetic Demo: State & Memory",
    badge: "Demo",
    definition: DEMO_LESSON,
  },
];

function DevLessonExperienceDemo() {
  const [activeLessonId, setActiveLessonId] = useState(GOLDEN_JAVASCRIPT_LESSON.lesson.id);
  const selectedLesson = LESSONS.find((l) => l.id === activeLessonId) ?? LESSONS[0];

  return (
    <div className="min-h-screen bg-lesson-bg">
      <div className="mx-auto w-full max-w-2xl px-4 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lesson-border pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-lesson-text-muted">
              Lesson Experience Engine · Interactive Benchmark
            </p>
            <h1 className="mt-1 font-serif text-lg font-semibold text-lesson-text-primary">
              {selectedLesson.definition.lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-lesson-border bg-lesson-surface p-1">
            {LESSONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveLessonId(item.id)}
                className={`rounded px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                  item.id === activeLessonId
                    ? "bg-lesson-accent text-lesson-accent-foreground shadow-sm"
                    : "text-lesson-text-secondary hover:text-lesson-text-primary hover:bg-lesson-surface-hover"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <LessonExperiencePlayer key={selectedLesson.id} definition={selectedLesson.definition} />
    </div>
  );
}
