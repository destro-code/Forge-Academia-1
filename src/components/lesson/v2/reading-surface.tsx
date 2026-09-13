import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ReadingSurfaceProps {
  /** The delegated, unmodified CanonicalActivityView rendering Layer 1's intro/explanation/summary renderer — content and typography rules stay in that renderer (already reads well); this surface only supplies the capped, calm reading width from the Experience Spec §2. */
  children: ReactNode;
  className?: string;
}

/**
 * Presentation family: Reading. A single shared wrapper for `intro`,
 * `explanation`, and `summary` — all three are prose-first and share the
 * same "readable width, no wall of text" composition rule
 * (FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §2), so one component covers
 * all three rather than three near-identical ones.
 */
export function ReadingSurface({ children, className }: ReadingSurfaceProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[720px]", className)} data-testid="reading-surface">
      {children}
    </div>
  );
}
