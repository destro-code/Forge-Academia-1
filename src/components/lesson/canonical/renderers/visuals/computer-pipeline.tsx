import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Keyboard,
  Cpu,
  Monitor,
  HardDrive,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";

export type ComputerPipelineStage = "input" | "processing" | "output" | "storage";
export type StorageAction = "save" | "retrieve";

export interface ComputerPipelineStep {
  id: string;
  stage: ComputerPipelineStage;
  title: string;
  description: string;
}

export interface ComputerPipelineStorage {
  id?: string;
  action: StorageAction;
  title: string;
  description: string;
}

export interface ComputerPipelineMappingChoice {
  id: string;
  text: string;
  stage?: ComputerPipelineStage;
  isCorrect?: boolean;
  rationale?: string;
}

export interface ComputerPipelineMappingQuestion {
  prompt: string;
  targetStage?: ComputerPipelineStage;
  choices: ComputerPipelineMappingChoice[];
  correctChoiceId?: string;
  explanation?: string;
}

export interface ComputerPipelineScenario {
  id: string;
  title: string;
  description?: string;
  mode?: "trace" | "mapping";
  steps?: ComputerPipelineStep[];
  storage?: ComputerPipelineStorage;
  mapping?: ComputerPipelineMappingQuestion;
}

export interface ComputerPipelineConfig {
  mode?: "trace" | "mapping";
  title?: string;
  description?: string;
  scenarios?: ComputerPipelineScenario[];
  scenario?: ComputerPipelineScenario;
  steps?: ComputerPipelineStep[];
  storage?: ComputerPipelineStorage;
  mapping?: ComputerPipelineMappingQuestion;
}

export interface ComputerPipelineProps {
  config?: ComputerPipelineConfig;
  visualData?: Record<string, unknown>;
  experienceComposition?: unknown;
}

const STAGE_META: Record<
  ComputerPipelineStage,
  { icon: typeof Keyboard; defaultLabel: string; roleDescription: string }
> = {
  input: { icon: Keyboard, defaultLabel: "INPUT", roleDescription: "Enters the system" },
  processing: { icon: Cpu, defaultLabel: "PROCESSING", roleDescription: "Handles information" },
  output: { icon: Monitor, defaultLabel: "OUTPUT", roleDescription: "Presents results" },
  storage: { icon: HardDrive, defaultLabel: "STORAGE", roleDescription: "Preserves for later" },
};

