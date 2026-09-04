import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ExperienceSurfaceFrame({ children, className, tone = "focused" }: { children: ReactNode; className?: string; tone?: "focused" | "workspace" | "investigation" | "reflection" }) {
  return <section className={cn("relative mx-auto w-full", tone === "workspace" && "max-w-[1200px]", tone !== "workspace" && "max-w-3xl", className)} data-experience-surface={tone}>{children}</section>;
}
export const ReasoningSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
export const TeachingSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
export const ExperimentSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="workspace" className={className}>{children}</ExperienceSurfaceFrame>;
export const InvestigationSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="investigation" className={className}>{children}</ExperienceSurfaceFrame>;
export const ReflectionSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame tone="reflection" className={className}>{children}</ExperienceSurfaceFrame>;
export const FlowSurface = ({ children, className }: { children: ReactNode; className?: string }) => <ExperienceSurfaceFrame className={className}>{children}</ExperienceSurfaceFrame>;
