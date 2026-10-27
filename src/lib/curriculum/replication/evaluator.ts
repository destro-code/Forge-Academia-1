import type {
  EvaluationResult,
  EvaluationSummary,
  ProhibitedPattern,
  ReplicateThisActivityContent,
  StructuralRule,
  StyleRule,
} from "./types";

/**
 * Normalizes CSS property names to kebab-case for getPropertyValue.
 */
function toKebabCase(prop: string): string {
  return prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Normalizes CSS property names to camelCase for direct style access.
 */
function toCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
}

/**
 * Normalizes CSS values for resilient comparison.
 * Collapses whitespace, removes quotes, lowercases, and normalizes colors.
 */
function normalizeCssValue(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ");
}

/**
 * Resilient headless DOM and computed CSS evaluator for the "Replicate This" activity engine.
 * Validates structural invariants and computed styles without relying on brittle pixel-diffing.
 */
export class ReplicationEvaluator {
  /**
   * Evaluates a user DOM Document against the activity's declarative rules.
   */
  public static evaluate(
    userDoc: Document,
    content: ReplicateThisActivityContent,
  ): EvaluationSummary {
    const evaluator = new ReplicationEvaluator();
    return evaluator.evaluate(userDoc, content);
  }

  public evaluate(userDoc: Document, content: ReplicateThisActivityContent): EvaluationSummary {
    const results: EvaluationResult[] = [];

    if (!userDoc) {
      return {
        isFullyReplicated: false,
        passCount: 0,
        totalCount: 1,
        results: [
          {
            ruleId: "document-missing",
            category: "structure",
            description: "Render document must exist",
            passed: false,
            feedback: "Unable to inspect rendered document. Ensure preview loaded successfully.",
          },
        ],
      };
    }

    const { structuralRules, styleRules, prohibitedPatterns } = content.evaluation;

    // 1. Evaluate Structural Rules
    for (const rule of structuralRules) {
      results.push(this.evaluateStructuralRule(userDoc, rule));
    }

    // 2. Evaluate Style Rules
    for (const rule of styleRules) {
      results.push(this.evaluateStyleRule(userDoc, rule));
    }

    // 3. Evaluate Prohibited Patterns
    if (prohibitedPatterns && prohibitedPatterns.length > 0) {
      for (const pattern of prohibitedPatterns) {
        results.push(this.evaluateProhibitedPattern(userDoc, pattern));
      }
    }

    const passCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const isFullyReplicated = totalCount > 0 && passCount === totalCount;

    return {
      isFullyReplicated,
      passCount,
      totalCount,
      results,
    };
  }

