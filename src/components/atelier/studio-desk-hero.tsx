import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Sparkles, Zap } from "lucide-react";
import type { Lesson, Module, Topic } from "@/lib/types";
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank";
import { getAtelierChapterForModule, getUtcWeekActiveDays } from "@/lib/curriculum/atelier-chapters";
import { ForgeBuddyMascot } from "@/components/atelier/forge-buddy-illos";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";

interface StudioDeskHeroProps {
  lesson?: Lesson;
  activeModule?: Module;
  activeTopic?: Topic;
  completedCount: number;
  totalLessons: number;
  streakDays: number;
  xp: number;
  activityDates?: string[];
  lessonsCompleted: string[];
  isReturningLearner: boolean;
}

export function StudioDeskHero({
  lesson, activeModule, activeTopic, completedCount, totalLessons, streakDays, xp,
  activityDates = [], lessonsCompleted, isReturningLearner,
}: StudioDeskHeroProps) {
  const [mentorMode, setMentorMode] = useState<"eli5" | "senior">("eli5");
  const mentor = getEli5MentorNote(lesson?.id ?? "", activeModule?.id ?? lesson?.moduleId ?? "module-0-1");
  const chapter = getAtelierChapterForModule(activeModule?.id);
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const weekDays = getUtcWeekActiveDays(activityDates);

  return (
    <section aria-labelledby="studio-desk-title" className="grid min-w-0 gap-7 xl:grid-cols-[.95fr_1.05fr] xl:items-center xl:gap-10">
      <div className="min-w-0">
        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.17em] text-primary"><span className="h-2 w-2 rounded-full bg-[var(--atelier-coral)]" /> Your creative studio <span className="text-border">/</span> {isReturningLearner ? "Welcome back" : "Your first build starts here"}</div>
        <h1 id="studio-desk-title" className="max-w-xl text-3xl font-extrabold leading-[1.08] tracking-[-.045em] sm:text-4xl lg:text-5xl">Make ideas real.<br /><span className="text-primary">One small build</span> at a time.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">A hands-on workshop for learning frontend engineering: understand the mental model, experiment with the design, then build it yourself.</p>

        <div className="atelier-card mt-6 overflow-hidden rounded-[1.5rem] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--atelier-mint)]/70"><BookOpen className="h-5 w-5 text-[var(--atelier-navy)]" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-primary">{chapter ? `CHAPTER ${chapter.number} · ${chapter.shortTitle}` : "YOUR NEXT LESSON"}</p>
              <h2 className="mt-1 text-lg font-bold leading-snug tracking-tight">{lesson?.title ?? "Your first lesson is ready"}</h2>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{lesson?.description ?? "Start with the building blocks of the web, then bring your first interface to life."}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{lesson?.estimatedMinutes ?? 15} min</span>{activeTopic && <span>{activeTopic.title}</span>}</div>
            </div>
          </div>
          <Link to="/lesson/$lessonId" params={{ lessonId: lesson?.id ?? "lesson-0-1-1" }} search={{ mode: "curriculum" }} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--atelier-cobalt)] px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--atelier-cobalt)_90%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {lesson && lessonsCompleted.includes(lesson.id) ? "Review active lesson" : "Continue lesson"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 rounded-[1.4rem] border border-[var(--atelier-lilac)]/70 bg-[color-mix(in_oklab,var(--atelier-lilac)_22%,var(--card))] p-4">
          <div className="flex items-center gap-3">
            <ForgeBuddyMascot size={48} />
            <div className="min-w-0 flex-1"><p className="text-sm font-bold">Forge Buddy <span className="font-normal text-muted-foreground">· your mental-model coach</span></p><p className="text-xs text-muted-foreground">{mentor.analogyTitle}</p></div>
            <button type="button" onClick={() => setMentorMode((mode) => mode === "eli5" ? "senior" : "eli5")} className="min-h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-xs font-bold hover:bg-muted">{mentorMode === "eli5" ? "Builder tip" : "ELI5 mode"}</button>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground">{mentorMode === "eli5" ? mentor.eli5Text : mentor.seniorWit}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold">Studio rhythm</p><p className="mt-1 text-xs text-muted-foreground">Real progress from your learning history</p></div><span className="font-mono text-xs font-bold">{completedCount}/{totalLessons} lessons</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[var(--atelier-cobalt)] transition-[width]" style={{ width: `${percent}%` }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/60 p-3"><CheckCircle2 className="h-4 w-4 text-primary" /><p className="mt-2 text-lg font-extrabold tabular-nums">{percent}%</p><p className="text-[11px] text-muted-foreground">Curriculum</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><Flame className="h-4 w-4 text-orange-500" /><p className="mt-2 text-lg font-extrabold tabular-nums">{streakDays}</p><p className="text-[11px] text-muted-foreground">Day streak</p></div>
            <div className="rounded-xl bg-muted/60 p-3"><Zap className="h-4 w-4 text-amber-500" /><p className="mt-2 text-lg font-extrabold tabular-nums">{xp.toLocaleString()}</p><p className="text-[11px] text-muted-foreground">XP earned</p></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground"><Sparkles className="mr-1 inline h-3.5 w-3.5" />{weekDays} active {weekDays === 1 ? "day" : "days"} this UTC week</p>
        </div>
      </div>

      <div className="min-w-0"><LiveBlueprintStage /></div>
    </section>
  );
}
