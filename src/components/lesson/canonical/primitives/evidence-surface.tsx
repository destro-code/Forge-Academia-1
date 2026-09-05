import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Generic discrete evidence datum.
 * Represents an observable field or property discovered during investigation.
 */
export interface EvidenceItem {
  /** Optional identifier for deterministic keying */
  id?: string;
  /** Human-readable field label or observation category */
  label: string;
  /** Observable value or factual content */
  value: ReactNode;
  /** Optional secondary context or origin of this datum */
  hint?: string;
  /** Whether the value should render in a technical monospace font. Defaults to true. */
  monospaced?: boolean;
}

/**
 * Properties for the reusable EvidenceSurface presentation primitive.
 */
export interface EvidenceSurfaceProps {
  /** Optional element ID */
  id?: string;
  /** Optional surface heading */
  title?: string;
  /** Optional leading icon displayed beside the heading */
  icon?: ReactNode;
  /** Array of evidence items to present */
  items: EvidenceItem[];
  /** Optional explanatory context or instruction accompanying the evidence */
  description?: ReactNode;
  /** Grid layout columns on larger viewports. Defaults to 2. */
  columns?: 1 | 2;
  /** Optional density styling */
  density?: "compact" | "normal" | "spacious";
  /** Optional custom styling classes */
  className?: string;
  /** Test identifier */
  "data-testid"?: string;
}

/**
 * EvidenceSurface
 *
 * A reusable, purely presentational canonical Lesson Player primitive.
 * Displays factual, observable evidence discovered by the learner during an investigation.
 *
 * Architectural Boundary:
 * - Pure presentation: Does NOT evaluate correctness, diagnose root cause,
 *   manage session state, persist evidence, or advance progression.
 * - Deterministic: Render output is strictly a function of the passed data props.
 */
export function EvidenceSurface({
  id,
  title,
  icon,
  items,
  description,
  columns = 2,
  density = "normal",
  className,
  "data-testid": testId = "evidence-surface",
}: EvidenceSurfaceProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const densityPadding = {
    compact: "p-2 text-xs",
    normal: "p-2.5 text-xs",
    spacious: "p-3.5 text-sm",
  }[density];

  return (
    <div
      id={id}
      data-testid={testId}
      className={cn(
        "space-y-2 rounded-md border border-lesson-border/60 bg-lesson-surface/80 transition-all",
        densityPadding,
        className,
      )}
    >
      {(title || icon) && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text">
          {icon}
          {title && <span>{title}</span>}
        </div>
      )}

      <dl className={cn("grid grid-cols-1 gap-1.5 text-[11px]", columns === 2 && "sm:grid-cols-2")}>
        {items.map((item, index) => {
          const key = item.id || `evidence-item-${index}`;
          const isMonospaced = item.monospaced !== false;

          return (
            <div key={key} className="rounded border border-lesson-border/40 bg-lesson-bg/50 p-1.5">
              <dt className="text-lesson-text-muted">{item.label}</dt>
              <dd className={cn("text-lesson-text break-words", isMonospaced && "font-mono")}>
                {item.value}
              </dd>
              {item.hint && (
                <p className="mt-0.5 text-[10px] text-lesson-text-muted">{item.hint}</p>
              )}
            </div>
          );
        })}
      </dl>

      {description && (
        <div className="pt-1 text-[11px] leading-relaxed text-lesson-text-muted">{description}</div>
      )}
    </div>
  );
}
