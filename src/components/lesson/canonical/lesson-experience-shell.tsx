import type { ReactNode, RefObject } from "react";
import type { ExperienceContext } from "./experience-context";
import { cn } from "@/lib/utils";

export function LessonExperienceShell({ context, children, header, feedback, navigation, scrollRef, className }: { context: ExperienceContext; children: ReactNode; header: ReactNode; feedback?: ReactNode; navigation: ReactNode; scrollRef?: RefObject<HTMLElement | null>; className?: string }) {
  return <div className={cn("flex h-full min-h-0 w-full flex-col overflow-hidden bg-lesson-bg text-lesson-text-primary", className)} data-experience-stage={context.stage}>
    {header && <header className="shrink-0 border-b border-lesson-border bg-lesson-bg/85 px-4 py-3 backdrop-blur-sm">{header}<div className="mx-auto mt-3 h-1 max-w-[1200px] overflow-hidden rounded-full bg-lesson-surface-subtle"><div className="h-full rounded-full bg-lesson-accent transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(100, (context.progress.current / Math.max(context.progress.total, 1)) * 100))}%` }} /></div></header>}
    <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10"><div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col gap-5"><div className="text-center"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-lesson-text-muted">{context.label}</p></div>{children}{feedback}</div></main>
    {navigation && <footer className="shrink-0 border-t border-lesson-border bg-lesson-surface/95 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur-sm">{navigation}</footer>}
  </div>;
}
