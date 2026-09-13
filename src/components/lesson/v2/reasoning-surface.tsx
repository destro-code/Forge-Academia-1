import type { ReactNode } from "react";
import { GenericDemoPanel } from "@/components/lesson/v1/generic-demo-panel";
import { cn } from "@/lib/utils";

export interface ReasoningSurfaceReflectionProps {
  kind: "reflection";
  /** The delegated, unmodified CanonicalActivityView rendering Layer 1's reflection activity. */
  children: ReactNode;
}

export interface ReasoningSurfaceJudgmentProps {
  kind: "judgment";
  title: string;
  instruction?: string;
  bodyText?: string;
  status: "idle" | "active" | "submitted" | "correct" | "incorrect" | "completed";
  response: { acknowledged: true } | undefined;
  onResponse: (response: { acknowledged: true }) => void;
  readOnly?: boolean;
  /** True when the authored content is missing the option set this activity's validation implies — see generic-demo-panel.tsx's doc. Surfaced honestly rather than hidden. */
  hasContentGap?: boolean;
}

export type ReasoningSurfaceProps = ReasoningSurfaceReflectionProps | ReasoningSurfaceJudgmentProps;

/**
 * Presentation family: Reasoning. `reflection` delegates entirely to Layer
 * 1's existing renderer (reused unchanged) inside a calm, generous-width
 * wrapper matching FORGE_LESSON_PLAYER_V2_EXPERIENCE_SPEC.md §9's "engineering
 * thinking, not a school essay" framing. `judgment` shares the same visual
 * family but — per the golden lesson's authored content gap (no option set
 * for its `single-choice` validation) — falls back to an open
 * acknowledgment rather than Layer 1's strict, rubric-based JudgmentRenderer,
 * and says so plainly rather than pretending the interaction is graded.
 */
export function ReasoningSurface(props: ReasoningSurfaceProps) {
  if (props.kind === "reflection") {
    return (
      <div className={cn("mx-auto w-full max-w-[640px]")} data-testid="reasoning-surface-reflection">
        {props.children}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] space-y-2" data-testid="reasoning-surface-judgment">
      <GenericDemoPanel
        title={props.title}
        instruction={props.instruction}
        bodyText={props.bodyText}
        state={{ status: props.status, response: props.response }}
        onResponse={props.onResponse}
        readOnly={props.readOnly}
        acknowledgeLabel="I've thought this through"
      />
      {props.hasContentGap && (
        <p className="text-xs italic text-lesson-text-muted">
          This activity's authored content doesn't yet include a graded option set — recorded as an open
          acknowledgment rather than a rubric-scored judgment.
        </p>
      )}
    </div>
  );
}