export function ComputerPipeline({ config, visualData }: ComputerPipelineProps) {
  const scenarios: ComputerPipelineScenario[] = useMemo(() => {
    const resolvedConfig = (config || visualData || {}) as ComputerPipelineConfig;
    if (resolvedConfig.scenarios && resolvedConfig.scenarios.length > 0) {
      return resolvedConfig.scenarios;
    }
    if (resolvedConfig.scenario) {
      return [resolvedConfig.scenario];
    }
    if (resolvedConfig.steps || resolvedConfig.mapping) {
      return [
        {
          id: "default-scenario",
          title: resolvedConfig.title || "Computer Pipeline",
          description: resolvedConfig.description,
          mode: resolvedConfig.mode || (resolvedConfig.mapping ? "mapping" : "trace"),
          steps: resolvedConfig.steps,
          storage: resolvedConfig.storage,
          mapping: resolvedConfig.mapping,
        },
      ];
    }
    // Safe default trace scenario
    return [
      {
        id: "default-trace",
        title: "Standard Pipeline",
        mode: "trace",
        steps: [
          {
            id: "step-1",
            stage: "input",
            title: "Input",
            description: "Information enters the computer through an input device.",
          },
          {
            id: "step-2",
            stage: "processing",
            title: "Processing",
            description: "The computer executes instructions to manipulate and compute the data.",
          },
          {
            id: "step-3",
            stage: "output",
            title: "Output",
            description: "The result is displayed or communicated back to the user.",
          },
        ],
      },
    ];
  }, [config, visualData]);

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const currentScenario = scenarios[selectedScenarioIndex] || scenarios[0];

  // Local trace state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTraceCompleted, setIsTraceCompleted] = useState(false);

  // Local mapping state
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mode = currentScenario.mode || (currentScenario.mapping ? "mapping" : "trace");
  const steps = currentScenario.steps || [];
  const currentStep = steps[currentStepIndex];

  const hasStorage = Boolean(currentScenario.storage || steps.some((s) => s.stage === "storage"));
  const storageAction: StorageAction = currentScenario.storage?.action || "save";

  // Check which main stages are part of this scenario
  const hasInput =
    mode === "mapping" ? true : steps.length === 0 || steps.some((s) => s.stage === "input");
  const hasProcessing =
    mode === "mapping" ? true : steps.length === 0 || steps.some((s) => s.stage === "processing");
  const hasOutput =
    mode === "mapping" ? true : steps.length === 0 || steps.some((s) => s.stage === "output");

  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setCurrentStepIndex(0);
    setIsTraceCompleted(false);
    setSelectedChoiceId(null);
    setIsSubmitted(false);
  };

  const handleAdvanceTrace = () => {
    if (isTraceCompleted) {
      setCurrentStepIndex(0);
      setIsTraceCompleted(false);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsTraceCompleted(true);
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex >= steps.length - 1) {
        // Last step reached; can be completed on further click or marked done
      }
    }
  };

  const handleSelectChoice = (choiceId: string) => {
    if (!isSubmitted) {
      setSelectedChoiceId(choiceId);
    }
  };

  const mapping = currentScenario.mapping;
  const selectedChoice = mapping?.choices.find((c) => c.id === selectedChoiceId);

  const isMappingCorrect = useMemo(() => {
    if (!mapping || !selectedChoiceId) return false;
    if (selectedChoice?.isCorrect !== undefined) {
      return selectedChoice.isCorrect;
    }
    if (mapping.correctChoiceId) {
      return selectedChoiceId === mapping.correctChoiceId;
    }
    if (mapping.targetStage && selectedChoice?.stage) {
      return selectedChoice.stage === mapping.targetStage;
    }
    return false;
  }, [mapping, selectedChoiceId, selectedChoice]);

  const handleCheckMapping = () => {
    if (selectedChoiceId) {
      setIsSubmitted(true);
    }
  };

  const handleRetryMapping = () => {
    setIsSubmitted(false);
  };

  const isComplete = mode === "trace" ? isTraceCompleted : isSubmitted && isMappingCorrect;

  // Determine stage visual status for a given stage
  const getStageStatus = (stage: ComputerPipelineStage): "active" | "completed" | "upcoming" => {
    if (mode === "trace") {
      if (isTraceCompleted) return "completed";
      if (!currentStep) return "upcoming";
      if (currentStep.stage === stage) return "active";

      const currentStageStepIndices = steps
        .map((s, idx) => (s.stage === stage ? idx : -1))
        .filter((idx) => idx !== -1);

      if (currentStageStepIndices.some((idx) => idx < currentStepIndex)) {
        return "completed";
      }
      return "upcoming";
    } else {
      // Mapping mode
      if (isSubmitted && isMappingCorrect) {
        if (
          mapping?.targetStage === stage ||
          (selectedChoice?.stage === stage && isMappingCorrect)
        ) {
          return "completed";
        }
      }
      if (selectedChoice?.stage === stage) {
        return "active";
      }
      return "upcoming";
    }
  };

  return (
    <div
      data-testid="computer-pipeline"
      data-completed={isComplete ? "true" : "false"}
      data-mode={mode}
      className="flex flex-col gap-6 rounded-2xl border border-lesson-border bg-lesson-surface-subtle p-4 sm:p-6"
    >
      {/* Scenario Tabs (when multiple scenarios are provided) */}
      {scenarios.length > 1 && (
        <div
          role="tablist"
          aria-label="Pipeline scenarios"
          className="flex flex-wrap items-center gap-2 border-b border-lesson-border pb-3"
        >
          {scenarios.map((sc, idx) => (
            <button
              key={sc.id || idx}
              role="tab"
              type="button"
              aria-selected={selectedScenarioIndex === idx}
              onClick={() => handleSelectScenario(idx)}
              className={cn(
                "min-h-[44px] rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m-accent)]",
                selectedScenarioIndex === idx
                  ? "border border-[var(--m-accent-line)] bg-[var(--m-accent-soft)] text-[var(--m-accent)]"
                  : "border border-lesson-border bg-lesson-bg/40 text-lesson-text-secondary hover:text-lesson-text-primary",
              )}
            >
              {sc.title}
            </button>
          ))}
        </div>
      )}

      {/* Scenario Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-lesson-text-primary">
            {currentScenario.title}
          </h3>
          <span className="rounded border border-lesson-border bg-lesson-bg/60 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-lesson-text-muted">
            {mode === "mapping" ? "Mapping Mode" : "Trace Mode"}
          </span>
        </div>
        {currentScenario.description && (
          <p className="text-xs leading-relaxed text-lesson-text-secondary">
            {currentScenario.description}
          </p>
        )}
      </div>

      {/* The Visual Pipeline Model */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-lesson-border bg-lesson-bg/40 p-4 sm:p-6">
        {/* Optional Storage Stage (Rendered above Processing) */}
        {hasStorage && (
          <div
            data-testid="pipeline-storage-container"
            className="flex flex-col items-center gap-1.5"
          >
            <StageCard
              stage="storage"
              status={getStageStatus("storage")}
              title={currentScenario.storage?.title}
              description={currentScenario.storage?.description}
            />

            {/* Directional Connector between Storage and Processing */}
            <div
              data-testid="storage-relationship"
              data-action={storageAction}
              className="flex items-center gap-1.5 py-1 font-mono text-[11px] text-lesson-text-muted"
            >
              {storageAction === "save" ? (
                <>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-accent)]">
                    Save data
                  </span>
                  <ArrowUp aria-hidden="true" className="h-3.5 w-3.5 text-[var(--m-accent)]" />
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-accent)]">
                    Retrieve data
                  </span>
                  <ArrowDown aria-hidden="true" className="h-3.5 w-3.5 text-[var(--m-accent)]" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Pipeline Flow: INPUT -> PROCESSING -> OUTPUT */}
        <div
          data-testid="pipeline-main-flow"
          className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3"
        >
          {hasInput && <StageCard stage="input" status={getStageStatus("input")} />}

          {hasInput && hasProcessing && (
            <PipelineConnector active={getStageStatus("processing") !== "upcoming"} />
          )}

          {hasProcessing && <StageCard stage="processing" status={getStageStatus("processing")} />}

          {hasProcessing && hasOutput && (
            <PipelineConnector active={getStageStatus("output") !== "upcoming"} />
          )}

          {hasOutput && <StageCard stage="output" status={getStageStatus("output")} />}
        </div>
      </div>

      {/* Mode-Specific Interactive Section */}
      {mode === "trace" ? (
        /* TRACE MODE */
        <div data-testid="trace-mode-container" className="flex flex-col gap-4">
          {/* Active Step Detail Card */}
          {currentStep && (
            <div
              data-testid="trace-step-detail"
              className="rounded-xl border border-[var(--m-accent-line)] bg-[var(--m-accent-soft)] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m-accent)] font-mono text-[10px] font-bold text-lesson-bg">
                    {currentStepIndex + 1}
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--m-accent)]">
                    {currentStep.stage}
                  </span>
                  <span className="text-lesson-text-muted">•</span>
                  <span className="text-xs font-semibold text-lesson-text-primary">
                    {currentStep.title}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-lesson-text-muted">
                  Stage {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-lesson-text-secondary">
                {currentStep.description}
              </p>
            </div>
          )}

          {/* Trace Navigation & Progression Controls */}
          <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
            {/* Step Indicators */}
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="Trace step progression"
            >
              {steps.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  aria-label={`Step ${idx + 1}: ${s.title} (${s.stage})`}
                  aria-current={idx === currentStepIndex ? "step" : undefined}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    "flex min-h-[44px] items-center px-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m-accent)]",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 rounded-full transition-all",
                      idx === currentStepIndex
                        ? "w-7 bg-[var(--m-accent)]"
                        : idx < currentStepIndex
                          ? "w-3 bg-[var(--m-accent-line)] hover:bg-[var(--m-accent)]"
                          : "w-2 bg-lesson-border hover:bg-lesson-text-muted",
                    )}
                  />
                  <span className="sr-only">Step {idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Advance / Replay Action Button */}
            <div className="flex items-center gap-3">
              {isTraceCompleted && (
                <span
                  data-testid="trace-complete-badge"
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"
                >
                  <Check className="h-4 w-4" /> Trace complete
                </span>
              )}
              <button
                type="button"
                data-testid="trace-advance-button"
                onClick={handleAdvanceTrace}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m-accent)]"
                style={{ backgroundColor: "var(--m-accent)", color: "var(--lesson-bg)" }}
              >
                {isTraceCompleted ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Replay Trace
                  </>
                ) : currentStepIndex >= steps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" /> Finish Trace
                  </>
                ) : currentStepIndex === 0 ? (
                  <>
                    <Play className="h-4 w-4" /> Next Stage
                  </>
                ) : (
                  <>
                    Next Stage <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAPPING MODE */
        <div data-testid="mapping-mode-container" className="flex flex-col gap-4">
          {mapping ? (
            <fieldset className="space-y-4">
              <legend
                data-testid="mapping-prompt"
                className="text-sm font-semibold leading-relaxed text-lesson-text-primary"
              >
                {mapping.prompt}
              </legend>

              <div className="space-y-2.5" role="radiogroup" aria-label={mapping.prompt}>
                {mapping.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <label
                      key={choice.id}
                      data-testid={`mapping-choice-${choice.id}`}
                      className={cn(
                        "flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all focus-within:ring-2 focus-within:ring-[var(--m-accent)]",
                        isSelected
                          ? "border-[var(--m-accent)] bg-[var(--m-accent-soft)] text-lesson-text-primary"
                          : "border-lesson-border bg-lesson-bg/40 text-lesson-text-secondary hover:border-lesson-border/80 hover:bg-lesson-bg/70",
                      )}
                    >
                      <input
                        type="radio"
                        name={`pipeline-mapping-${currentScenario.id}`}
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => handleSelectChoice(choice.id)}
                        disabled={isSubmitted && isMappingCorrect}
                        className="h-4 w-4 text-[var(--m-accent)] focus:ring-[var(--m-accent)]"
                      />
                      <span className="text-sm font-medium leading-normal">{choice.text}</span>
                    </label>
                  );
                })}
              </div>

              {/* Submit Choice Button */}
              {!isSubmitted && (
                <div className="pt-2">
                  <button
                    type="button"
                    data-testid="mapping-check-button"
                    disabled={!selectedChoiceId}
                    onClick={handleCheckMapping}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--m-accent)",
                      color: "var(--lesson-bg)",
                    }}
                  >
                    Check Choice
                  </button>
                </div>
              )}

              {/* Feedback Surface */}
              {isSubmitted && (
                <div
                  data-testid="mapping-feedback"
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    isMappingCorrect
                      ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                      : "border-amber-500/40 bg-amber-950/20 text-amber-200",
                  )}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {isMappingCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span>Not quite</span>
                      </>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {selectedChoice?.rationale ||
                      (isMappingCorrect
                        ? mapping.explanation || "That matches the computer pipeline stage."
                        : "Think about where this action happens in the input-processing-output flow.")}
                  </p>

                  {!isMappingCorrect && (
                    <button
                      type="button"
                      data-testid="mapping-retry-button"
                      onClick={handleRetryMapping}
                      className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Try Again
                    </button>
                  )}
                </div>
              )}
            </fieldset>
          ) : (
            <p className="text-xs text-lesson-text-muted">No mapping question configured.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Visual card representing a single pipeline stage (Input, Processing, Output, Storage).
 */
function StageCard({
  stage,
  status,
  title,
  description,
}: {
  stage: ComputerPipelineStage;
  status: "active" | "completed" | "upcoming";
  title?: string;
  description?: string;
}) {
  const meta = STAGE_META[stage];
  const Icon = meta.icon;

  return (
    <div
      data-testid={`stage-card-${stage}`}
      data-stage={stage}
      data-status={status}
      className={cn(
        "flex min-h-[64px] min-w-[120px] flex-1 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
        status === "active" &&
          "border-[var(--m-accent)] bg-[var(--m-accent-soft)] text-lesson-text-primary shadow-[0_0_12px_var(--m-accent-soft)]",
        status === "completed" &&
          "border-emerald-500/40 bg-emerald-950/20 text-lesson-text-primary",
        status === "upcoming" &&
          "border-lesson-border bg-lesson-bg/30 text-lesson-text-muted opacity-60",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            status === "active" && "text-[var(--m-accent)]",
            status === "completed" && "text-emerald-400",
            status === "upcoming" && "text-lesson-text-muted",
          )}
        />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          {title || meta.defaultLabel}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-center">
        {status === "active" && (
          <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--m-accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--m-accent)] animate-pulse" />
            Active
          </span>
        )}
        {status === "completed" && (
          <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <Check className="h-3 w-3" />
            Done
          </span>
        )}
        {status === "upcoming" && (
          <span className="font-mono text-[10px] text-lesson-text-muted">○ Standby</span>
        )}
      </div>

      {description && (
        <p className="mt-1 max-w-[160px] text-[10px] leading-tight text-lesson-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Arrow connector between stages in the pipeline.
 * Horizontally oriented on tablet/desktop, vertically oriented on mobile.
 */
function PipelineConnector({ active }: { active?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center p-1" aria-hidden="true">
      <ArrowRight
        className={cn(
          "h-4 w-4 shrink-0 transition-colors rotate-90 sm:rotate-0",
          active ? "text-[var(--m-accent)]" : "text-lesson-text-muted",
        )}
      />
    </div>
  );
}
