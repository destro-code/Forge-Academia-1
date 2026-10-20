import { Link } from "@tanstack/react-router";
import { Activity, BookOpen, Code2, Lock, Play, Zap } from "lucide-react";
import type { Lesson } from "@/lib/types";

interface CurrentFocusProps {
  lesson: Lesson;
  nextLesson?: Lesson;
  isNewLearner?: boolean;
}

export function CurrentFocus({ lesson, nextLesson, isNewLearner = false }: CurrentFocusProps) {
  const minutes = lesson.estimatedMinutes || 18;
  const difficulty = lesson.difficulty || "Intermediate";

  return (
    <section
      aria-label="Current focus"
      className="focus-field relative overflow-hidden rounded-xl border px-5 py-6 sm:px-6"
      style={{ background: "var(--focus-surface)", borderColor: "var(--focus-border)" }}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Active Engineering Focus
        </span>
        <Link
          to="/learn/lessons"
          search={{}}
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Browse all 155 lessons</span>
        </Link>
      </div>

      <div className="relative mt-4 flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Code2 className="h-5 w-5" aria-hidden="true" />
      </div>

      <h2 className="relative mt-4 max-w-2xl text-balance font-serif text-2xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-3xl">
        {lesson.title}
      </h2>

      <p className="relative mt-2.5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
        {lesson.description}
      </p>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {minutes} min interactive studio
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {difficulty}
        </span>
      </div>

      <Link
        to="/lesson/$lessonId"
        params={{ lessonId: lesson.id }}
        search={{ mode: "curriculum" }}
        className="relative mt-6 flex w-full items-center justify-between gap-3 rounded-lg bg-primary px-5 py-3.5 font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <span>{isNewLearner ? "Start interactive lesson" : "Resume interactive lesson"}</span>
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
      </Link>

      {nextLesson && (
        <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Up next
            </span>
            <span className="truncate font-medium text-foreground">{nextLesson.title}</span>
          </div>
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
