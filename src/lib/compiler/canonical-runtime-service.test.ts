import { describe, expect, it } from "vitest";
import { canonicalRuntimeError, createCanonicalValidationSpec, type RuntimeSourceActivity } from "./canonical-runtime-service";

describe("canonical runtime error handling", () => {
  it("converts an iframe runtime error into a terminal failed validation result", () => {
    const { report, result } = canonicalRuntimeError(
      "act-runtime",
      "ReferenceError: missingFn is not defined",
    );

    expect(report.status).toBe("failed");
    expect(report.results[0]?.errorMessage).toContain("missingFn is not defined");
    expect(result.isValid).toBe(false);
    expect(result.feedbackMessage).toContain("missingFn is not defined");
    expect(result.details).toMatchObject({
      failedAssertions: [{ id: "runtime-error" }],
    });
  });
});

/**
 * Regression coverage for the HTML interactive-code assertion parser fix
 * found during runtime verification (see
 * FORGE_HTML_RUNTIME_VERIFICATION_REPORT.md). Before this fix:
 *  - `querySelectorAll(...)` never matched the selector-extraction regex at
 *    all (it required `querySelector(` immediately), so any
 *    querySelectorAll-based assertion silently fell back to checking that
 *    "body" exists — which is always true, i.e. the test could never fail.
 *  - Every other assertion detail (`.textContent`, `.length`,
 *    `.getAttribute(...)`, and — most seriously — a `=== null` check,
 *    whose whole point is the *opposite* of existence) was discarded,
 *    always compiling down to a plain `{ exists: true }` check regardless
 *    of what the author actually wrote.
 * These tests pin the fixed behavior directly, not just "it doesn't
 * throw" — each asserts the exact target/expected shape produced.
 */
function htmlActivity(assertion: string): RuntimeSourceActivity {
  return {
    id: "act-test",
    type: "interactive-code",
    content: {
      language: "html",
      starterCode: "<div></div>",
      testCases: [{ id: "t1", description: "test", assertion }],
    },
  };
}

describe("createCanonicalValidationSpec — HTML assertion parsing", () => {
  it("extracts the selector from a plain querySelector existence check", () => {
    const spec = createCanonicalValidationSpec(htmlActivity("document.querySelector('section > h2') !== null"));
    expect(spec.assertions[0]).toMatchObject({ target: "section > h2", expected: { exists: true } });
  });

  it("extracts a count check from querySelectorAll (previously always fell back to checking 'body')", () => {
    const spec = createCanonicalValidationSpec(
      htmlActivity("document.querySelectorAll('section > ul > li').length === 1"),
    );
    expect(spec.assertions[0]).toMatchObject({ target: "section > ul > li", expected: { count: 1 } });
  });

  it("extracts an exact-text check from a textContent comparison (previously discarded, degrading to bare existence)", () => {
    const spec = createCanonicalValidationSpec(
      htmlActivity("document.querySelector('h1')?.textContent.trim() === 'Weeknight Chili'"),
    );
    expect(spec.assertions[0]).toMatchObject({ target: "h1", expected: { textExact: "Weeknight Chili" } });
  });

  it("extracts an attribute-value check from getAttribute (previously discarded entirely)", () => {
    const spec = createCanonicalValidationSpec(
      htmlActivity("document.querySelector('a')?.getAttribute('href') === 'https://example.com'"),
    );
    expect(spec.assertions[0]).toMatchObject({
      target: "a",
      expected: { attributes: { href: "https://example.com" } },
    });
  });

  it("correctly inverts a '=== null' assertion to exists:false (previously compiled to exists:true — the opposite of what the author wrote)", () => {
    const spec = createCanonicalValidationSpec(htmlActivity("document.querySelector('h4, h5, h6') === null"));
    expect(spec.assertions[0]).toMatchObject({ target: "h4, h5, h6", expected: { exists: false } });
  });
});
