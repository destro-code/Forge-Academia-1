import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SystemSurfaceProps {
  children: ReactNode;
  className?: string;
}

/**
 * System surface — presentation family for `interactive-demo` activities
 * with a bespoke `systemComponent` (e.g. AccountSettingsSystem). Per
 * FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §4: the rendered system is the
 * focal point, capped at a realistic form/interface width rather than
 * stretched, centered in generous quiet canvas — deliberately NOT wrapped
 * in a generic activity card. The actual system is delegated unchanged
 * through CanonicalActivityView/VisualRenderer (Layer 1, reused as-is);
 * this component only supplies the framing.
 */
export function SystemSurface({ children, className }: SystemSurfaceProps) {
  return (
    <div className={cn("flex w-full justify-center py-6", className)} data-testid="system-surface">
      <div className="w-full max-w-[560px]">{children}</div>
    </div>
  );
}
