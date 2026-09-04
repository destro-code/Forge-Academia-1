import React, { useState } from "react";
import {
  User,
  Mail,
  ShieldAlert,
  Laptop,
  Code2,
  Search,
  HelpCircle,
  Eye,
  Wrench,
  RotateCcw,
  CheckCircle2,
  FileText,
} from "lucide-react";

export const MIN_EXPLANATION_CHARACTERS = 40;
export const MIN_TRANSFER_HYPOTHESIS_CHARACTERS = 20;

export type TransferApproachId =
  | "gather_evidence"
  | "change_css"
  | "refresh_page"
  | "rewrite_component";

export interface TransferApproachOption {
  id: TransferApproachId;
  label: string;
}

export const TRANSFER_APPROACH_OPTIONS: TransferApproachOption[] = [
  {
    id: "gather_evidence",
    label: "Gather observable evidence about what actually happens in the system",
  },
  {
    id: "change_css",
    label: "Change visual styles and CSS until the interface looks right",
  },
  {
    id: "refresh_page",
    label: "Refresh the page repeatedly to see whether the issue resolves itself",
  },
  {
    id: "rewrite_component",
    label: "Rewrite the component immediately from scratch",
  },
];

export type TransferEvidenceId =
  | "visible_state"
  | "event_trigger"
  | "target_element"
  | "unrelated_styles"
  | "refresh_timestamps";

export interface TransferEvidenceOption {
  id: TransferEvidenceId;
  label: string;
}

export const TRANSFER_EVIDENCE_OPTIONS: TransferEvidenceOption[] = [
  {
    id: "visible_state",
    label: "What the preference interface visibly displays before and after toggling",
  },
  {
    id: "event_trigger",
    label: "Whether interacting with the toggle switch triggers an event handler",
  },
  {
    id: "target_element",
    label: "Which DOM element is intended to reflect the preference state",
  },
  {
    id: "unrelated_styles",
    label: "Unrelated CSS color definitions and font import rules",
  },
  {
    id: "refresh_timestamps",
    label: "Browser reload timestamps without observing element behavior",
  },
];
import type { ExperienceComposition } from "../../experience/experience-types";
import { cn } from "@/lib/utils";

export const DEFAULT_MECHANISM_CODE = `function handleSave(event) {
  saveAccountSettings();
}`;

export const HYPOTHESIS_OPTIONS = [
  {
    id: "not-connected",
    text: "The button is not connected to the behavior that should change the state.",
  },
  {
    id: "state-hidden",
    text: "The state changes, but the interface is not showing it.",
  },
  {
    id: "blocked-elsewhere",
    text: "The expected behavior is blocked somewhere else.",
  },
  {
    id: "need-more-evidence",
    text: "I need more evidence before I can make a hypothesis.",
  },
] as const;

export const INVESTIGATION_TEST_OPTIONS = [
  {
    id: "inspect-activation",
    text: "Inspect what happens when the button is activated.",
  },
  {
    id: "check-state-elsewhere",
    text: "Check whether the visible state changes somewhere else.",
  },
  {
    id: "check-behavior-connection",
    text: "Look for evidence that the expected behavior is actually connected to the button.",
  },
  {
    id: "need-more-evidence-test",
    text: "I would need another piece of evidence before choosing a test.",
  },
] as const;

export const RECONCILIATION_OPTIONS = [
  {
    id: "supports-hypothesis",
    text: "It supports my current hypothesis.",
  },
  {
    id: "weakens-hypothesis",
    text: "It makes my current hypothesis less convincing.",
  },
  {
    id: "inconclusive",
    text: "It does not give me enough information yet to decide.",
  },
] as const;

export const MECHANISM_INVESTIGATION_OPTIONS = [
  {
    id: "inspect-code",
    text: "Inspect the code connected to the save interaction.",
  },
  {
    id: "inspect-event",
    text: "Inspect how the button handles the click event.",
  },
  {
    id: "inspect-target-element",
    text: "Inspect the status element that is supposed to update.",
  },
  {
    id: "gather-broader-evidence",
    text: "Gather another piece of evidence before inspecting the mechanism.",
  },
] as const;

export interface MechanismInspectionData {
  id: MechanismInvestigationOptionId;
  target: string;
  observed: string[];
  evidence: string;
}

export type CausalInterpretationOptionId =
  | "strengthens-hypothesis"
  | "weakens-hypothesis"
  | "focus-inspected-path"
  | "insufficient-evidence";

export const CAUSAL_INTERPRETATION_OPTIONS = [
  {
    id: "strengthens-hypothesis",
    text: "The evidence makes my original hypothesis more convincing.",
  },
  {
    id: "weakens-hypothesis",
    text: "The evidence makes my original hypothesis less convincing.",
  },
  {
    id: "focus-inspected-path",
    text: "The evidence suggests I should focus on the interaction path I just inspected.",
  },
  {
    id: "insufficient-evidence",
    text: "I still do not have enough evidence to explain the failure.",
  },
] as const;

export type CausalDiagnosisConfidence = "high" | "medium" | "low";

export const DIAGNOSIS_CONFIDENCE_OPTIONS: {
  id: CausalDiagnosisConfidence;
  label: string;
}[] = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export interface PredictionAssessmentOption {
  id: string;
  label: string;
}

export const PREDICTION_ASSESSMENT_OPTIONS: PredictionAssessmentOption[] = [
  {
    id: "contradicts",
    label: "The observed result contradicts my predicted outcome.",
  },
  {
    id: "supports",
    label: "The observed result supports my predicted outcome.",
  },
  {
    id: "ambiguous",
    label: "The observed result is ambiguous or incomplete.",
  },
  {
    id: "need-more-tests",
    label: "I need to run another test to be sure.",
  },
];

export type VerificationComparisonOptionId = "yes" | "partly" | "no" | "cannot_tell";

export interface VerificationComparisonOption {
  id: VerificationComparisonOptionId;
  label: string;
}

export const VERIFICATION_COMPARISON_OPTIONS: VerificationComparisonOption[] = [
  {
    id: "yes",
    label: "Yes — the result matched what I expected.",
  },
  {
    id: "partly",
    label: "Partly — some evidence matched, but something remains unexplained.",
  },
  {
    id: "no",
    label: "No — the result contradicted my prediction.",
  },
  {
    id: "cannot_tell",
    label: "I cannot tell yet.",
  },
];

export type VerificationAssessmentOptionId =
  "stronger_reason" | "weaker_reason" | "needs_refinement" | "need_another_test";

export interface VerificationAssessmentOption {
  id: VerificationAssessmentOptionId;
  label: string;
}

export const VERIFICATION_ASSESSMENT_OPTIONS: VerificationAssessmentOption[] = [
  {
    id: "stronger_reason",
    label: "It gives me stronger reason to keep my diagnosis.",
  },
  {
    id: "weaker_reason",
    label: "It gives me weaker reason to keep my diagnosis.",
  },
  {
    id: "needs_refinement",
    label: "It shows that my diagnosis needs refinement.",
  },
  {
    id: "need_another_test",
    label: "I need another test before I can decide.",
  },
];

export const MECHANISM_INSPECTIONS: Record<
  MechanismInvestigationOptionId,
  MechanismInspectionData
> = {
  "inspect-code": {
    id: "inspect-code",
    target: "Code connected to the save interaction",
    observed: [
      "Handler definition: function handleSave() { saveChanges(); }",
      "Status reference: const status = document.querySelector('#status')",
      "Listener binding: Save button click invokes handleSave()",
    ],
    evidence:
      "The script defines handleSave() which invokes saveChanges(), with status referencing the DOM element #status.",
  },
  "inspect-event": {
    id: "inspect-event",
    target: "Button event handling",
    observed: [
      'Element: <button id="account-save-button">Save Changes</button>',
      "Event type: 'click'",
      "Registered listener: handleSave",
      "Event dispatch: Click event dispatches on user interaction",
    ],
    evidence:
      "The Save Changes button element receives click events and triggers the registered handleSave function.",
  },
  "inspect-target-element": {
    id: "inspect-target-element",
    target: "Status element in document",
    observed: [
      'Element: <p id="account-status-message">',
      'Initial text content: "No changes saved."',
      'Current text content: "No changes saved."',
      'DOM location: <main> > <p id="account-status-message">',
    ],
    evidence: "The status element is present in the DOM with text content 'No changes saved.'",
  },
  "gather-broader-evidence": {
    id: "gather-broader-evidence",
    target: "Document and environment state",
    observed: [
      "Elements present: <main>, Display name input, Email input, Save button, Status element",
      "Input interaction: Text input fields reflect typed characters",
      "Button interaction: Click event triggers on Save Changes",
    ],
    evidence:
      "Document elements are rendered and user input interactions dispatch their standard events.",
  },
};

export interface AccountSettingsSystemProps {
  config?: Record<string, unknown>;
  visualData?: Record<string, unknown>;
  experienceComposition?: ExperienceComposition;
}

