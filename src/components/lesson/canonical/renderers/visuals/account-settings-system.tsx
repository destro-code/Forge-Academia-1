import React, { useState } from "react";
import { User, Mail, ShieldAlert, Laptop, Code2, Search, HelpCircle, Eye } from "lucide-react";
import type { ExperienceComposition } from "../../experience/experience-types";
import { cn } from "@/lib/utils";

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
  | "handler-executes-no-status-update"
  | "status-updated-elsewhere-unreflected"
  | "insufficient-evidence"
  | "need-further-inspection";

export const CAUSAL_INTERPRETATION_OPTIONS = [
  {
    id: "handler-executes-no-status-update",
    text: "The interaction reaches the handler, but the visible status does not change as a consequence of that execution path.",
  },
  {
    id: "status-updated-elsewhere-unreflected",
    text: "The status changes elsewhere, but the inspected element does not reflect that change.",
  },
  {
    id: "insufficient-evidence",
    text: "The evidence is not yet sufficient to isolate the exact causal mechanism.",
  },
  {
    id: "need-further-inspection",
    text: "I need to inspect another part of the system before deciding.",
  },
] as const;

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
  const [causalInterpretation, setCausalInterpretation] = useState<string | null>(null);

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
        </div>
      </form>
    </div>
  );
}
