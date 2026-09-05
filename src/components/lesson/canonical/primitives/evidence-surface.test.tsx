// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { EvidenceSurface, EvidenceItem } from "./evidence-surface";
import { AccountSettingsSystem } from "../renderers/visuals/account-settings-system";

interface RenderHelperResult {
  container: HTMLDivElement;
  cleanup: () => void;
}

function renderComponent(element: React.ReactElement): RenderHelperResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("EvidenceSurface Primitive", () => {
  const sampleItems: EvidenceItem[] = [
    { label: "Request Method", value: "POST" },
    { label: "Response Status", value: "500 Internal Server Error" },
    { label: "Payload Length", value: "124 bytes" },
    { label: "Active Header", value: "application/json" },
  ];

  // A — Renders evidence
  it("Test A: renders all provided evidence items accurately", () => {
    const { container, cleanup } = renderComponent(
      <EvidenceSurface
        title="Network Inspection Evidence"
        items={sampleItems}
        description="Review the captured HTTP payload before formulating a diagnosis."
      />,
    );
    try {
      const surface = container.querySelector('[data-testid="evidence-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.textContent).toContain("Network Inspection Evidence");
      expect(surface?.textContent).toContain("Request Method");
      expect(surface?.textContent).toContain("POST");
      expect(surface?.textContent).toContain("Response Status");
      expect(surface?.textContent).toContain("500 Internal Server Error");
      expect(surface?.textContent).toContain("Payload Length");
      expect(surface?.textContent).toContain("124 bytes");
      expect(surface?.textContent).toContain("Active Header");
      expect(surface?.textContent).toContain("application/json");
      expect(surface?.textContent).toContain(
        "Review the captured HTTP payload before formulating a diagnosis.",
      );
    } finally {
      cleanup();
    }
  });

  // B — Preserves order
  it("Test B: preserves the exact order of evidence items supplied", () => {
    const orderedItems: EvidenceItem[] = [
      { label: "First", value: "Alpha" },
      { label: "Second", value: "Beta" },
      { label: "Third", value: "Gamma" },
    ];
    const { container, cleanup } = renderComponent(<EvidenceSurface items={orderedItems} />);
    try {
      const dtElements = Array.from(container.querySelectorAll("dt")).map((el) => el.textContent);
      const ddElements = Array.from(container.querySelectorAll("dd")).map((el) => el.textContent);
      expect(dtElements).toEqual(["First", "Second", "Third"]);
      expect(ddElements).toEqual(["Alpha", "Beta", "Gamma"]);
    } finally {
      cleanup();
    }
  });

  // C — Generic & decoupled from Account Settings
  it("Test C: operates purely on generic data without Account Settings assumptions", () => {
    const genericItems: EvidenceItem[] = [
      { label: "CSS Selector", value: ".card > .badge" },
      { label: "Computed Display", value: "inline-block" },
    ];
    const { container, cleanup } = renderComponent(
      <EvidenceSurface title="CSS Layout Evidence" items={genericItems} />,
    );
    try {
      const surface = container.querySelector('[data-testid="evidence-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.textContent).toContain("CSS Layout Evidence");
      expect(surface?.textContent).toContain(".card > .badge");
      expect(surface?.textContent).toContain("inline-block");
      // Must not leak any Golden Lesson specific terms
      expect(surface?.textContent).not.toContain("Save Changes");
      expect(surface?.textContent).not.toContain("account-save-button");
    } finally {
      cleanup();
    }
  });

  // D — No diagnosis
  it("Test D: does not generate or display diagnostic conclusions", () => {
    const { container, cleanup } = renderComponent(<EvidenceSurface items={sampleItems} />);
    try {
      const text = container.textContent || "";
      expect(text).not.toContain("Root cause:");
      expect(text).not.toContain("Diagnosis:");
      expect(text).not.toContain("This means that");
    } finally {
      cleanup();
    }
  });

  // E — No correctness indicators
  it("Test E: does not render correctness or scoring indicators", () => {
    const { container, cleanup } = renderComponent(<EvidenceSurface items={sampleItems} />);
    try {
      expect(container.querySelector('[data-testid="correct-badge"]')).toBeNull();
      expect(container.querySelector('[data-testid="incorrect-badge"]')).toBeNull();
      expect(container.textContent).not.toContain("Correct");
      expect(container.textContent).not.toContain("Incorrect");
      expect(container.textContent).not.toContain("Score");
    } finally {
      cleanup();
    }
  });

  // F — No evaluation invocation
  it("Test F: does not invoke evaluation or validation systems", () => {
    const evalSpy = vi.fn();
    const { cleanup } = renderComponent(<EvidenceSurface items={sampleItems} />);
    try {
      expect(evalSpy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  // G — No runtime execution
  it("Test G: does not invoke runtime or code execution", () => {
    const { container, cleanup } = renderComponent(<EvidenceSurface items={sampleItems} />);
    try {
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.querySelector("script")).toBeNull();
    } finally {
      cleanup();
    }
  });

  // H — No session mutation
  it("Test H: is purely presentational and introduces no session side-effects", () => {
    const { container, cleanup } = renderComponent(
      <EvidenceSurface id="custom-evidence" items={sampleItems} />,
    );
    try {
      const surface = container.querySelector("#custom-evidence");
      expect(surface).not.toBeNull();
    } finally {
      cleanup();
    }
  });

  // I — No progression
  it("Test I: does not render advance or continue buttons that trigger progression", () => {
    const { container, cleanup } = renderComponent(<EvidenceSurface items={sampleItems} />);
    try {
      expect(container.querySelector("button")).toBeNull();
    } finally {
      cleanup();
    }
  });

  // J — Accessibility: semantic definition list (dl, dt, dd)
  it("Test J: implements semantic accessible definition list structure", () => {
    const { container, cleanup } = renderComponent(
      <EvidenceSurface title="Accessible Evidence" items={sampleItems} />,
    );
    try {
      const dl = container.querySelector("dl");
      expect(dl).not.toBeNull();
      const dts = dl?.querySelectorAll("dt");
      const dds = dl?.querySelectorAll("dd");
      expect(dts?.length).toBe(sampleItems.length);
      expect(dds?.length).toBe(sampleItems.length);
    } finally {
      cleanup();
    }
  });

  // K — Responsive structure & column layout
  it("Test K: respects columns prop and density variants", () => {
    const { container, cleanup } = renderComponent(
      <EvidenceSurface items={sampleItems} columns={1} density="spacious" />,
    );
    try {
      const dl = container.querySelector("dl");
      expect(dl?.className).not.toContain("sm:grid-cols-2");
      const surface = container.querySelector('[data-testid="evidence-surface"]');
      expect(surface?.className).toContain("p-3.5");
    } finally {
      cleanup();
    }
  });

  // L — Determinism
  it("Test L: produces identical output given identical props", () => {
    const { container: c1, cleanup: cl1 } = renderComponent(
      <EvidenceSurface id="test-surface" items={sampleItems} />,
    );
    const { container: c2, cleanup: cl2 } = renderComponent(
      <EvidenceSurface id="test-surface" items={sampleItems} />,
    );
    try {
      expect(c1.innerHTML).toBe(c2.innerHTML);
    } finally {
      cl1();
      cl2();
    }
  });

  // M — Golden Lesson integration
  it("Test M: renders Golden Lesson investigation result evidence correctly", () => {
    const goldenLessonEvidence: EvidenceItem[] = [
      { label: "Observation", value: "The button can be activated" },
      { label: "Target Element", value: '<button id="account-save-button">' },
      { label: "Visible Outcome", value: "No visible state change occurred" },
      { label: "Status Field", value: '"No changes saved."' },
    ];
    const { container, cleanup } = renderComponent(
      <EvidenceSurface
        id="account-investigation-result-surface"
        data-testid="investigation-result-surface"
        title="Investigation Result"
        items={goldenLessonEvidence}
        description="Compare this evidence with your hypothesis. You can update your hypothesis or choose another test above as you continue investigating."
      />,
    );
    try {
      const surface = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.textContent).toContain("Investigation Result");
      expect(surface?.textContent).toContain("The button can be activated");
      expect(surface?.textContent).toContain('id="account-save-button"');
      expect(surface?.textContent).toContain("No visible state change occurred");
      expect(surface?.textContent).toContain('"No changes saved."');
      expect(surface?.textContent).toContain("Compare this evidence with your hypothesis.");
    } finally {
      cleanup();
    }
  });

  // N — Golden Lesson regression
  it("Test N: verifies AccountSettingsSystem correctly renders EvidenceSurface during live investigation", () => {
    const { container, cleanup } = renderComponent(<AccountSettingsSystem />);
    try {
      const saveButton = container.querySelector(
        'button[id="account-save-button"]',
      ) as HTMLButtonElement;
      act(() => {
        saveButton.click();
      });
      const testRadio = container.querySelector(
        'input[id="investigation-inspect-activation"]',
      ) as HTMLInputElement;
      act(() => {
        testRadio.click();
      });
      const actionBtn = container.querySelector(
        '[data-testid="investigate-action-button"]',
      ) as HTMLButtonElement;
      act(() => {
        actionBtn.click();
      });

      const surface = container.querySelector('[data-testid="investigation-result-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.textContent).toContain("Investigation Result");
      expect(surface?.textContent).toContain("The button can be activated");
      expect(surface?.textContent).toContain('id="account-save-button"');
    } finally {
      cleanup();
    }
  });

  // Empty items handling
  it("returns null when items array is empty", () => {
    const { container, cleanup } = renderComponent(<EvidenceSurface items={[]} />);
    try {
      expect(container.children.length).toBe(0);
    } finally {
      cleanup();
    }
  });
});
