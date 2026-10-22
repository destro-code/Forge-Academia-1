import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Flame, Sparkles, Zap } from "lucide-react";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import type { Lesson, Module, Topic } from "@/lib/types";

interface HeroStudioProps {
  lesson: Lesson;
  module?: Module;
  topic?: Topic;
  moduleLessonsCount?: number;
  currentStepNumber?: number;
  progressPercent?: number;
  isNewLearner?: boolean;
}

export function HeroStudio({
  lesson,
  module,
  topic,
  moduleLessonsCount = 1,
  currentStepNumber = 1,
  progressPercent = 0,
  isNewLearner = false,
}: HeroStudioProps) {
  const moduleNumber = String(module?.order || 1).padStart(2, "0");
  const moduleContext = topic?.title || module?.tags?.[0]?.toUpperCase() || "ORIENTATION";
  const eyebrowLabel = `MODULE ${moduleNumber} · ${moduleContext}`;
  const durationLabel = `${lesson.estimatedMinutes || 15}m quest`;
  const mentorNote = getEli5MentorNote(lesson.id, module?.id ?? lesson.moduleId ?? "module-0-1");

  return (
    <section aria-label="Current Engineering Quest" className="w-full">
      <div className="forge-panel relative overflow-hidden rounded-2xl border border-primary/25 bg-card px-5 py-5 sm:px-7 sm:py-6 transition-all before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-primary">
        {/* Eyebrow & Reward Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              <Flame className="h-3 w-3" />
              {isNewLearner ? "FIRST GUILD QUEST" : "ACTIVE GUILD QUEST"}
            </span>
            <span className="font-semibold text-foreground">{eyebrowLabel}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
              <Zap className="h-3 w-3" />
              +50 XP
            </span>
            <span className="capitalize px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/70 font-medium">
              {lesson.difficulty || "Beginner"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Main Quest Details & CTA Row */}
        <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5 min-w-0 max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lesson.description}
            </p>

            {/* Witty ELI5 Curiosity Hook */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-semibold text-foreground">{mentorNote.analogyTitle}: </span>
                <span>{mentorNote.eli5Text}</span>
              </div>
            </div>
          </div>

          {/* Action & Module Progress Stack */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
            <div className="flex sm:flex-col justify-between sm:justify-center gap-1.5 min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground gap-3">
                <span>
                  Step{" "}
                  {isNewLearner
                    ? "01 / " + String(moduleLessonsCount).padStart(2, "0")
                    : `${String(currentStepNumber).padStart(2, "0")} / ${String(moduleLessonsCount).padStart(2, "0")}`}
                </span>
                <span className="text-foreground font-semibold">{progressPercent}% Mastered</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(isNewLearner ? 6 : 8, progressPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {module && (
                <Link
                  to="/learn/modules/$moduleId"
                  params={{ moduleId: module.id }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-2.5 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Module Spec</span>
                </Link>
              )}

              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: lesson.id }}
                search={{ mode: "curriculum" }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                <span>{isNewLearner ? "Start Quest #1" : "Resume Quest Studio"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
