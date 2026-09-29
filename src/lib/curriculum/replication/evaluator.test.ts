// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { ReplicationEvaluator } from "./evaluator";
import type { ReplicateThisActivityContent } from "./types";
import { replicateThisActivityContentSchema } from "./types";

describe("Replication Engine - Schemas and Evaluator", () => {
  const sampleContent: ReplicateThisActivityContent = {
    stage: "constrained",
    prompt: "Replicate a profile card with an avatar and username",
    target: {
      html: `<div class="card"><img src="avatar.png" alt="Avatar" class="avatar"><h2>Jane Doe</h2></div>`,
      css: `.card { display: flex; padding: 16px; background-color: rgb(20, 20, 20); }`,
      viewportHeight: 360,
    },
    workspace: {
      starterHtml: `<div class="card"></div>`,
      starterCss: `.card { }`,
    },
    evaluation: {
      structuralRules: [
        {
          id: "card-exists",
          description: "Card container must exist",
          selector: ".card",
          expectedCount: 1,
          feedbackOnFail: "A container with class 'card' is required",
        },
        {
          id: "avatar-img",
          description: "Card must contain an avatar image",
          selector: ".card img.avatar",
          expectedCount: 1,
          feedbackOnFail: "Add an image with class 'avatar' inside .card",
        },
        {
          id: "name-heading",
          description: "Must contain user name heading",
          selector: "h2",
          mustContainText: "Jane Doe",
          feedbackOnFail: "Heading must contain 'Jane Doe'",
        },
      ],
      styleRules: [
        {
          id: "card-flex",
          description: "Card should use flex layout",
          selector: ".card",
          property: "display",
          expectedValue: "flex",
          feedbackOnFail: "Set display: flex on .card",
        },
        {
          id: "card-padding",
          description: "Card padding should be 16px",
          selector: ".card",
          property: "padding",
          numericRange: {
            min: 12,
            max: 20,
            unit: "px",
          },
          feedbackOnFail: "Card padding should be approximately 16px",
        },
      ],
      prohibitedPatterns: [
        {
          id: "no-inline",
          rule: "no-inline-styles",
          feedbackOnFail: "Do not use inline style attributes",
        },
        {
          id: "no-absolute",
          rule: "no-absolute-position-hacks",
          feedbackOnFail: "Do not use absolute positioning hacks",
        },
      ],
    },
  };

  it("validates content schema correctly", () => {
    const parseResult = replicateThisActivityContentSchema.safeParse(sampleContent);
    expect(parseResult.success).toBe(true);
  });

  it("evaluates matching DOM AST as fully replicated", () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<!DOCTYPE html>
      <html>
        <head>
          <style>
            .card { display: flex; padding: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <img class="avatar" src="avatar.png" alt="Avatar" />
            <h2>Jane Doe</h2>
          </div>
        </body>
      </html>`,
      "text/html",
    );

    // Mock getComputedStyle for jsdom environment
    const origGetComputedStyle = doc.defaultView?.getComputedStyle;
    if (doc.defaultView) {
      doc.defaultView.getComputedStyle = (el: Element) => {
        if (el.classList.contains("card")) {
          return {
            getPropertyValue: (prop: string) => {
              if (prop === "display") return "flex";
              if (prop === "padding") return "16px";
              if (prop === "position") return "static";
              return "";
            },
            display: "flex",
            padding: "16px",
            position: "static",
          } as any;
        }
        return {
          getPropertyValue: (prop: string) => (prop === "position" ? "static" : ""),
          position: "static",
        } as any;
      };
    }

    const summary = ReplicationEvaluator.evaluate(doc, sampleContent);
    expect(summary.totalCount).toBe(7);
    expect(summary.passCount).toBe(7);
    expect(summary.isFullyReplicated).toBe(true);

    if (doc.defaultView && origGetComputedStyle) {
      doc.defaultView.getComputedStyle = origGetComputedStyle;
    }
  });

  it("fails when structural requirements are missing", () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<!DOCTYPE html><html><body><div class="card"></div></body></html>`,
      "text/html",
    );

    const summary = ReplicationEvaluator.evaluate(doc, sampleContent);
    expect(summary.isFullyReplicated).toBe(false);

    const avatarResult = summary.results.find((r) => r.ruleId === "avatar-img");
    expect(avatarResult?.passed).toBe(false);
  });

  it("detects and rejects prohibited inline styles", () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<!DOCTYPE html><html><body><div class="card" style="color: red;"><img class="avatar" /><h2>Jane Doe</h2></div></body></html>`,
      "text/html",
    );

    const summary = ReplicationEvaluator.evaluate(doc, sampleContent);
    const inlineResult = summary.results.find((r) => r.ruleId === "no-inline");
    expect(inlineResult?.passed).toBe(false);
    expect(inlineResult?.feedback).toContain("Do not use inline style attributes");
  });
});
