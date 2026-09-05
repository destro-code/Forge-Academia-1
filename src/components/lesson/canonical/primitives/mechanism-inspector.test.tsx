// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  MechanismInspector,
  type MechanismInspection,
  type MechanismInspectorProps,
} from "./mechanism-inspector";

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

describe("MechanismInspector — Canonical UI Primitive", () => {
  // Test A — renders target
  it("Test A: renders target mechanism correctly", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Custom DOM Event Target"
        observed={["Event dispatched on window"]}
        evidence="The custom event was observed on the root context."
      />,
    );
    try {
      const targetEl = container.querySelector('[data-testid="mechanism-inspection-target"]');
      expect(targetEl).not.toBeNull();
      expect(targetEl?.textContent).toBe("Custom DOM Event Target");
    } finally {
      cleanup();
    }
  });

  // Test B — renders observed facts
  it("Test B: renders all supplied observed facts", () => {
    const observations = [
      "Handler registered on form submission",
      "Event.preventDefault() invoked",
      "Network payload formatted as JSON",
    ];

    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Form Submission Pipeline"
        observed={observations}
        evidence="The form halts default navigation and builds JSON payload."
      />,
    );
    try {
      const listEl = container.querySelector('[data-testid="mechanism-inspection-observed-list"]');
      expect(listEl).not.toBeNull();

      const items = listEl?.querySelectorAll("li");
      expect(items?.length).toBe(3);
      expect(items?.[0]?.textContent).toBe(observations[0]);
      expect(items?.[1]?.textContent).toBe(observations[1]);
      expect(items?.[2]?.textContent).toBe(observations[2]);
    } finally {
      cleanup();
    }
  });

  // Test C — preserves observation order
  it("Test C: preserves exact order of supplied observations", () => {
    const orderedSteps = [
      "Step 1: Parse request body",
      "Step 2: Check authentication token",
      "Step 3: Query database",
      "Step 4: Serialize response",
    ];

    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Request Lifecycle"
        observed={orderedSteps}
        evidence="Pipeline executes sequentially through 4 distinct phases."
      />,
    );
    try {
      const listEl = container.querySelector('[data-testid="mechanism-inspection-observed-list"]');
      const items = Array.from(listEl?.querySelectorAll("li") ?? []).map((li) => li.textContent);
      expect(items).toEqual(orderedSteps);
    } finally {
      cleanup();
    }
  });

  // Test D — renders evidence
  it("Test D: renders evidence statement exactly as supplied", () => {
    const evidenceText =
      "The layout engine calculated zero height because container position is absolute without offset anchors.";

    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="CSS Box Dimensions"
        observed={["height: auto", "position: absolute"]}
        evidence={evidenceText}
      />,
    );
    try {
      const evidenceEl = container.querySelector('[data-testid="mechanism-inspection-evidence"]');
      expect(evidenceEl).not.toBeNull();
      expect(evidenceEl?.textContent).toBe(evidenceText);
    } finally {
      cleanup();
    }
  });

  // Test E — generic data unrelated to Account Settings
  it("Test E: operates cleanly on generic data completely unrelated to Account Settings", () => {
    const flexboxData: MechanismInspection = {
      target: "Flexbox alignment mechanism",
      observed: [
        "display: flex",
        "justify-content: center",
        "align-items: stretch",
        "flex-direction: row",
      ],
      evidence:
        "The container distributes children according to the configured flex alignment rules.",
    };

    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target={flexboxData.target}
        observed={flexboxData.observed}
        evidence={flexboxData.evidence}
        title="CSS LAYOUT MECHANISM"
      />,
    );
    try {
      const targetEl = container.querySelector('[data-testid="mechanism-inspection-target"]');
      const evidenceEl = container.querySelector('[data-testid="mechanism-inspection-evidence"]');

      expect(targetEl?.textContent).toBe("Flexbox alignment mechanism");
      expect(evidenceEl?.textContent).toBe(
        "The container distributes children according to the configured flex alignment rules.",
      );
      expect(container.textContent).toContain("CSS LAYOUT MECHANISM");
      expect(container.textContent).not.toContain("Account");
      expect(container.textContent).not.toContain("Save Changes");
      expect(container.textContent).not.toContain("Notification Preferences");
    } finally {
      cleanup();
    }
  });

  // Test F — no diagnosis generation
  it("Test F: does not introduce root-cause conclusions or diagnoses that were not supplied", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Memory Allocator"
        observed={["Heap capacity: 512MB", "Used heap: 120MB"]}
        evidence="Heap utilization is well within allocated boundaries."
      />,
    );
    try {
      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("root cause");
      expect(text).not.toContain("the bug is");
      expect(text).not.toContain("faulty");
      expect(text).not.toContain("diagnosis:");
      expect(text).not.toContain("incorrect implementation");
    } finally {
      cleanup();
    }
  });

  // Test G — no correctness or evaluation UI
  it("Test G: renders no pass/fail, score, correctness, or grading indicators", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Cache Subsystem"
        observed={["Cache hit ratio: 0.94", "Eviction count: 12"]}
        evidence="High cache hit efficiency detected."
      />,
    );
    try {
      expect(container.querySelector('[data-testid="correctness-badge"]')).toBeNull();
      expect(container.querySelector('[data-testid="score-display"]')).toBeNull();
      expect(container.querySelector('[data-testid="validation-feedback"]')).toBeNull();

      const text = container.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("score:");
      expect(text).not.toContain("correct!");
      expect(text).not.toContain("incorrect!");
      expect(text).not.toContain("passed");
      expect(text).not.toContain("failed");
    } finally {
      cleanup();
    }
  });

  // Test H — no runtime execution
  it("Test H: performs no runtime execution, creates no sandbox/iframe, and runs no script", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Worker Thread Script"
        observed={['postMessage({ action: "compute" })', "onmessage listener active"]}
        evidence="Message channel established with worker."
      />,
    );
    try {
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector('[data-testid="sandbox-host"]')).toBeNull();
    } finally {
      cleanup();
    }
  });

  // Test I — semantic & accessibility structure
  it("Test I: renders semantic accessible list elements and distinct labels", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        id="test-inspection-surface"
        target="Timer Dispatch"
        observed={["setInterval set to 1000ms", "clearInterval invoked on unmount"]}
        evidence="Timer teardown safely terminates interval."
      />,
    );
    try {
      const surface = container.querySelector(
        '[data-testid="mechanism-inspection-result-surface"]',
      );
      expect(surface?.getAttribute("id")).toBe("test-inspection-surface");

      const list = container.querySelector('[data-testid="mechanism-inspection-observed-list"]');
      expect(list?.tagName).toBe("UL");
      expect(list?.children.length).toBe(2);
      expect(list?.children[0].tagName).toBe("LI");
      expect(list?.children[1].tagName).toBe("LI");
    } finally {
      cleanup();
    }
  });

  // Test J — deterministic output
  it("Test J: produces identical rendered DOM given identical props", () => {
    const props: MechanismInspectorProps = {
      target: "State Transition Table",
      observed: ["idle -> loading", "loading -> success"],
      evidence: "State machine transitions deterministically.",
      density: "spacious",
      title: "STATE INSPECTION",
    };

    const { container: container1, cleanup: cleanup1 } = renderComponent(
      <MechanismInspector {...props} />,
    );
    const { container: container2, cleanup: cleanup2 } = renderComponent(
      <MechanismInspector {...props} />,
    );
    try {
      expect(container1.innerHTML).toBe(container2.innerHTML);
    } finally {
      cleanup1();
      cleanup2();
    }
  });

  // Test K — presentation configuration (density, labels, test IDs, icons)
  it("Test K: respects customizable density, custom labels, custom title, and custom test ID", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Audio Context"
        observed={['state === "suspended"']}
        evidence="Audio context requires user gesture to resume."
        density="compact"
        title="AUDIO ENGINE INSPECTION"
        targetLabel="Inspected Subsystem: "
        observedLabel="Diagnostic Facts:"
        evidenceLabel="Verified Finding: "
        data-testid="custom-inspector-surface"
        className="custom-border-class"
      />,
    );
    try {
      const surface = container.querySelector('[data-testid="custom-inspector-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.className).toContain("p-2");
      expect(surface?.className).toContain("custom-border-class");

      expect(container.textContent).toContain("Inspected Subsystem: ");
      expect(container.textContent).toContain("Diagnostic Facts:");
      expect(container.textContent).toContain("Verified Finding: ");
      expect(container.textContent).toContain("AUDIO ENGINE INSPECTION");
    } finally {
      cleanup();
    }
  });

  // Test L — returns null when empty
  it("Test L: returns null gracefully when target, observed, and evidence are empty", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector target="" observed={[]} evidence="" />,
    );
    try {
      expect(
        container.querySelector('[data-testid="mechanism-inspection-result-surface"]'),
      ).toBeNull();
    } finally {
      cleanup();
    }
  });

  // Test M — renders custom icon or hides title/icon when null
  it("Test M: allows hiding or customizing icon and title", () => {
    const { container, cleanup } = renderComponent(
      <MechanismInspector
        target="Null Heading Target"
        observed={["Observed item"]}
        evidence="Evidence item"
        title={null}
        icon={null}
      />,
    );
    try {
      expect(container.textContent).not.toContain("MECHANISM INSPECTION");
      expect(container.querySelector("svg")).toBeNull();
      expect(container.textContent).toContain("Null Heading Target");
    } finally {
      cleanup();
    }
  });
});
