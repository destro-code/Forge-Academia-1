import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Structured option for learner prediction assessment.
 * Allows learners to specify their expected outcome or reconsider conditions.
 */
export interface PredictionOption {
  /** Unique option identifier */
  id: string;
  /** Presentation label or description for the option */
  label: ReactNode;
}

/**
 * Properties for the reusable PredictionSurface presentation primitive.
 */
export interface PredictionSurfaceProps {
  /** Optional DOM element ID for the outer fieldset */
  id?: string;
  /** Surface heading text. Defaults to "Make a prediction". Pass null to hide. */
  title?: ReactNode;
  /** Leading icon displayed beside the heading. Defaults to HelpCircle. Pass null to hide. */
  icon?: ReactNode;
  /** Optional contextual header or slot rendered above the prompt (e.g. preserved diagnosis) */
  contextHeader?: ReactNode;
  /** Primary prediction prompt text or element */
  prompt?: ReactNode;
  /** Optional secondary explanatory text or instructions accompanying the prompt */
  promptDescription?: ReactNode;
  /** Label for the prediction input field */
  inputLabel?: ReactNode;
  /** DOM element ID for the input element. Defaults to "prediction-input" */
  inputId?: string;
  /** Test identifier for the input element. Defaults to "prediction-input" */
  inputTestId?: string;
  /** Current prediction input value (controlled) */
  value: string;
  /** Callback fired when the prediction input changes */
  onChange?: (value: string) => void;
  /** Textarea placeholder text */
  placeholder?: string;
  /** Number of rows for the prediction textarea. Defaults to 3. */
  rows?: number;
  /** Optional array of structured assessment options */
  options?: PredictionOption[];
  /** Legend or prompt heading for the structured assessment options */
  optionsLegend?: ReactNode;
  /** Currently selected option ID */
  selectedOptionId?: string | null;
  /** Callback fired when an assessment option is selected */
  onSelectOption?: (id: string) => void;
  /** DOM element ID for the options fieldset */
  optionsFieldsetId?: string;
  /** Test identifier for the options fieldset. Defaults to "prediction-assessment-fieldset" */
  optionsFieldsetTestId?: string;
  /** Name attribute for the radio group */
  optionsGroupName?: string;
  /** Prefix for option element IDs. Defaults to "prediction-assessment" */
  optionIdPrefix?: string;
  /** Label for the record action button. Defaults to "Record prediction" */
  recordLabel?: ReactNode;
  /** Callback fired when the record button is clicked */
  onRecord?: () => void;
  /** Whether the record action button is disabled. Defaults to false. */
  recordDisabled?: boolean;
  /** DOM element ID for the record button */
  recordButtonId?: string;
  /** Test identifier for the record button. Defaults to "record-prediction-action-button" */
  recordButtonTestId?: string;
  /** Whether the learner's prediction has been recorded */
  isRecorded?: boolean;
  /** Status message displayed upon recording. Defaults to "Prediction recorded." */
  recordedStatus?: ReactNode;
  /** Transition guidance or next-step cue displayed upon recording */
  transitionCue?: ReactNode;
  /** Test identifier for the recorded status message. Defaults to "prediction-recorded-status" */
  recordedStatusTestId?: string;
  /** Test identifier for the transition cue. Defaults to "prediction-transition-cue" */
  transitionCueTestId?: string;
  /** Density variant. Defaults to "normal". */
  density?: "compact" | "normal" | "spacious";
  /** Optional additional CSS classes for the outer container */
  className?: string;
  /** Test identifier for the outer container. Defaults to "prediction-surface" */
  "data-testid"?: string;
  /** Optional children rendered within the surface */
  children?: ReactNode;
}

/**
 * PredictionSurface
 *
 * A reusable, domain-neutral canonical Lesson Player presentation primitive.
 * Provides a structured surface for learners to form, articulate, and record predictions
 * before executing code or testing interventions.
 *
 * Architectural Boundaries:
 * - Pure presentation & user input reporting: Does NOT determine correctness, grade predictions,
 *   evaluate hypotheses, advance progression, generate evidence, or execute runtime code.
 * - Controlled input: Receives prediction value and selection state from caller; reports changes via callbacks.
 * - Decoupled: Independent of any specific lesson topic (JavaScript, DOM, CSS, network, async, etc.).
 */
