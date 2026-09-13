import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { PredictionSurface } from "@/components/lesson/canonical/primitives/prediction-surface";
import type { PredictionContentV1 } from "@/lib/curriculum/v1/content-schemas";
import type { V1ActivityRendererProps } from "./types";

export interface PredictionRendererProps extends V1ActivityRendererProps<string> {
  title: string;
  instruction?: string;
  content: PredictionContentV1;
}

/**
 * Renders a V1 `prediction` activity — "commit to a hypothesis before seeing
 * the consequence" (see the task's explicit instruction not to merge this
 * into multiple-choice at the renderer level, even though the adapter uses
 * MultipleChoiceActivity for session/evidence bookkeeping purposes — see
 * ../../../lib/curriculum/v1/adapter.ts's module doc).
 *
 * Purely reports the learner's selection via `onResponse`; grading and
 * "Continue" happen in the V1 player's footer, matching Layer 1's
 * ActivityActions convention that primary actions live in the persistent
 * footer, not in individual renderers.
 */
export function PredictionRenderer({
  state,
  onResponse,
  readOnly,
  title,
  instruction,
  content,
}: PredictionRendererProps) {
  const [freeformNote, setFreeformNote] = useState("");
  const selectedOptionId = state.response;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-lesson-text-primary">{title}</h2>
        {instruction && <p className="text-sm text-lesson-text-secondary">{instruction}</p>}
      </div>
      <PredictionSurface
        title="Commit to a hypothesis"
        icon={<HelpCircle className="h-3.5 w-3.5 text-amber-400/90" />}
        prompt={instruction}
        inputLabel="Reasoning (optional)"
        value={freeformNote}
        onChange={setFreeformNote}
        options={content.options.map((opt) => ({ id: opt.id, label: opt.text }))}
        optionsLegend="Pick the option you believe is correct"
        selectedOptionId={selectedOptionId ?? null}
        onSelectOption={(id) => !readOnly && onResponse(id)}
        recordDisabled={!selectedOptionId || readOnly}
        isRecorded={state.status !== "idle" && Boolean(selectedOptionId)}
        recordLabel="Record prediction"
        onRecord={() => {
          /* Selection already reported via onSelectOption; this button is a
             deliberate, low-stakes commitment beat before the player's
             "Check Answer" action grades it. */
        }}
        recordedStatus="Prediction recorded — check it when you're ready."
      />
    </div>
  );
}
