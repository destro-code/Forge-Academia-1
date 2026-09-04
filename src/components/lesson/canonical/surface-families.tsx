import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExperienceSurfaceFrame({ children, className, tone = "focused" }: { children: ReactNode; className?: string; tone?: "focused" | "workspace" | "investigation" | "reflection" }) {
  return <section className={cn("relative mx-auto w-full rounded-2xl border border-lesson-border/70 bg-lesson-surface/35 p-1 shadow-lg", tone === "workspace" && "max-w-[1200px]", tone !== "workspace" && "max-w-3xl", tone === "investigation" && "border-lesson-warning/35", tone === "reflection" && "border-lesson-accent/25", className)} data-experience-surface={tone}>{children}</section>;
}
export const ReasoningSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
export const TeachingSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
export const ExperimentSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="workspace" className={className}>{children}</ExperienceSurfaceFrame>;
export const InvestigationSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="investigation" className={className}>{children}</ExperienceSurfaceFrame>;
export const ReflectionSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="reflection" className={className}>{children}</ExperienceSurfaceFrame>;
export const FlowSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