export function PredictionSurface({
  id,
  title = "Make a prediction",
  icon,
  contextHeader,
  prompt,
  promptDescription,
  inputLabel,
  inputId = "prediction-input",
  inputTestId = "prediction-input",
  value,
  onChange,
  placeholder,
  rows = 3,
  options,
  optionsLegend,
  selectedOptionId,
  onSelectOption,
  optionsFieldsetId,
  optionsFieldsetTestId = "prediction-assessment-fieldset",
  optionsGroupName = "prediction-assessment",
  optionIdPrefix = "prediction-assessment",
  recordLabel = "Record prediction",
  onRecord,
  recordDisabled = false,
  recordButtonId,
  recordButtonTestId = "record-prediction-action-button",
  isRecorded = false,
  recordedStatus = "Prediction recorded.",
  transitionCue,
  recordedStatusTestId = "prediction-recorded-status",
  transitionCueTestId = "prediction-transition-cue",
  density = "normal",
  className,
  "data-testid": testId = "prediction-surface",
  children,
}: PredictionSurfaceProps) {
  const densityPadding = {
    compact: "space-y-2 p-2 text-xs",
    normal: "space-y-3 p-3 text-xs",
    spacious: "space-y-4 p-4 text-sm",
  }[density];

  const renderedIcon =
    icon === undefined ? <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" /> : icon;

  return (
    <fieldset
      id={id}
      data-testid={testId}
      className={cn(
        "rounded-lg border border-amber-400/50 bg-amber-400/5 transition-all",
        densityPadding,
        className,
      )}
    >
      {(title !== null || renderedIcon !== null) && (
        <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
          {renderedIcon}
          {title !== null && <span>{title}</span>}
        </legend>
      )}

      {contextHeader}

      {(prompt || promptDescription) && (
        <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
          {prompt && <p className="font-semibold text-lesson-text">{prompt}</p>}
          {promptDescription && <p className="text-[10.5px]">{promptDescription}</p>}
        </div>
      )}

      <div className="space-y-1.5 pt-1">
        {inputLabel && (
          <label htmlFor={inputId} className="block text-[11px] font-medium text-lesson-text">
            {inputLabel}
          </label>
        )}
        <textarea
          id={inputId}
          data-testid={inputTestId}
          rows={rows}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-lesson-border bg-lesson-bg/60 p-2.5 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
      </div>

      {options && options.length > 0 && (
        <fieldset
          id={optionsFieldsetId}
          data-testid={optionsFieldsetTestId}
          className="space-y-1.5"
        >
          {optionsLegend && (
            <legend className="text-[11px] font-medium text-lesson-text">{optionsLegend}</legend>
          )}
          <div className="space-y-1.5">
            {options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const optId = `${optionIdPrefix}-${opt.id}`;
              return (
                <label
                  key={opt.id}
                  htmlFor={optId}
                  className={cn(
                    "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all select-none",
                    isSelected
                      ? "border-amber-400/60 bg-amber-400/10 font-medium text-lesson-text shadow-sm"
                      : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                  )}
                >
                  <input
                    type="radio"
                    id={optId}
                    name={optionsGroupName}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => onSelectOption?.(opt.id)}
                    className="h-3.5 w-3.5 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                  />
                  <span className="text-[11px]">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {children}

      <div className="pt-1">
        <button
          type="button"
          id={recordButtonId}
          data-testid={recordButtonTestId}
          onClick={onRecord}
          disabled={recordDisabled}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all shadow-sm select-none",
            !recordDisabled
              ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
              : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
          )}
        >
          <span>{recordLabel}</span>
        </button>
      </div>

      {isRecorded && (
        <div className="space-y-1.5 pt-1 border-t border-amber-400/20">
          {recordedStatus && (
            <div
              data-testid={recordedStatusTestId}
              className="text-[11px] font-medium text-amber-300"
            >
              {recordedStatus}
            </div>
          )}
          {transitionCue && (
            <div
              data-testid={transitionCueTestId}
              className="text-[11px] leading-relaxed text-lesson-text-muted"
            >
              {transitionCue}
            </div>
          )}
        </div>
      )}
    </fieldset>
  );
}