  /**
   * Tests DOM AST invariants: selector cardinality, text content, and forbidden ancestors.
   */
  private evaluateStructuralRule(userDoc: Document, rule: StructuralRule): EvaluationResult {
    try {
      const elements = Array.from(userDoc.querySelectorAll(rule.selector));
      const count = elements.length;

      // Check minCount constraint
      if (rule.minCount !== undefined && count < rule.minCount) {
        return {
          ruleId: rule.id,
          category: "structure",
          description: rule.description,
          passed: false,
          feedback: `${rule.feedbackOnFail} (Found ${count}, expected at least ${rule.minCount})`,
        };
      }

      // Check expectedCount constraint (defaults to 1 if neither expectedCount nor minCount was specified)
      const expected =
        rule.expectedCount !== undefined
          ? rule.expectedCount
          : rule.minCount === undefined
            ? 1
            : undefined;
      if (expected !== undefined && count !== expected) {
        return {
          ruleId: rule.id,
          category: "structure",
          description: rule.description,
          passed: false,
          feedback: `${rule.feedbackOnFail} (Found ${count} matching element${count === 1 ? "" : "s"}, expected ${expected})`,
        };
      }

      // Check mustContainText constraint
      if (rule.mustContainText) {
        const needle = rule.mustContainText.trim().toLowerCase();
        const hasText = elements.some((el) =>
          (el.textContent || "").toLowerCase().includes(needle),
        );
        if (!hasText) {
          return {
            ruleId: rule.id,
            category: "structure",
            description: rule.description,
            passed: false,
            feedback: `${rule.feedbackOnFail} (Expected element to contain text "${rule.mustContainText}")`,
          };
        }
      }

      // Check forbiddenParent constraint
      if (rule.forbiddenParent) {
        for (const el of elements) {
          if (el.closest(rule.forbiddenParent)) {
            return {
              ruleId: rule.id,
              category: "structure",
              description: rule.description,
              passed: false,
              feedback: `${rule.feedbackOnFail} (Element must not be nested inside "${rule.forbiddenParent}")`,
            };
          }
        }
      }

      return {
        ruleId: rule.id,
        category: "structure",
        description: rule.description,
        passed: true,
        feedback: "Structure matches specification.",
      };
    } catch (err) {
      return {
        ruleId: rule.id,
        category: "structure",
        description: rule.description,
        passed: false,
        feedback: `Error evaluating selector "${rule.selector}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  /**
   * Tests computed styles for target elements against expected values or numeric ranges.
   */
  private evaluateStyleRule(userDoc: Document, rule: StyleRule): EvaluationResult {
    try {
      const element = userDoc.querySelector(rule.selector);
      if (!element) {
        return {
          ruleId: rule.id,
          category: "style",
          description: rule.description,
          passed: false,
          feedback: `${rule.feedbackOnFail} (Element matching "${rule.selector}" not found in DOM)`,
        };
      }

      const win = userDoc.defaultView;
      let computedVal = "";

      if (win && typeof win.getComputedStyle === "function") {
        const computed = win.getComputedStyle(element);
        const kebab = toKebabCase(rule.property);
        const camel = toCamelCase(rule.property);
        computedVal =
          computed.getPropertyValue(kebab) || (computed as Record<string, any>)[camel] || "";
      }

      if (!computedVal) {
        // Fallback for detached DOMParser documents or environments where stylesheet layout is not attached
        const kebab = toKebabCase(rule.property);
        computedVal =
          (element as HTMLElement).style?.getPropertyValue(kebab) ||
          this.lookupStylesheetProperty(userDoc, element, kebab);
      }

      const normalizedComputed = normalizeCssValue(computedVal);

      // 1. Numeric Range Comparison
      if (rule.numericRange) {
        const { min, max, unit } = rule.numericRange;
        const parsed = parseFloat(computedVal);

        if (isNaN(parsed)) {
          return {
            ruleId: rule.id,
            category: "style",
            description: rule.description,
            passed: false,
            feedback: `${rule.feedbackOnFail} (Could not parse numeric value from "${computedVal}")`,
          };
        }

        // When comparing px/rem in browser, computed styles are usually resolved to px.
        // If the rule specifies rem, 1rem = 16px default root unless converted.
        let compareVal = parsed;
        if (unit === "rem" && computedVal.endsWith("px")) {
          compareVal = parsed / 16;
        }

        const inRange = compareVal >= min && compareVal <= max;
        if (!inRange) {
          return {
            ruleId: rule.id,
            category: "style",
            description: rule.description,
            passed: false,
            feedback: `${rule.feedbackOnFail} (Resolved ${parsed}${unit}, expected between ${min}${unit} and ${max}${unit})`,
          };
        }
      }

      // 2. Expected Value Comparison
      if (rule.expectedValue !== undefined) {
        const expectedList = Array.isArray(rule.expectedValue)
          ? rule.expectedValue
          : [rule.expectedValue];

        const matches = expectedList.some((expected) => {
          const normExp = normalizeCssValue(expected);
          if (normalizedComputed === normExp) return true;
          // Single-track "1fr" must not substring-match multi-column "repeat(3, 1fr)" or "1fr 1fr"
          if (normExp === "1fr") {
            return normalizedComputed === "1fr";
          }
          // Resilient color & flex value matching
          if (
            normExp === "flex" &&
            (normalizedComputed === "flex" || normalizedComputed.includes("flex"))
          )
            return true;
          if (
            normExp === "grid" &&
            (normalizedComputed === "grid" || normalizedComputed.includes("grid"))
          )
            return true;
          return normalizedComputed.includes(normExp);
        });

        if (!matches) {
          const displayExpected = expectedList.join(" or ");
          return {
            ruleId: rule.id,
            category: "style",
            description: rule.description,
            passed: false,
            feedback: `${rule.feedbackOnFail} (Computed "${computedVal}", expected "${displayExpected}")`,
          };
        }
      }

      return {
        ruleId: rule.id,
        category: "style",
        description: rule.description,
        passed: true,
        feedback: "Style matches specification.",
      };
    } catch (err) {
      return {
        ruleId: rule.id,
        category: "style",
        description: rule.description,
        passed: false,
        feedback: `Error evaluating style on "${rule.selector}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  /**
   * Resolves a CSS property from <style> tags in userDoc for an element when
   * evaluating a detached DOMParser document (evaluates @media max-width against 360px stage).
   */
  private lookupStylesheetProperty(
    userDoc: Document,
    element: Element,
    kebabProperty: string,
  ): string {
    const styleEls = Array.from(userDoc.querySelectorAll("style"));
    const rawCss = styleEls
      .map((s) => s.textContent || "")
      .join("\n")
      .replace(/\/\*[\s\S]*?\*\//g, "");

    let resolved = "";
    const applyDecls = (selectorText: string, declBlock: string) => {
      const selectors = selectorText.split(",").map((s) => s.trim());
      for (const sel of selectors) {
        if (!sel) continue;
        try {
          if (element.matches(sel)) {
            for (const stmt of declBlock.split(";")) {
              const colonIdx = stmt.indexOf(":");
              if (colonIdx !== -1) {
                const prop = stmt.slice(0, colonIdx).trim().toLowerCase();
                const val = stmt.slice(colonIdx + 1).trim();
                if (prop === kebabProperty && val) {
                  resolved = val;
                }
              }
            }
          }
        } catch {
          // Ignore invalid selector syntax
        }
      }
    };

    // Separate @media blocks from top-level rules so top-level applies first, then matching @media overrides
    let topLevelCss = "";
    const activeMediaBlocks: string[] = [];
    let cursor = 0;
    while (cursor < rawCss.length) {
      const mediaIdx = rawCss.indexOf("@media", cursor);
      if (mediaIdx === -1) {
        topLevelCss += rawCss.slice(cursor);
        break;
      }
      topLevelCss += rawCss.slice(cursor, mediaIdx);
      const openBrace = rawCss.indexOf("{", mediaIdx);
      if (openBrace === -1) break;
      const mediaCondition = rawCss.slice(mediaIdx, openBrace);
      let depth = 1;
      let i = openBrace + 1;
      while (i < rawCss.length && depth > 0) {
        if (rawCss[i] === "{") depth++;
        else if (rawCss[i] === "}") depth--;
        i++;
      }
      const inner = rawCss.slice(openBrace + 1, i - 1);
      const maxWidthMatch = mediaCondition.match(/max-width\s*:\s*(\d+)px/i);
      const minWidthMatch = mediaCondition.match(/min-width\s*:\s*(\d+)px/i);
      const stageWidth = 360;
      const matchesMax = maxWidthMatch ? stageWidth <= Number(maxWidthMatch[1]) : true;
      const matchesMin = minWidthMatch ? stageWidth >= Number(minWidthMatch[1]) : true;
      if (matchesMax && matchesMin) {
        activeMediaBlocks.push(inner);
      }
      cursor = i;
    }

    const ruleRegex = /([^{]+)\{([^}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRegex.exec(topLevelCss)) !== null) {
      applyDecls(m[1].trim(), m[2].trim());
    }
    for (const block of activeMediaBlocks) {
      const innerRegex = /([^{]+)\{([^}]*)\}/g;
      let im: RegExpExecArray | null;
      while ((im = innerRegex.exec(block)) !== null) {
        applyDecls(im[1].trim(), im[2].trim());
      }
    }

    return resolved;
  }

  /**
   * Tests for anti-patterns and prohibited techniques.
   */
  private evaluateProhibitedPattern(
    userDoc: Document,
    pattern: ProhibitedPattern,
  ): EvaluationResult {
    try {
      switch (pattern.rule) {
        case "no-inline-styles": {
          const body = userDoc.body || userDoc.documentElement;
          const inlineEls = Array.from(body.querySelectorAll("[style]")).filter(
            (el) => el.getAttribute("style")?.trim() !== "",
          );

          if (inlineEls.length > 0) {
            const sampleTag = inlineEls[0].tagName.toLowerCase();
            return {
              ruleId: pattern.id,
              category: "engineering",
              description: "No inline styles allowed",
              passed: false,
              feedback: `${pattern.feedbackOnFail} (Found style attribute on <${sampleTag}>)`,
            };
          }
          return {
            ruleId: pattern.id,
            category: "engineering",
            description: "No inline styles detected",
            passed: true,
            feedback: "Clean CSS architecture: no inline style attributes detected.",
          };
        }

        case "no-absolute-position-hacks": {
          const body = userDoc.body || userDoc.documentElement;
          const win = userDoc.defaultView || (typeof window !== "undefined" ? window : null);
          const allEls = Array.from(body.querySelectorAll("*"));

          for (const el of allEls) {
            // Ignore scripts, styles, svg defs
            if (["script", "style", "svg", "path", "defs"].includes(el.tagName.toLowerCase())) {
              continue;
            }
            let position = "";
            if (win && typeof win.getComputedStyle === "function") {
              position = win.getComputedStyle(el).position;
            } else {
              position = (el as HTMLElement).style?.position || "";
            }

            if (position === "absolute" || position === "fixed") {
              return {
                ruleId: pattern.id,
                category: "engineering",
                description: "No absolute positioning hacks",
                passed: false,
                feedback: `${pattern.feedbackOnFail} (Found position: ${position} on <${el.tagName.toLowerCase()}>)`,
              };
            }
          }

          return {
            ruleId: pattern.id,
            category: "engineering",
            description: "No absolute positioning hacks detected",
            passed: true,
            feedback: "Robust document flow: no absolute positioning hacks used.",
          };
        }

        case "semantic-elements-only": {
          const body = userDoc.body || userDoc.documentElement;
          const elements = Array.from(body.querySelectorAll("*"));
          const interactiveClickables = elements.filter((el) => {
            const role = el.getAttribute("role");
            const hasOnClick =
              el.hasAttribute("onclick") || el.getAttribute("class")?.includes("btn");
            return hasOnClick || role === "button";
          });

          for (const el of interactiveClickables) {
            if (el.tagName.toLowerCase() === "div" || el.tagName.toLowerCase() === "span") {
              return {
                ruleId: pattern.id,
                category: "engineering",
                description: "Use semantic elements",
                passed: false,
                feedback: `${pattern.feedbackOnFail} (Found clickable <${el.tagName.toLowerCase()}> instead of semantic <button>)`,
              };
            }
          }

          return {
            ruleId: pattern.id,
            category: "engineering",
            description: "Semantic elements verified",
            passed: true,
            feedback: "Semantic HTML standards respected.",
          };
        }

        default:
          return {
            ruleId: pattern.id,
            category: "engineering",
            description: "Prohibited pattern check",
            passed: true,
            feedback: "Pass.",
          };
      }
    } catch (err) {
      return {
        ruleId: pattern.id,
        category: "engineering",
        description: "Pattern validation error",
        passed: false,
        feedback: `Error evaluating pattern "${pattern.rule}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}