/**
 * AccountSettingsSystem — Golden Lesson (lesson-0-1-1) System Surface.
 *
 * Simulates an authentic, interactive miniature Account Settings application:
 * - Display name input (starts as "Remi")
 * - Email address input (starts as "remi@example.com")
 * - "Save Changes" action button
 * - Minimal inspection affordance for the Save Changes button
 * - Persistent status display ("No changes saved.")
 *
 * Pedagogical Contract:
 * - The inputs are genuine and editable by the learner.
 * - The "Save Changes" button is interactable and produces real click events,
 *   but INTENTIONALLY does not update the system status.
 * - Preserves the core learning mystery of lesson-0-1-1: "The Button Has Betrayed You".
 * - Minimal inspection surface provides observable structural DOM facts without leaking root-cause diagnoses.
 * - Completely local component state; zero mutation to canonical progression or session.
 * - Presentation responds to ExperienceComposition metadata (density, spatialMode).
 */
export function AccountSettingsSystem({
  config,
  visualData,
  experienceComposition,
}: AccountSettingsSystemProps) {
  const findElementValue = (label: string): string | undefined => {
    if (Array.isArray(visualData?.elements)) {
      const el = visualData.elements.find(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          typeof item.label === "string" &&
          item.label.toLowerCase().includes(label.toLowerCase()),
      );
      if (el && "value" in el && typeof el.value === "string") {
        return el.value;
      }
    }
    return undefined;
  };

  const initialName =
    typeof config?.displayName === "string"
      ? config.displayName
      : typeof visualData?.displayName === "string"
        ? visualData.displayName
        : (findElementValue("display") ?? "Remi");

  const initialEmail =
    typeof config?.email === "string"
      ? config.email
      : typeof visualData?.email === "string"
        ? visualData.email
        : (findElementValue("email") ?? "remi@example.com");

  const [displayName, setDisplayName] = useState<string>(initialName);
  const [email, setEmail] = useState<string>(initialEmail);
  const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<string | null>(null);
  const [hasInvestigated, setHasInvestigated] = useState<boolean>(false);
  const [hypothesisAssessment, setHypothesisAssessment] = useState<string | null>(null);
  const [mechanismInvestigation, setMechanismInvestigation] = useState<string | null>(null);
  const [hasInspectedMechanism, setHasInspectedMechanism] = useState<boolean>(false);
  const [causalInterpretation, setCausalInterpretation] =
    useState<CausalInterpretationOptionId | null>(null);
  const [diagnosisStatement, setDiagnosisStatement] = useState<string>("");
  const [diagnosisConfidence, setDiagnosisConfidence] = useState<CausalDiagnosisConfidence | null>(
    null,
  );
  const [isDiagnosisRecorded, setIsDiagnosisRecorded] = useState<boolean>(false);
  const [diagnosisPrediction, setDiagnosisPrediction] = useState<string>("");
  const [isPredictionRecorded, setIsPredictionRecorded] = useState<boolean>(false);
  const [predictionAssessment, setPredictionAssessment] = useState<string | null>(null);
  const [interventionCode, setInterventionCode] = useState<string>(DEFAULT_MECHANISM_CODE);
  const [isInterventionApplied, setIsInterventionApplied] = useState<boolean>(false);
  const [verificationComparison, setVerificationComparison] =
    useState<VerificationComparisonOptionId | null>(null);
  const [verificationAssessment, setVerificationAssessment] =
    useState<VerificationAssessmentOptionId | null>(null);
  const [isVerificationRecorded, setIsVerificationRecorded] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>("");
  const [isExplanationRecorded, setIsExplanationRecorded] = useState<boolean>(false);
  const [transferApproach, setTransferApproach] = useState<TransferApproachId | null>(null);
  const [transferEvidence, setTransferEvidence] = useState<TransferEvidenceId[]>([]);
  const [transferHypothesis, setTransferHypothesis] = useState<string>("");
  const [isTransferRecorded, setIsTransferRecorded] = useState<boolean>(false);

  const isInterventionModified = interventionCode.trim() !== DEFAULT_MECHANISM_CODE.trim();

  // Presentation metadata derived from ExperienceComposition
  const density = experienceComposition?.density ?? "normal";
  const spatialMode = experienceComposition?.spatialMode;

  const containerWidthClass = spatialMode === "focused" ? "max-w-lg" : "max-w-md";

  const headerPaddingClass =
    density === "spacious"
      ? "px-6 pt-5 pb-4"
      : density === "compact"
        ? "px-4 pt-3 pb-2"
        : "px-5 pt-4 pb-3";

  const formSpacingClass =
    density === "spacious"
      ? "p-6 sm:p-7 space-y-6"
      : density === "compact"
        ? "p-3.5 space-y-2.5"
        : "p-5 space-y-4";

  const fieldGapClass =
    density === "spacious" ? "space-y-2" : density === "compact" ? "space-y-1" : "space-y-1.5";

  const actionSpacingClass =
    density === "spacious"
      ? "pt-3 space-y-4"
      : density === "compact"
        ? "pt-1.5 space-y-2"
        : "pt-2 space-y-3";

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setHasAttemptedSave(true);
    // Intentionally preserves the pedagogical failure: status remains "No changes saved."
  };

  return (
    <div
      data-testid="account-settings-system"
      data-experience-mode={experienceComposition?.mode}
      data-spatial-mode={spatialMode}
      data-density={density}
      data-focal-surface={experienceComposition?.focalSurface}
      data-save-attempted={hasAttemptedSave ? "true" : "false"}
      data-inspecting={isInspecting ? "true" : "false"}
      data-selected-hypothesis={selectedHypothesis ?? "none"}
      data-selected-investigation={selectedInvestigation ?? "none"}
      data-investigating={hasInvestigated ? "true" : "false"}
      data-hypothesis-assessment={hypothesisAssessment ?? "none"}
      data-mechanism-investigation={mechanismInvestigation ?? "none"}
      data-inspected-mechanism={hasInspectedMechanism ? "true" : "false"}
      data-causal-interpretation={causalInterpretation ?? "none"}
      data-diagnosis-recorded={isDiagnosisRecorded ? "true" : "false"}
      data-diagnosis-confidence={diagnosisConfidence ?? "none"}
      data-diagnosis-prediction-recorded={isPredictionRecorded ? "true" : "false"}
      data-prediction-assessment={predictionAssessment ?? "none"}
      data-intervention-applied={isInterventionApplied ? "true" : "false"}
      data-intervention-modified={isInterventionModified ? "true" : "false"}
      data-verification-comparison={verificationComparison ?? "none"}
      data-verification-assessment={verificationAssessment ?? "none"}
      data-verification-recorded={isVerificationRecorded ? "true" : "false"}
      data-explanation-recorded={isExplanationRecorded ? "true" : "false"}
      data-explanation-length={explanation.length}
      data-transfer-approach={transferApproach ?? "none"}
      data-transfer-recorded={isTransferRecorded ? "true" : "false"}
      data-transfer-hypothesis-length={transferHypothesis.length}
      className={cn(
        "w-full mx-auto overflow-hidden rounded-xl border border-lesson-border bg-lesson-surface shadow-sm font-sans transition-all",
        containerWidthClass,
      )}
    >
      {/* Mini-app Window Chrome */}
      <div className="flex items-center justify-between border-b border-lesson-border/70 bg-lesson-bg/80 px-4 py-2.5 text-xs text-lesson-text-muted select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="ml-1 text-[11px] font-mono tracking-tight text-lesson-text-muted/90">
            account-settings.local
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-lesson-text-muted/70">
          <Laptop className="h-3 w-3" />
          <span>Mini App</span>
        </div>
      </div>

      {/* Mini-app Header */}
      <div className={cn("border-b border-lesson-border/40", headerPaddingClass)}>
        <h3 className="text-sm font-semibold tracking-tight text-lesson-text">Account Settings</h3>
        <p className="text-xs text-lesson-text-secondary mt-0.5">
          Manage your personal profile and preferences
        </p>
      </div>

      {/* Mini-app Form Area */}
      <form onSubmit={(e) => e.preventDefault()} className={cn("text-xs", formSpacingClass)}>
        {/* Display Name Field */}
        <div className={fieldGapClass}>
          <label
            htmlFor="account-display-name"
            className="block text-xs font-medium text-lesson-text"
          >
            Display name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lesson-text-muted pointer-events-none" />
            <input
              id="account-display-name"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-label="Display name"
              className="w-full min-h-[44px] rounded-lg border border-lesson-border bg-lesson-bg/60 pl-9 pr-3 py-2 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-lesson-accent focus:outline-none focus:ring-1 focus:ring-lesson-accent/30"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className={fieldGapClass}>
          <label htmlFor="account-email" className="block text-xs font-medium text-lesson-text">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lesson-text-muted pointer-events-none" />
            <input
              id="account-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              className="w-full min-h-[44px] rounded-lg border border-lesson-border bg-lesson-bg/60 pl-9 pr-3 py-2 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-lesson-accent focus:outline-none focus:ring-1 focus:ring-lesson-accent/30"
            />
          </div>
        </div>

        {/* Actions & Status Area */}
        <div className={actionSpacingClass}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="account-save-button"
              onClick={handleSave}
              aria-label="Save Changes"
              className="flex-1 min-h-[44px] rounded-lg bg-lesson-accent px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-lesson-accent/90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-lesson-accent/40 cursor-pointer"
            >
              Save Changes
            </button>
            <button
              type="button"
              id="account-inspect-button"
              onClick={() => setIsInspecting((prev) => !prev)}
              aria-label={
                isInspecting
                  ? "Close inspector for Save Changes button"
                  : "Inspect Save Changes button"
              }
              aria-expanded={isInspecting}
              aria-controls="account-save-button-inspector"
              className={cn(
                "min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lesson-accent/40 select-none",
                isInspecting
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-300 shadow-sm"
                  : "border-lesson-border bg-lesson-bg/60 text-lesson-text-secondary hover:text-lesson-text hover:border-lesson-border/80",
              )}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Inspect</span>
            </button>
          </div>

          {/* Minimal Element Inspection Surface */}
          {isInspecting && (
            <div
              id="account-save-button-inspector"
              data-testid="inspection-surface"
              className="rounded-lg border border-lesson-border/70 bg-lesson-bg/80 p-3 text-xs font-sans space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between border-b border-lesson-border/50 pb-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-medium text-lesson-text">
                  <Code2 className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>Element Inspector</span>
                </div>
                <span className="font-mono text-[10px] text-lesson-text-muted">
                  #account-save-button
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-mono">
                <div>
                  <span className="text-lesson-text-muted block text-[10px] font-sans uppercase tracking-wider">
                    Element
                  </span>
                  <span className="text-lesson-text font-semibold">button</span>
                </div>
                <div>
                  <span className="text-lesson-text-muted block text-[10px] font-sans uppercase tracking-wider">
                    ID
                  </span>
                  <span className="text-lesson-text">account-save-button</span>
                </div>
                <div>
                  <span className="text-lesson-text-muted block text-[10px] font-sans uppercase tracking-wider">
                    Type
                  </span>
                  <span className="text-lesson-text">button</span>
                </div>
                <div>
                  <span className="text-lesson-text-muted block text-[10px] font-sans uppercase tracking-wider">
                    Label
                  </span>
                  <span className="text-lesson-text font-semibold">Save Changes</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Display Area — Accessible Polite Live Region */}
          <div
            role="status"
            aria-live="polite"
            className="space-y-1.5 rounded-lg border border-lesson-border/60 bg-lesson-bg/40 px-3 py-2 text-xs text-lesson-text-secondary"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-lesson-text-muted" />
              <span className="font-mono text-[11px]">No changes saved.</span>
            </div>

            {hasAttemptedSave && (
              <>
                {/* Observable Fact / Consequence Evidence */}
                <div
                  data-testid="save-consequence-evidence"
                  className="border-t border-lesson-border/40 pt-1.5 font-mono text-[11px] leading-relaxed text-lesson-text-muted"
                >
                  <div className="flex items-center gap-1.5 text-lesson-text-secondary">
                    <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-lesson-accent/70" />
                    <span>Save Changes activated.</span>
                  </div>
                  <p className="pl-3 text-[11px] text-lesson-text-muted">
                    No visible state change occurred.
                  </p>
                </div>

                {/* Structured Interaction Evidence */}
                <div
                  data-testid="interaction-evidence"
                  className="border-t border-lesson-border/40 pt-1.5 font-mono text-[11px] leading-relaxed text-lesson-text-muted"
                >
                  <div className="text-[10px] font-sans font-medium text-lesson-text-secondary uppercase tracking-wider mb-1">
                    Interaction Evidence
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div>
                      <span className="text-[10px] font-sans text-lesson-text-muted block">
                        Interaction
                      </span>
                      <span className="text-lesson-text">Save Changes activated</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-sans text-lesson-text-muted block">
                        State
                      </span>
                      <span className="text-lesson-text">Unchanged</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-sans text-lesson-text-muted block">
                        Observed Outcome
                      </span>
                      <span className="text-lesson-text">No visible state change occurred.</span>
                    </div>
                  </div>
                </div>

                {/* Investigation Transition Cue */}
                <div
                  data-testid="investigation-transition-cue"
                  className="border-t border-lesson-border/40 pt-1.5 text-[11px] leading-relaxed text-lesson-text-secondary"
                >
                  <div className="flex items-start gap-1.5">
                    <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-400/80" />
                    <div>
                      <span className="font-medium text-lesson-text">There is evidence here.</span>{" "}
                      <span className="text-lesson-text-muted">
                        Find out what the button is actually doing.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Causal Hypothesis Reasoning Surface */}
          {hasAttemptedSave && (
            <fieldset
              id="account-hypothesis-surface"
              data-testid="hypothesis-surface"
              className="space-y-2.5 rounded-lg border border-lesson-border/70 bg-lesson-bg/60 p-3 text-xs transition-all"
            >
              <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />
                <span>What do you think is happening?</span>
              </legend>

              <p className="text-[11px] leading-relaxed text-lesson-text-muted">
                The button activates, but the visible state does not change. What is your current
                hypothesis?
              </p>

              <div className="space-y-1.5 pt-1">
                {HYPOTHESIS_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={`hypothesis-${option.id}`}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
                      selectedHypothesis === option.id
                        ? "border-amber-400/60 bg-amber-400/10 text-lesson-text"
                        : "border-lesson-border/50 bg-lesson-bg/30 text-lesson-text-secondary hover:border-lesson-border/80 hover:text-lesson-text",
                    )}
                  >
                    <input
                      type="radio"
                      id={`hypothesis-${option.id}`}
                      name="account-causal-hypothesis"
                      value={option.id}
                      checked={selectedHypothesis === option.id}
                      onChange={() => setSelectedHypothesis(option.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 accent-amber-500 focus:ring-2 focus:ring-amber-400/40"
                    />
                    <span className="text-[11px] leading-snug">{option.text}</span>
                  </label>
                ))}
              </div>

              {selectedHypothesis && (
                <div
                  data-testid="hypothesis-recorded-status"
                  className="pt-1 text-[11px] italic text-lesson-text-muted"
                >
                  Hypothesis recorded.
                </div>
              )}
            </fieldset>
          )}

          {/* Evidence Test Reasoning Surface */}
          {hasAttemptedSave && (
            <fieldset
              id="account-investigation-test-surface"
              data-testid="investigation-test-surface"
              className="space-y-2.5 rounded-lg border border-lesson-border/70 bg-lesson-bg/60 p-3 text-xs transition-all"
            >
              <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                <Search className="h-3.5 w-3.5 text-amber-400/90" />
                <span>How would you test that?</span>
              </legend>

              <p className="text-[11px] leading-relaxed text-lesson-text-muted">
                You have a hypothesis. What would be useful evidence to look for next?
              </p>

              <div className="space-y-1.5 pt-1">
                {INVESTIGATION_TEST_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={`investigation-${option.id}`}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-colors",
                      selectedInvestigation === option.id
                        ? "border-amber-400/60 bg-amber-400/10 text-lesson-text"
                        : "border-lesson-border/50 bg-lesson-bg/30 text-lesson-text-secondary hover:border-lesson-border/80 hover:text-lesson-text",
                    )}
                  >
                    <input
                      type="radio"
                      id={`investigation-${option.id}`}
                      name="account-investigation-test"
                      value={option.id}
                      checked={selectedInvestigation === option.id}
                      onChange={() => setSelectedInvestigation(option.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 accent-amber-500 focus:ring-2 focus:ring-amber-400/40"
                    />
                    <span className="text-[11px] leading-snug">{option.text}</span>
                  </label>
                ))}
              </div>

              {selectedInvestigation && (
                <div
                  data-testid="investigation-recorded-status"
                  className="pt-1 text-[11px] italic text-lesson-text-muted"
                >
                  Test selected.
                </div>
              )}
            </fieldset>
          )}

          {/* Investigation Execution & Evidence Surface */}
          {hasAttemptedSave && selectedInvestigation && (
            <div
              id="account-investigation-execution-surface"
              data-testid="investigation-execution-surface"
              className="space-y-2.5 rounded-lg border border-lesson-border/70 bg-lesson-bg/60 p-3 text-xs transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text">
                  <Search className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>Investigate the System</span>
                </div>
                <button
                  type="button"
                  id="account-investigate-action-button"
                  data-testid="investigate-action-button"
                  onClick={() => setHasInvestigated((prev) => !prev)}
                  aria-expanded={hasInvestigated}
                  className={cn(
                    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40",
                    hasInvestigated
                      ? "border border-lesson-border/80 bg-lesson-surface text-lesson-text hover:bg-lesson-bg"
                      : "border border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{hasInvestigated ? "Hide Evidence" : "Gather Evidence"}</span>
                </button>
              </div>

              {hasInvestigated && (
                <div
                  id="account-investigation-result-surface"
                  data-testid="investigation-result-surface"
                  className="space-y-2 rounded-md border border-lesson-border/60 bg-lesson-surface/80 p-2.5 text-xs transition-all"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text">
                    <Code2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>Investigation Result</span>
                  </div>

                  <dl className="grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2">
                    <div className="rounded border border-lesson-border/40 bg-lesson-bg/50 p-1.5">
                      <dt className="text-lesson-text-muted">Observation</dt>
                      <dd className="font-mono text-lesson-text">The button can be activated</dd>
                    </div>
                    <div className="rounded border border-lesson-border/40 bg-lesson-bg/50 p-1.5">
                      <dt className="text-lesson-text-muted">Target Element</dt>
                      <dd className="font-mono text-lesson-text">
                        &lt;button id="account-save-button"&gt;
                      </dd>
                    </div>
                    <div className="rounded border border-lesson-border/40 bg-lesson-bg/50 p-1.5">
                      <dt className="text-lesson-text-muted">Visible Outcome</dt>
                      <dd className="font-mono text-lesson-text">
                        No visible state change occurred
                      </dd>
                    </div>
                    <div className="rounded border border-lesson-border/40 bg-lesson-bg/50 p-1.5">
                      <dt className="text-lesson-text-muted">Status Field</dt>
                      <dd className="font-mono text-lesson-text">"No changes saved."</dd>
                    </div>
                  </dl>

                  <div className="pt-1 text-[11px] leading-relaxed text-lesson-text-muted">
                    Compare this evidence with your hypothesis. You can update your hypothesis or
                    choose another test above as you continue investigating.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Reconciliation Surface */}
          {hasAttemptedSave && selectedInvestigation && hasInvestigated && (
            <fieldset
              id="account-evidence-reconciliation-surface"
              data-testid="evidence-reconciliation-surface"
              className="space-y-2 rounded-lg border border-lesson-border/70 bg-lesson-bg/60 p-3 text-xs transition-all"
            >
              <legend className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text px-1">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />
                <span>What does the evidence tell you?</span>
              </legend>

              <div className="text-[11px] leading-relaxed text-lesson-text-muted">
                The button activates, but the visible state still does not change. How does this
                evidence affect your current hypothesis?
              </div>

              <div className="space-y-1.5 pt-1">
                {RECONCILIATION_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all select-none",
                      hypothesisAssessment === opt.id
                        ? "border-amber-400/60 bg-amber-400/10 text-lesson-text shadow-sm"
                        : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-muted hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                    )}
                  >
                    <input
                      type="radio"
                      id={`reconciliation-${opt.id}`}
                      name="account-hypothesis-assessment"
                      value={opt.id}
                      checked={hypothesisAssessment === opt.id}
                      onChange={() => setHypothesisAssessment(opt.id)}
                      className="h-4 w-4 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                    />
                    <span className="text-[11px] leading-tight font-normal">{opt.text}</span>
                  </label>
                ))}
              </div>

              {hypothesisAssessment && (
                <div
                  data-testid="reconciliation-recorded-status"
                  className="pt-1 text-[11px] italic text-lesson-text-muted"
                >
                  Reasoning recorded.
                </div>
              )}
            </fieldset>
          )}

          {/* Mechanism Investigation Direction Surface */}
          {hasAttemptedSave && selectedInvestigation && hasInvestigated && hypothesisAssessment && (
            <fieldset
              id="account-mechanism-investigation-surface"
              data-testid="mechanism-investigation-surface"
              className="space-y-2 rounded-lg border border-lesson-border/70 bg-lesson-bg/60 p-3 text-xs transition-all"
            >
              <legend className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text px-1">
                <Code2 className="h-3.5 w-3.5 text-amber-400/90" />
                <span>What should you inspect next?</span>
              </legend>

              <div className="text-[11px] leading-relaxed text-lesson-text-muted">
                You have evidence that the interaction occurs. Now investigate the mechanism behind
                the behavior.
              </div>

              <div className="space-y-1.5 pt-1">
                {MECHANISM_INVESTIGATION_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    htmlFor={`mechanism-${opt.id}`}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all select-none",
                      mechanismInvestigation === opt.id
                        ? "border-amber-400/60 bg-amber-400/10 text-lesson-text shadow-sm"
                        : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-muted hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                    )}
                  >
                    <input
                      type="radio"
                      id={`mechanism-${opt.id}`}
                      name="account-mechanism-investigation"
                      value={opt.id}
                      checked={mechanismInvestigation === opt.id}
                      onChange={() => {
                        setMechanismInvestigation(opt.id);
                        setHasInspectedMechanism(false);
                        setCausalInterpretation(null);
                      }}
                      className="h-4 w-4 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                    />
                    <span className="text-[11px] leading-tight font-normal">{opt.text}</span>
                  </label>
                ))}
              </div>

              {mechanismInvestigation && (
                <div className="space-y-2 pt-1">
                  <div
                    data-testid="mechanism-investigation-recorded-status"
                    className="text-[11px] italic text-lesson-text-muted"
                  >
                    Investigation direction recorded.
                  </div>
                  <div
                    data-testid="mechanism-investigation-transition-cue"
                    className="text-[11px] leading-relaxed text-lesson-text-muted"
                  >
                    Now inspect the mechanism and look for evidence.
                  </div>

                  <button
                    type="button"
                    id="inspect-mechanism-action-button"
                    data-testid="inspect-mechanism-action-button"
                    onClick={() => setHasInspectedMechanism(true)}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <Code2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {hasInspectedMechanism ? "Re-inspect Mechanism" : "Inspect Mechanism"}
                    </span>
                  </button>
                </div>
              )}
            </fieldset>
          )}

          {/* Mechanism Inspection Result Surface */}
          {hasAttemptedSave &&
            selectedInvestigation &&
            hasInvestigated &&
            hypothesisAssessment &&
            mechanismInvestigation &&
            hasInspectedMechanism &&
            MECHANISM_INSPECTIONS[mechanismInvestigation] && (
              <div
                id="account-mechanism-inspection-result-surface"
                data-testid="mechanism-inspection-result-surface"
                className="space-y-2 rounded-lg border border-amber-400/50 bg-amber-400/5 p-3 text-xs transition-all"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-lesson-text">
                  <Code2 className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>MECHANISM INSPECTION</span>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-semibold text-lesson-text">What you inspected: </span>
                    <span
                      data-testid="mechanism-inspection-target"
                      className="text-lesson-text-muted"
                    >
                      {MECHANISM_INSPECTIONS[mechanismInvestigation].target}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-lesson-text">Observed:</span>
                    <ul
                      data-testid="mechanism-inspection-observed-list"
                      className="list-disc pl-4 space-y-0.5 text-lesson-text-muted font-mono text-[10.5px]"
                    >
                      {MECHANISM_INSPECTIONS[mechanismInvestigation].observed.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-lesson-text">Evidence: </span>
                    <span
                      data-testid="mechanism-inspection-evidence"
                      className="text-lesson-text-muted"
                    >
                      {MECHANISM_INSPECTIONS[mechanismInvestigation].evidence}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Causal Interpretation Reasoning Surface */}
          {hasAttemptedSave &&
            selectedInvestigation &&
            hasInvestigated &&
            hypothesisAssessment &&
            mechanismInvestigation &&
            hasInspectedMechanism &&
            MECHANISM_INSPECTIONS[mechanismInvestigation] && (
              <fieldset
                id="account-causal-interpretation-surface"
                data-testid="causal-interpretation-surface"
                className="space-y-2.5 rounded-lg border border-amber-400/50 bg-amber-400/5 p-3 text-xs transition-all"
              >
                <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>Interpret the evidence</span>
                </legend>

                <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                  <p className="font-semibold text-lesson-text">
                    Now that you have inspected the mechanism, what do you think the evidence means?
                  </p>
                  <p className="text-[10.5px]">
                    Separate what the system showed you (
                    <span className="font-mono text-slate-300">observed</span>) from what you think
                    it means (<span className="font-mono text-slate-300">inferred</span>).
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {CAUSAL_INTERPRETATION_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      htmlFor={`interpretation-${opt.id}`}
                      className={cn(
                        "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all select-none",
                        causalInterpretation === opt.id
                          ? "border-amber-400/60 bg-amber-400/10 text-lesson-text shadow-sm"
                          : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                      )}
                    >
                      <input
                        type="radio"
                        id={`interpretation-${opt.id}`}
                        name="account-causal-interpretation"
                        value={opt.id}
                        checked={causalInterpretation === opt.id}
                        onChange={() => setCausalInterpretation(opt.id)}
                        className="h-4 w-4 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                      />
                      <span className="text-[11px] leading-snug font-normal">{opt.text}</span>
                    </label>
                  ))}
                </div>

                {causalInterpretation && (
                  <div className="space-y-1.5 pt-1">
                    <div
                      data-testid="causal-interpretation-recorded-status"
                      className="text-[11px] italic text-lesson-text-muted"
                    >
                      Interpretation recorded.
                    </div>
                    <div
                      data-testid="causal-interpretation-transition-cue"
                      className="text-[11px] leading-relaxed text-lesson-text-muted"
                    >
                      Your interpretation is recorded. Now separate what you know from what you
                      still need to verify.
                    </div>
                  </div>
                )}
              </fieldset>
            )}

          {/* Causal Diagnosis Reasoning Surface (Change 14) */}
          {hasAttemptedSave &&
            selectedInvestigation &&
            hasInvestigated &&
            hypothesisAssessment &&
            mechanismInvestigation &&
            hasInspectedMechanism &&
            causalInterpretation && (
              <fieldset
                id="account-causal-diagnosis-surface"
                data-testid="causal-diagnosis-surface"
                className="space-y-3 rounded-lg border border-amber-400/50 bg-amber-400/5 p-3 text-xs transition-all"
              >
                <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>State your diagnosis</span>
                </legend>

                <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                  <p className="font-semibold text-lesson-text">
                    State what you believe is causing the observed failure.
                  </p>
                  <p className="text-[10.5px]">
                    Use the evidence you inspected to explain what you think is causing the observed
                    failure. A diagnosis is a causal claim, not just a description of what happened.
                  </p>
                </div>

                <div className="space-y-1 rounded border border-lesson-border/50 bg-lesson-surface/60 p-2 text-[10.5px] leading-relaxed text-lesson-text-muted">
                  <div>
                    <span className="font-semibold text-slate-300">Observation:</span> What happened
                    visually (the status stayed unchanged).
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Evidence:</span> What the system
                    showed (the button click reaches the handler).
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Diagnosis:</span> Your causal
                    explanation for why the expected state change does not occur.
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="account-diagnosis-statement-input"
                    className="block text-[11px] font-medium text-lesson-text"
                  >
                    What do you think is causing the failure?
                  </label>
                  <textarea
                    id="account-diagnosis-statement-input"
                    data-testid="diagnosis-statement-input"
                    rows={3}
                    value={diagnosisStatement}
                    onChange={(e) => {
                      setDiagnosisStatement(e.target.value);
                      if (isDiagnosisRecorded) setIsDiagnosisRecorded(false);
                      if (isPredictionRecorded) setIsPredictionRecorded(false);
                    }}
                    placeholder="Explain why the expected state change does not occur based on the evidence you inspected..."
                    className="w-full rounded-lg border border-lesson-border bg-lesson-bg/60 p-2.5 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                <fieldset
                  id="account-diagnosis-confidence-group"
                  data-testid="diagnosis-confidence-fieldset"
                  className="space-y-1.5"
                >
                  <legend className="text-[11px] font-medium text-lesson-text">
                    How confident are you?
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {DIAGNOSIS_CONFIDENCE_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`confidence-${opt.id}`}
                        className={cn(
                          "flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-md border px-2 py-2 text-xs transition-all select-none",
                          diagnosisConfidence === opt.id
                            ? "border-amber-400/60 bg-amber-400/10 font-medium text-lesson-text shadow-sm"
                            : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                        )}
                      >
                        <input
                          type="radio"
                          id={`confidence-${opt.id}`}
                          name="account-diagnosis-confidence"
                          value={opt.id}
                          checked={diagnosisConfidence === opt.id}
                          onChange={() => {
                            setDiagnosisConfidence(opt.id);
                            if (isDiagnosisRecorded) setIsDiagnosisRecorded(false);
                            if (isPredictionRecorded) setIsPredictionRecorded(false);
                          }}
                          className="h-3.5 w-3.5 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="pt-1">
                  <button
                    type="button"
                    id="record-diagnosis-action-button"
                    data-testid="record-diagnosis-action-button"
                    onClick={() => {
                      if (diagnosisStatement.trim() && diagnosisConfidence) {
                        setIsDiagnosisRecorded(true);
                      }
                    }}
                    disabled={!diagnosisStatement.trim() || !diagnosisConfidence}
                    className={cn(
                      "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all shadow-sm select-none",
                      diagnosisStatement.trim() && diagnosisConfidence
                        ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                        : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                    )}
                  >
                    <span>Record diagnosis</span>
                  </button>
                </div>

                {isDiagnosisRecorded && (
                  <div className="space-y-1.5 pt-1 border-t border-amber-400/20">
                    <div
                      data-testid="diagnosis-recorded-status"
                      className="text-[11px] font-medium text-amber-300"
                    >
                      Diagnosis recorded.
                    </div>
                    <div
                      data-testid="diagnosis-transition-cue"
                      className="text-[11px] leading-relaxed text-lesson-text-muted"
                    >
                      Your diagnosis is recorded. The next step is to test whether it explains the
                      evidence.
                    </div>
                  </div>
                )}
              </fieldset>
            )}

          {/* Diagnosis Prediction Surface (Change 15) */}
          {hasAttemptedSave &&
            selectedInvestigation &&
            hasInvestigated &&
            hypothesisAssessment &&
            mechanismInvestigation &&
            hasInspectedMechanism &&
            causalInterpretation &&
            isDiagnosisRecorded && (
              <fieldset
                id="account-diagnosis-prediction-surface"
                data-testid="diagnosis-prediction-surface"
                className="space-y-3 rounded-lg border border-amber-400/50 bg-amber-400/5 p-3 text-xs transition-all"
              >
                <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>Test the diagnosis</span>
                </legend>

                {/* Preservation of recorded diagnosis & confidence */}
                <div
                  data-testid="preserved-recorded-diagnosis"
                  className="rounded-md border border-lesson-border/60 bg-lesson-surface/80 p-2.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-lesson-text uppercase tracking-wider text-[10px]">
                      Your Recorded Diagnosis
                    </span>
                    <span
                      data-testid="preserved-diagnosis-confidence"
                      className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-400/30"
                    >
                      Confidence: {diagnosisConfidence ? diagnosisConfidence.toUpperCase() : "NONE"}
                    </span>
                  </div>
                  <p
                    data-testid="preserved-diagnosis-statement"
                    className="text-[11px] text-lesson-text-secondary font-mono italic"
                  >
                    "{diagnosisStatement}"
                  </p>
                </div>

                <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                  <p className="font-semibold text-lesson-text">
                    Predict what should happen when you test your diagnosis.
                  </p>
                  <p className="text-[10.5px]">
                    If your diagnosis is correct, what should you expect to observe when you test it
                    against the system?
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="account-diagnosis-prediction-input"
                    className="block text-[11px] font-medium text-lesson-text"
                  >
                    What should you observe if your diagnosis is correct?
                  </label>
                  <textarea
                    id="account-diagnosis-prediction-input"
                    data-testid="diagnosis-prediction-input"
                    rows={3}
                    value={diagnosisPrediction}
                    onChange={(e) => {
                      setDiagnosisPrediction(e.target.value);
                      if (isPredictionRecorded) setIsPredictionRecorded(false);
                    }}
                    placeholder="Describe the specific outcome or evidence you expect to see if your diagnosis holds true..."
                    className="w-full rounded-lg border border-lesson-border bg-lesson-bg/60 p-2.5 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                <fieldset
                  id="account-prediction-assessment-group"
                  data-testid="prediction-assessment-fieldset"
                  className="space-y-1.5"
                >
                  <legend className="text-[11px] font-medium text-lesson-text">
                    What would make you reconsider your diagnosis?
                  </legend>
                  <div className="space-y-1.5">
                    {PREDICTION_ASSESSMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`prediction-assessment-${opt.id}`}
                        className={cn(
                          "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all select-none",
                          predictionAssessment === opt.id
                            ? "border-amber-400/60 bg-amber-400/10 font-medium text-lesson-text shadow-sm"
                            : "border-lesson-border/60 bg-lesson-surface/70 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text",
                        )}
                      >
                        <input
                          type="radio"
                          id={`prediction-assessment-${opt.id}`}
                          name="account-prediction-assessment"
                          value={opt.id}
                          checked={predictionAssessment === opt.id}
                          onChange={() => {
                            setPredictionAssessment(opt.id);
                            if (isPredictionRecorded) setIsPredictionRecorded(false);
                          }}
                          className="h-3.5 w-3.5 shrink-0 border-lesson-border text-amber-500 focus:ring-1 focus:ring-amber-400 focus:ring-offset-0"
                        />
                        <span className="text-[11px]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="pt-1">
                  <button
                    type="button"
                    id="record-prediction-action-button"
                    data-testid="record-prediction-action-button"
                    onClick={() => {
                      if (diagnosisPrediction.trim()) {
                        setIsPredictionRecorded(true);
                      }
                    }}
                    disabled={!diagnosisPrediction.trim()}
                    className={cn(
                      "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all shadow-sm select-none",
                      diagnosisPrediction.trim()
                        ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                        : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                    )}
                  >
                    <span>Record prediction</span>
                  </button>
                </div>

                {isPredictionRecorded && (
                  <div className="space-y-1.5 pt-1 border-t border-amber-400/20">
                    <div
                      data-testid="prediction-recorded-status"
                      className="text-[11px] font-medium text-amber-300"
                    >
                      Prediction recorded.
                    </div>
                    <div
                      data-testid="prediction-transition-cue"
                      className="text-[11px] leading-relaxed text-lesson-text-muted"
                    >
                      Your prediction is recorded. Now test it against the system.
                    </div>
                  </div>
                )}
              </fieldset>
            )}

          {/* Intervention Workbench Surface (Change 16) */}
          {hasAttemptedSave &&
            selectedInvestigation &&
            hasInvestigated &&
            hypothesisAssessment &&
            mechanismInvestigation &&
            hasInspectedMechanism &&
            causalInterpretation &&
            isDiagnosisRecorded &&
            isPredictionRecorded && (
              <fieldset
                id="account-intervention-surface"
                data-testid="intervention-surface"
                className="space-y-3 rounded-lg border border-amber-400/50 bg-amber-400/5 p-3 text-xs transition-all"
              >
                <legend className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-lesson-text">
                  <Wrench className="h-3.5 w-3.5 text-amber-400/90" />
                  <span>Intervention Workbench</span>
                </legend>

                {/* Reasoning Context Preservation */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div
                    data-testid="preserved-recorded-diagnosis"
                    className="rounded-md border border-lesson-border/60 bg-lesson-surface/80 p-2.5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-lesson-text uppercase tracking-wider text-[10px]">
                        Your Recorded Diagnosis
                      </span>
                      <span
                        data-testid="preserved-diagnosis-confidence"
                        className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-400/30"
                      >
                        Confidence:{" "}
                        {diagnosisConfidence ? diagnosisConfidence.toUpperCase() : "NONE"}
                      </span>
                    </div>
                    <p
                      data-testid="preserved-diagnosis-statement"
                      className="text-[11px] text-lesson-text-secondary font-mono italic"
                    >
                      "{diagnosisStatement}"
                    </p>
                  </div>

                  <div
                    data-testid="preserved-recorded-prediction"
                    className="rounded-md border border-lesson-border/60 bg-lesson-surface/80 p-2.5 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-lesson-text uppercase tracking-wider text-[10px]">
                        Your Recorded Prediction
                      </span>
                      {predictionAssessment && (
                        <span
                          data-testid="preserved-prediction-assessment"
                          className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-400/30"
                        >
                          Risk: {predictionAssessment}
                        </span>
                      )}
                    </div>
                    <p
                      data-testid="preserved-prediction-statement"
                      className="text-[11px] text-lesson-text-secondary font-mono italic"
                    >
                      "{diagnosisPrediction}"
                    </p>
                  </div>
                </div>

                {/* Instruction & Prompt */}
                <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                  <p className="font-semibold text-lesson-text">
                    Now make one targeted change to the mechanism.
                  </p>
                  <p className="text-[10.5px]">
                    Change one part of the mechanism that you believe is responsible for the
                    failure, based on your diagnosis and prediction.
                  </p>
                </div>

                {/* Editable Mechanism Area */}
                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="account-intervention-mechanism-input"
                    className="block text-[11px] font-medium text-lesson-text"
                  >
                    Targeted Mechanism Intervention
                  </label>
                  <textarea
                    id="account-intervention-mechanism-input"
                    data-testid="intervention-mechanism-input"
                    rows={4}
                    value={interventionCode}
                    onChange={(e) => {
                      setInterventionCode(e.target.value);
                      if (isInterventionApplied) setIsInterventionApplied(false);
                      if (isVerificationRecorded) setIsVerificationRecorded(false);
                      if (isExplanationRecorded) setIsExplanationRecorded(false);
                    }}
                    placeholder="Modify the mechanism code to test your diagnosis..."
                    className="w-full rounded-lg border border-lesson-border bg-lesson-bg/80 p-2.5 font-mono text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    id="apply-intervention-action-button"
                    data-testid="apply-intervention-action-button"
                    onClick={() => {
                      if (interventionCode.trim()) {
                        setIsInterventionApplied(true);
                      }
                    }}
                    disabled={!interventionCode.trim()}
                    className={cn(
                      "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-all shadow-sm select-none",
                      interventionCode.trim()
                        ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                        : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                    )}
                  >
                    <span>Apply Intervention</span>
                  </button>

                  <button
                    type="button"
                    id="reset-intervention-action-button"
                    data-testid="reset-intervention-action-button"
                    onClick={() => {
                      setInterventionCode(DEFAULT_MECHANISM_CODE);
                      setIsInterventionApplied(false);
                      setVerificationComparison(null);
                      setVerificationAssessment(null);
                      setIsVerificationRecorded(false);
                      setIsExplanationRecorded(false);
                    }}
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-lesson-border/60 bg-lesson-surface/70 px-3 py-2 text-xs font-medium text-lesson-text-muted hover:border-lesson-border hover:bg-lesson-surface hover:text-lesson-text transition-all select-none"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Intervention</span>
                  </button>
                </div>

                {/* Consequence & Verification Surface */}
                {isInterventionApplied && (
                  <div className="space-y-3 pt-2 border-t border-amber-400/20">
                    <div className="space-y-1">
                      <div
                        data-testid="intervention-applied-status"
                        className="text-[11px] font-medium text-amber-300"
                      >
                        Intervention applied.
                      </div>
                      <div
                        data-testid="intervention-transition-cue"
                        className="text-[11px] leading-relaxed text-lesson-text-muted"
                      >
                        Observe what changed. Compare the result with your prediction.
                      </div>
                    </div>

                    <div
                      id="account-intervention-consequence-surface"
                      data-testid="intervention-consequence-surface"
                      className="space-y-2.5 rounded-md border border-lesson-border/80 bg-lesson-surface/90 p-3 text-xs"
                    >
                      <div className="text-[11px] font-semibold text-lesson-text uppercase tracking-wider text-[10px] border-b border-lesson-border/40 pb-1">
                        Observed Consequence
                      </div>

                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-lesson-text-muted">
                            Baseline Behavior:{" "}
                          </span>
                          <span
                            data-testid="consequence-baseline-result"
                            className="text-lesson-text-secondary"
                          >
                            Click 'Save changes' → Status remained "No changes saved." (DOM was not
                            updated)
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-lesson-text-muted">
                            Your Intervention:{" "}
                          </span>
                          <pre
                            data-testid="consequence-intervention-summary"
                            className="mt-1 rounded bg-lesson-bg/70 p-1.5 font-mono text-[10.5px] text-lesson-text overflow-x-auto whitespace-pre-wrap"
                          >
                            {interventionCode}
                          </pre>
                        </div>

                        <div>
                          <span className="font-semibold text-lesson-text-muted">
                            Current Result:{" "}
                          </span>
                          <span
                            data-testid="consequence-observed-result"
                            className="text-amber-300/90 font-mono text-[10.5px]"
                          >
                            {isInterventionModified
                              ? "Simulated save execution updated status element to display saved changes."
                              : "Status remains 'No changes saved.' (No DOM status update logic in mechanism)."}
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-lesson-text-muted">
                            Your Recorded Prediction:{" "}
                          </span>
                          <p
                            data-testid="consequence-prediction-comparison"
                            className="mt-0.5 italic text-lesson-text-secondary font-mono text-[10.5px]"
                          >
                            "{diagnosisPrediction}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verification Surface */}
                    <fieldset
                      id="account-verification-surface"
                      data-testid="verification-surface"
                      className="space-y-3 pt-3 border-t border-amber-400/20"
                    >
                      <legend className="text-xs font-semibold text-lesson-text uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                        Verification of the Intervention
                      </legend>

                      <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                        <p className="font-semibold text-lesson-text">
                          Compare what you predicted with what actually happened.
                        </p>
                        <p className="text-[10.5px]">
                          Evaluate whether the observed consequence matches your prediction and
                          decide what this evidence means for your diagnosis.
                        </p>
                      </div>

                      {/* Question 1: Comparison */}
                      <fieldset className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3">
                        <legend className="text-xs font-medium text-lesson-text">
                          Did the observed consequence match your prediction?
                        </legend>
                        <div className="space-y-1.5 pt-1">
                          {VERIFICATION_COMPARISON_OPTIONS.map((opt) => (
                            <label
                              key={opt.id}
                              htmlFor={`verification-comparison-${opt.id}`}
                              className={cn(
                                "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-xs transition-colors",
                                verificationComparison === opt.id
                                  ? "border-amber-400/60 bg-amber-400/10 text-lesson-text font-medium"
                                  : "border-lesson-border/60 bg-lesson-surface/80 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface",
                              )}
                            >
                              <input
                                type="radio"
                                id={`verification-comparison-${opt.id}`}
                                name="verification-comparison"
                                value={opt.id}
                                checked={verificationComparison === opt.id}
                                onChange={() => {
                                  setVerificationComparison(opt.id);
                                  if (isVerificationRecorded) setIsVerificationRecorded(false);
                                  if (isExplanationRecorded) setIsExplanationRecorded(false);
                                }}
                                className="h-4 w-4 accent-amber-400 focus:ring-amber-400/40"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {/* Question 2: Causal Assessment */}
                      <fieldset className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3">
                        <legend className="text-xs font-medium text-lesson-text">
                          What does this result tell you about your diagnosis?
                        </legend>
                        <div className="space-y-1.5 pt-1">
                          {VERIFICATION_ASSESSMENT_OPTIONS.map((opt) => (
                            <label
                              key={opt.id}
                              htmlFor={`verification-assessment-${opt.id}`}
                              className={cn(
                                "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-xs transition-colors",
                                verificationAssessment === opt.id
                                  ? "border-amber-400/60 bg-amber-400/10 text-lesson-text font-medium"
                                  : "border-lesson-border/60 bg-lesson-surface/80 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface",
                              )}
                            >
                              <input
                                type="radio"
                                id={`verification-assessment-${opt.id}`}
                                name="verification-assessment"
                                value={opt.id}
                                checked={verificationAssessment === opt.id}
                                onChange={() => {
                                  setVerificationAssessment(opt.id);
                                  if (isVerificationRecorded) setIsVerificationRecorded(false);
                                  if (isExplanationRecorded) setIsExplanationRecorded(false);
                                }}
                                className="h-4 w-4 accent-amber-400 focus:ring-amber-400/40"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {/* Action Button */}
                      <button
                        type="button"
                        id="record-verification-action-button"
                        data-testid="record-verification-action-button"
                        disabled={!verificationComparison || !verificationAssessment}
                        onClick={() => {
                          if (verificationComparison && verificationAssessment) {
                            setIsVerificationRecorded(true);
                          }
                        }}
                        className={cn(
                          "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all shadow-sm select-none",
                          verificationComparison && verificationAssessment
                            ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                            : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                        )}
                      >
                        <span>Record Verification</span>
                      </button>

                      {/* Status Message when recorded */}
                      {isVerificationRecorded && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1 rounded-md border border-amber-400/30 bg-amber-400/10 p-3">
                            <div
                              data-testid="verification-recorded-status"
                              className="text-xs font-medium text-amber-300"
                            >
                              Verification recorded.
                            </div>
                            <div
                              data-testid="verification-transition-cue"
                              className="text-[11px] leading-relaxed text-lesson-text-secondary"
                            >
                              You compared the predicted and observed consequences and evaluated
                              what this evidence means for your diagnosis.
                            </div>
                          </div>

                          {/* Explanation Surface (Change 18) */}
                          <fieldset
                            id="account-explanation-surface"
                            data-testid="explanation-surface"
                            className="space-y-3 pt-3 border-t border-amber-400/20"
                          >
                            <legend className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-mono text-lesson-text text-[11px]">
                              <FileText className="h-3.5 w-3.5 text-amber-400/90" />
                              <span>Explain What Happened</span>
                            </legend>

                            <div className="space-y-1 text-[11px] leading-relaxed text-lesson-text-muted">
                              <p className="font-medium text-lesson-text">
                                You have gathered evidence, formed a diagnosis, tested an
                                intervention, and compared the result with your prediction.
                              </p>
                              <p className="text-[10.5px]">
                                Now explain the causal chain in your own words. What caused the
                                original behavior, and why did your intervention produce the
                                consequence you observed?
                              </p>
                            </div>

                            {/* Investigation Record Summary */}
                            <div
                              id="account-explanation-investigation-record"
                              data-testid="explanation-investigation-record"
                              className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/80 p-3 text-xs"
                            >
                              <div className="text-[10px] font-semibold text-lesson-text uppercase tracking-wider font-mono border-b border-lesson-border/40 pb-1">
                                Investigation Record
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Observed Behavior:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-observed-behavior"
                                    className="text-lesson-text-secondary"
                                  >
                                    Save Settings indicates saving visually, but status text remains
                                    'Unsaved'.
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Evidence Gathered:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-evidence"
                                    className="text-lesson-text-secondary"
                                  >
                                    {selectedInvestigation
                                      ? INVESTIGATION_TEST_OPTIONS.find(
                                          (o) => o.id === selectedInvestigation,
                                        )?.text
                                      : "DOM & Event Handler evidence gathered"}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Mechanism Inspected:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-mechanism"
                                    className="text-lesson-text-secondary"
                                  >
                                    {mechanismInvestigation
                                      ? MECHANISM_INVESTIGATION_OPTIONS.find(
                                          (o) => o.id === mechanismInvestigation,
                                        )?.text
                                      : "Event handler code inspection"}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Diagnosis:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-diagnosis"
                                    className="text-lesson-text"
                                  >
                                    {causalInterpretation
                                      ? CAUSAL_INTERPRETATION_OPTIONS.find(
                                          (o) => o.id === causalInterpretation,
                                        )?.text
                                      : "Custom diagnosis"}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Prediction:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-prediction"
                                    className="text-lesson-text-secondary font-mono text-[10.5px]"
                                  >
                                    {diagnosisPrediction}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Intervention:{" "}
                                  </span>
                                  <pre
                                    data-testid="explanation-preserved-intervention"
                                    className="mt-0.5 rounded bg-lesson-bg/70 p-1.5 font-mono text-[10px] text-lesson-text overflow-x-auto whitespace-pre-wrap"
                                  >
                                    {interventionCode}
                                  </pre>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Observed Consequence:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-consequence"
                                    className="text-amber-300/90 font-mono text-[10.5px]"
                                  >
                                    {isInterventionModified
                                      ? "Simulated save execution updated status element to display saved changes."
                                      : "Status remains 'No changes saved.'"}
                                  </span>
                                </div>

                                <div>
                                  <span className="font-medium text-lesson-text-muted">
                                    Verification:{" "}
                                  </span>
                                  <span
                                    data-testid="explanation-preserved-verification"
                                    className="text-lesson-text-secondary"
                                  >
                                    Matched:{" "}
                                    {VERIFICATION_COMPARISON_OPTIONS.find(
                                      (o) => o.id === verificationComparison,
                                    )?.label ?? "N/A"}{" "}
                                    | Assessment:{" "}
                                    {VERIFICATION_ASSESSMENT_OPTIONS.find(
                                      (o) => o.id === verificationAssessment,
                                    )?.label ?? "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Prompt & Textarea */}
                            <div className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3">
                              <div className="text-xs font-medium text-lesson-text">
                                Reconstruct the causal chain
                              </div>

                              <ul className="list-disc pl-4 text-[10.5px] leading-relaxed text-lesson-text-muted space-y-0.5">
                                <li>What caused the original behavior in the system?</li>
                                <li>How did your intervention alter the mechanism?</li>
                                <li>Why did the observed consequence occur as a result?</li>
                              </ul>

                              <div className="space-y-1.5 pt-1">
                                <label
                                  htmlFor="account-causal-explanation"
                                  className="block text-xs font-medium text-lesson-text"
                                >
                                  Your explanation
                                </label>
                                <textarea
                                  id="account-causal-explanation"
                                  data-testid="causal-explanation-input"
                                  rows={4}
                                  value={explanation}
                                  aria-describedby="explanation-char-count explanation-guidance-hint"
                                  onChange={(e) => {
                                    setExplanation(e.target.value);
                                    if (isExplanationRecorded) setIsExplanationRecorded(false);
                                    if (isTransferRecorded) setIsTransferRecorded(false);
                                  }}
                                  placeholder="Explain what caused the original behavior, what you changed, and why the intervention produced the consequence you observed..."
                                  className="w-full rounded-lg border border-lesson-border bg-lesson-bg/80 p-2.5 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                                />
                                <div className="flex items-center justify-between text-[10.5px] text-lesson-text-muted">
                                  <span id="explanation-guidance-hint">
                                    Write at least {MIN_EXPLANATION_CHARACTERS} characters to
                                    explain the causal chain.
                                  </span>
                                  <span
                                    id="explanation-char-count"
                                    data-testid="explanation-char-count"
                                    className="font-mono"
                                  >
                                    {explanation.length} characters
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              type="button"
                              id="record-explanation-action-button"
                              data-testid="record-explanation-action-button"
                              disabled={explanation.trim().length < MIN_EXPLANATION_CHARACTERS}
                              onClick={() => {
                                if (explanation.trim().length >= MIN_EXPLANATION_CHARACTERS) {
                                  setIsExplanationRecorded(true);
                                }
                              }}
                              className={cn(
                                "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all shadow-sm select-none",
                                explanation.trim().length >= MIN_EXPLANATION_CHARACTERS
                                  ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                                  : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                              )}
                            >
                              <span>Record Explanation</span>
                            </button>

                            {/* Status Message when explanation recorded */}
                            {isExplanationRecorded && (
                              <div className="space-y-3 pt-2">
                                <div className="space-y-1 rounded-md border border-amber-400/30 bg-amber-400/10 p-3">
                                  <div
                                    data-testid="explanation-recorded-status"
                                    className="text-xs font-medium text-amber-300"
                                  >
                                    Explanation recorded.
                                  </div>
                                  <div
                                    data-testid="explanation-transition-cue"
                                    className="text-[11px] leading-relaxed text-lesson-text-secondary"
                                  >
                                    You have reconstructed the investigation in your own words.
                                  </div>
                                </div>

                                {/* Transfer Surface (Change 19) */}
                                <fieldset
                                  id="account-transfer-surface"
                                  data-testid="transfer-surface"
                                  className="space-y-4 pt-3 border-t border-amber-400/20"
                                >
                                  <legend className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-mono text-lesson-text text-[11px]">
                                    <Search className="h-3.5 w-3.5 text-amber-400/90" />
                                    <span>Transfer — Apply Method to an Unfamiliar System</span>
                                  </legend>

                                  {/* Scenario Description */}
                                  <div
                                    data-testid="transfer-scenario-card"
                                    className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/80 p-3 text-xs"
                                  >
                                    <div className="text-[10px] font-semibold text-lesson-text uppercase tracking-wider font-mono border-b border-lesson-border/40 pb-1">
                                      Scenario: Notification Preferences
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-lesson-text-muted">
                                      A different interface is showing a behavior that does not match what the user expects. You have not seen this system before.
                                    </p>
                                    <div className="rounded border border-lesson-border/60 bg-lesson-bg/90 p-2.5 font-mono text-[10.5px] text-lesson-text-secondary space-y-1">
                                      <div>System: Notification Preferences</div>
                                      <div>Control: Email Notifications [ Toggle Switch ]</div>
                                      <div>Action: "Apply Preferences" button</div>
                                      <div className="text-amber-300/90 font-medium">
                                        Observation: When the switch is toggled and "Apply Preferences" is clicked, the status indicator updates to "Preferences applied", but the toggle switch visually reverts to its previous state.
                                      </div>
                                    </div>
                                  </div>

                                  {/* Step 1: Investigation Approach */}
                                  <fieldset
                                    data-testid="transfer-approach-section"
                                    className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3"
                                  >
                                    <legend className="text-xs font-medium text-lesson-text px-1">
                                      What would you do first?
                                    </legend>
                                    <div className="space-y-1.5">
                                      {TRANSFER_APPROACH_OPTIONS.map((opt) => (
                                        <label
                                          key={opt.id}
                                          htmlFor={`transfer-approach-${opt.id}`}
                                          className={cn(
                                            "flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-md border p-2.5 text-xs transition-colors",
                                            transferApproach === opt.id
                                              ? "border-amber-400/60 bg-amber-400/10 text-lesson-text font-medium"
                                              : "border-lesson-border/60 bg-lesson-surface/80 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface",
                                          )}
                                        >
                                          <input
                                            type="radio"
                                            id={`transfer-approach-${opt.id}`}
                                            name="transfer-approach"
                                            value={opt.id}
                                            data-testid={`transfer-approach-${opt.id}`}
                                            checked={transferApproach === opt.id}
                                            onChange={() => {
                                              setTransferApproach(opt.id);
                                              if (isTransferRecorded) setIsTransferRecorded(false);
                                            }}
                                            className="mt-0.5 h-3.5 w-3.5 accent-amber-400 focus:ring-1 focus:ring-amber-400"
                                          />
                                          <span className="leading-snug">{opt.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </fieldset>

                                  {/* Step 2: Evidence Selection */}
                                  <fieldset
                                    data-testid="transfer-evidence-section"
                                    className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3"
                                  >
                                    <legend className="text-xs font-medium text-lesson-text px-1">
                                      What evidence would you gather before deciding what is wrong?
                                    </legend>
                                    <div className="space-y-1.5">
                                      {TRANSFER_EVIDENCE_OPTIONS.map((opt) => {
                                        const isChecked = transferEvidence.includes(opt.id);
                                        return (
                                          <label
                                            key={opt.id}
                                            htmlFor={`transfer-evidence-${opt.id}`}
                                            className={cn(
                                              "flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-md border p-2.5 text-xs transition-colors",
                                              isChecked
                                                ? "border-amber-400/60 bg-amber-400/10 text-lesson-text font-medium"
                                                : "border-lesson-border/60 bg-lesson-surface/80 text-lesson-text-secondary hover:border-lesson-border hover:bg-lesson-surface",
                                            )}
                                          >
                                            <input
                                              type="checkbox"
                                              id={`transfer-evidence-${opt.id}`}
                                              data-testid={`transfer-evidence-${opt.id}`}
                                              value={opt.id}
                                              checked={isChecked}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setTransferEvidence((prev) => [...prev, opt.id]);
                                                } else {
                                                  setTransferEvidence((prev) =>
                                                    prev.filter((id) => id !== opt.id),
                                                  );
                                                }
                                                if (isTransferRecorded) setIsTransferRecorded(false);
                                              }}
                                              className="mt-0.5 h-3.5 w-3.5 rounded accent-amber-400 focus:ring-1 focus:ring-amber-400"
                                            />
                                            <span className="leading-snug">{opt.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </fieldset>

                                  {/* Step 3: Transfer Hypothesis Textarea */}
                                  <div
                                    data-testid="transfer-hypothesis-section"
                                    className="space-y-2 rounded-lg border border-lesson-border bg-lesson-surface/50 p-3"
                                  >
                                    <label
                                      htmlFor="transfer-hypothesis"
                                      className="block text-xs font-medium text-lesson-text"
                                    >
                                      What do you currently think might explain the behavior?
                                    </label>
                                    <textarea
                                      id="transfer-hypothesis"
                                      data-testid="transfer-hypothesis-input"
                                      rows={3}
                                      value={transferHypothesis}
                                      aria-describedby="transfer-char-count transfer-guidance-hint"
                                      onChange={(e) => {
                                        setTransferHypothesis(e.target.value);
                                        if (isTransferRecorded) setIsTransferRecorded(false);
                                      }}
                                      placeholder="Describe your initial hypothesis about why the toggle switch reverts..."
                                      className="w-full rounded-lg border border-lesson-border bg-lesson-bg/80 p-2.5 text-xs text-lesson-text placeholder-lesson-text-muted/60 transition-colors focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
                                    />
                                    <div className="flex items-center justify-between text-[10.5px] text-lesson-text-muted">
                                      <span id="transfer-guidance-hint">
                                        Write at least {MIN_TRANSFER_HYPOTHESIS_CHARACTERS} characters to state your hypothesis.
                                      </span>
                                      <span
                                        id="transfer-char-count"
                                        data-testid="transfer-char-count"
                                        className="font-mono"
                                      >
                                        {transferHypothesis.length} characters
                                      </span>
                                    </div>
                                  </div>

                                  {/* Record Transfer Action Button */}
                                  <button
                                    type="button"
                                    id="record-transfer-action-button"
                                    data-testid="record-transfer-action-button"
                                    disabled={
                                      transferApproach === null ||
                                      transferEvidence.length === 0 ||
                                      transferHypothesis.trim().length < MIN_TRANSFER_HYPOTHESIS_CHARACTERS
                                    }
                                    onClick={() => {
                                      if (
                                        transferApproach !== null &&
                                        transferEvidence.length > 0 &&
                                        transferHypothesis.trim().length >= MIN_TRANSFER_HYPOTHESIS_CHARACTERS
                                      ) {
                                        setIsTransferRecorded(true);
                                      }
                                    }}
                                    className={cn(
                                      "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all shadow-sm select-none",
                                      transferApproach !== null &&
                                        transferEvidence.length > 0 &&
                                        transferHypothesis.trim().length >= MIN_TRANSFER_HYPOTHESIS_CHARACTERS
                                        ? "cursor-pointer border-amber-400/60 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                                        : "cursor-not-allowed border-lesson-border/40 bg-lesson-surface/40 text-lesson-text-muted/50",
                                    )}
                                  >
                                    <span>Record Transfer Reasoning</span>
                                  </button>

                                  {/* Status Message when transfer recorded */}
                                  {isTransferRecorded && (
                                    <div
                                      data-testid="transfer-status-message"
                                      className="space-y-1 rounded-md border border-amber-400/30 bg-amber-400/10 p-3"
                                    >
                                      <div
                                        data-testid="transfer-recorded-status"
                                        className="text-xs font-medium text-amber-300"
                                      >
                                        Transfer reasoning recorded.
                                      </div>
                                      <div
                                        data-testid="transfer-transition-cue"
                                        className="text-[11px] leading-relaxed text-lesson-text-secondary"
                                      >
                                        You have applied the investigation method to a new system.
                                      </div>
                                    </div>
                                  )}
                                </fieldset>
                              </div>
                            )}
                          </fieldset>
                        </div>
                      )}
                    </fieldset>
                  </div>
                )}
              </fieldset>
            )}
        </div>
      </form>
    </div>
  );
}
