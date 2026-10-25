import type {
  Project,
  ProjectMilestone,
  ProjectTask,
  ValidationAssertion,
} from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";
import { buildProjectWorkspaceFiles } from "@/lib/project-workspace-templates";
import { requestPlaygroundValidation } from "@/lib/compiler/validation-client";

export interface TaskVerificationCheckResult {
  taskId: string;
  milestoneId: string;
  title: string;
  passed: boolean;
  checkedAt: string;
  criteriaChecked: string[];
  failedReasons: string[];
}

export interface MilestoneVerificationReport {
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  passedCount: number;
  totalTasks: number;
  allPassed: boolean;
  checkedAt: string;
  workspaceHash?: string;
  taskResults: Record<string, TaskVerificationCheckResult>;
}

const PROJECT_VERIFICATION_REPORT_PREFIX = "forge_project_verification_report_";

export function computeWorkspaceFilesHash(files: PlaygroundFile[]): string {
  const combined = files
    .map((f) => `${f.name}:${(f.code || "").trim()}`)
    .sort()
    .join("|");
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 33) ^ combined.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

interface CriterionAssertion {
  label: string;
  test: (ctx: {
    html: string;
    css: string;
    js: string;
    allCode: string;
    userAddedCode: string;
    doc: Document | null;
  }) => boolean;
  failureHint: string;
}

function evaluateStructuredAssertionStatically(
  assertion: ValidationAssertion,
  ctx: {
    html: string;
    css: string;
    js: string;
    allCode: string;
    doc: Document | null;
  },
): boolean {
  if (assertion.type === "dom_query" && ctx.doc) {
    const selector = assertion.selector || "body";
    let elements: Element[] = [];
    try {
      elements = Array.from(ctx.doc.querySelectorAll(selector));
    } catch {
      return false;
    }
    const mode = assertion.assertion || "exists";
    const expected = assertion.expected;
    switch (mode) {
      case "exists":
        return expected === false ? elements.length === 0 : elements.length > 0;
      case "not_exists":
        return elements.length === 0;
      case "count":
      case "count_equals":
        return elements.length === Number(expected);
      case "count_at_least":
        return elements.length >= Number(expected);
      case "text_contains": {
        const needle = String(expected ?? "").toLowerCase();
        return elements.some((el) =>
          (el.textContent || "").toLowerCase().includes(needle),
        );
      }
      case "has_attribute": {
        const attrName = assertion.attribute || String(expected ?? "");
        return elements.some((el) => el.hasAttribute(attrName));
      }
      default:
        return elements.length > 0;
    }
  }

  if (assertion.type === "source_ast_check") {
    const pattern = assertion.pattern || "";
    if (!pattern) return false;
    const target = (assertion.targetFile || "").toLowerCase();
    const sourceToCheck = target.endsWith(".css")
      ? ctx.css
      : target.endsWith(".html")
        ? ctx.html
        : target.endsWith(".js") || target.endsWith(".ts")
          ? ctx.js
          : ctx.allCode;
    try {
      return new RegExp(pattern, "i").test(sourceToCheck);
    } catch {
      return sourceToCheck.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  if (assertion.type === "js_evaluation") {
    const expr = assertion.expression || "";
    // Check common CSS custom property or computed style expressions statically when running without iframe
    const rootVarMatches = Array.from(expr.matchAll(/['"](--[a-z0-9-]+)['"]/gi)).map(
      (m) => m[1],
    );
    if (rootVarMatches.length > 0) {
      return rootVarMatches.every((varName) =>
        new RegExp(`${varName}\\s*:\\s*[^;\\s}]+`, "i").test(ctx.css || ctx.allCode),
      );
    }
    if (expr.includes("alt") && ctx.doc) {
      const img = ctx.doc.querySelector("header img, img");
      const alt = img?.getAttribute("alt")?.trim() ?? "";
      return alt.length >= 3;
    }
    if (expr.includes("aria-label") && ctx.doc) {
      const nav = ctx.doc.querySelector("nav");
      const label = nav?.getAttribute("aria-label")?.trim() ?? "";
      return label.length > 0;
    }
    if (expr.includes("flexDirection === 'column'")) {
      return (
        /display\s*:\s*flex/i.test(ctx.css) &&
        /flex-direction\s*:\s*column/i.test(ctx.css) &&
        /gap\s*:\s*\d+/i.test(ctx.css)
      );
    }
    if (expr.includes("boxSizing === 'border-box'")) {
      return (
        /box-sizing\s*:\s*border-box/i.test(ctx.css) &&
        /padding\s*:\s*(2\d|[3-9]\d)px/i.test(ctx.css) &&
        /border\s*:\s*1px/i.test(ctx.css)
      );
    }
    if (expr.includes(".cta-button") && expr.includes("backgroundColor")) {
      return (
        /\.cta-button\s*\{[\s\S]*?background(?:-color)?\s*:\s*(?!transparent)[^;]+;/i.test(
          ctx.css,
        ) &&
        /\.cta-button\s*\{[\s\S]*?padding\s*:\s*[^;]+;/i.test(ctx.css)
      );
    }
    if (expr.includes("cs.display === 'grid'")) {
      return /display\s*:\s*grid/i.test(ctx.css) && /gap\s*:\s*(1[2-9]|[2-9]\d)px/i.test(ctx.css);
    }
    if (expr.includes("justifyContent === 'space-between'")) {
      return (
        /display\s*:\s*flex/i.test(ctx.css) &&
        /justify-content\s*:\s*space-between/i.test(ctx.css)
      );
    }
    if (expr.includes("label[for=")) {
      if (!ctx.doc) return false;
      const input = ctx.doc.querySelector("input[id]");
      if (!input) return false;
      const label = ctx.doc.querySelector(`label[for="${input.id}"]`);
      const btn = ctx.doc.querySelector("button");
      return Boolean(label && btn);
    }
  }

  return false;
}

/**
 * Derives concrete, task-specific acceptance assertions from a task's `validationSpec`
 * or structural HTML/CSS/JS requirements. Never falls back to character-count or title-word gaming.
 */
export function buildTaskAcceptanceAssertions(
  task: ProjectTask,
  _milestone: ProjectMilestone,
): CriterionAssertion[] {
  if (task.validationSpec && task.validationSpec.assertions.length > 0) {
    return task.validationSpec.assertions.map((a) => ({
      label: a.label || a.description || a.id,
      test: (ctx) => evaluateStructuredAssertionStatically(a, ctx),
      failureHint:
        a.errorMessage ||
        a.hint ||
        `Requirement not met: ${a.label || a.description || a.id}`,
    }));
  }

  const specText = `${task.title} ${task.description || ""} ${(task.hints || []).join(" ")}`.toLowerCase();
  const assertions: CriterionAssertion[] = [];

  const tagMatches = Array.from(specText.matchAll(/<([a-z][a-z0-9-]*)[^>]*>/g)).map(
    (m) => m[1],
  );
  const uniqueTags = Array.from(new Set(tagMatches));

  for (const tag of uniqueTags) {
    if (tag === "header" && specText.includes("alt")) {
      assertions.push({
        label: `Includes <img ... alt="..."> inside <header>`,
        test: ({ html }) => /<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/i.test(html),
        failureHint: `Add an <img> element with a descriptive non-empty alt="..." attribute in your <header>.`,
      });
      continue;
    }
    assertions.push({
      label: `Renders semantic <${tag}> element`,
      test: ({ allCode }) => new RegExp(`<${tag}\\b`, "i").test(allCode),
      failureHint: `Include the <${tag}> element in your markup as required by "${task.title}".`,
    });
  }

  if (specText.includes("aria-label")) {
    assertions.push({
      label: `Includes aria-label attribute on landmark/control`,
      test: ({ allCode }) => /\baria-label\s*=\s*["'][^"']+["']/i.test(allCode),
      failureHint: `Add a descriptive aria-label="..." attribute (e.g. <nav aria-label="Social links">).`,
    });
  }

  const cssVarMatches = Array.from(specText.matchAll(/(--[a-z0-9-]+)/g)).map((m) => m[1]);
  const uniqueCssVars = Array.from(new Set(cssVarMatches));
  for (const cssVar of uniqueCssVars) {
    assertions.push({
      label: `Defines CSS custom property ${cssVar}`,
      test: ({ css, allCode }) =>
        new RegExp(`${cssVar}\\s*:\\s*[^;\\s}]+`, "i").test(css || allCode),
      failureHint: `Define the ${cssVar} custom property on :root in your stylesheet.`,
    });
  }

  if (specText.includes("flex-direction: column") || specText.includes("stack link")) {
    assertions.push({
      label: `Uses flex-direction: column with gap spacing`,
      test: ({ css, allCode }) =>
        /flex-direction\s*:\s*column/i.test(css || allCode) &&
        /\bgap\s*:/i.test(css || allCode),
      failureHint: `Apply display: flex, flex-direction: column, and gap in your CSS rules.`,
    });
  } else if (specText.includes("display: grid") || specText.includes("css grid") || specText.includes("bento grid") || specText.includes("column grid")) {
    assertions.push({
      label: `Uses CSS Grid layout (grid-template-columns or grid classes)`,
      test: ({ css, allCode }) =>
        /grid-template-columns/i.test(css || allCode) || /grid-cols-/i.test(allCode),
      failureHint: `Configure a CSS Grid layout using grid-template-columns.`,
    });
  }

  if (specText.includes(":focus-visible") || specText.includes("focus-visible")) {
    assertions.push({
      label: `Defines :focus-visible keyboard focus styling`,
      test: ({ css, allCode }) => /:focus-visible\b/i.test(css || allCode),
      failureHint: `Add a :focus-visible selector in your stylesheet so keyboard users see a clear focus ring.`,
    });
  }

  // Require real structural AST/DOM constructs (functions, event listeners, state handlers, interfaces)
  if (assertions.length === 0) {
    assertions.push({
      label: `Implements executable logic or structural markup for "${task.title}"`,
      test: ({ userAddedCode, js, html, css }) => {
        const cleanUser = userAddedCode
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
          .replace(/<!--[\s\S]*?-->/g, "")
          .trim();
        if (cleanUser.length < 20) return false;
        const hasExecutableJs =
          /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|addEventListener\s*\(|querySelector|createElement|fetch\s*\(|interface\s+\w+|type\s+\w+\s*=)/i.test(
            cleanUser,
          ) && js.trim().length > 0;
        const hasStructuredHtmlOrCss =
          /<(?:header|nav|main|section|article|footer|form|dialog|table|ul|dl)\b/i.test(
            cleanUser,
          ) ||
          /[.#a-z0-9_-]+\s*\{[^}]*:[a-z0-9#(),.\s-]+/i.test(cleanUser);
        return Boolean(hasExecutableJs || (hasStructuredHtmlOrCss && (html.length > 0 || css.length > 0)));
      },
      failureHint: `Write the working HTML, CSS, or JavaScript implementation for "${task.title}" (comments or plain text strings do not pass verification).`,
    });
  }

  return assertions;
}

/**
 * Evaluates a single project task against the learner's workspace files.
 */
export function verifyProjectTaskAgainstFiles(
  task: ProjectTask,
  milestone: ProjectMilestone,
  project: Project,
  files: PlaygroundFile[],
): TaskVerificationCheckResult {
  const starter = buildProjectWorkspaceFiles(project, milestone.id, task.id);
  const starterByName = new Map(starter.files.map((f) => [f.name, f.code.trim()]));

  const html = files
    .filter((f) => f.language === "html" || f.name.endsWith(".html"))
    .map((f) => f.code || "")
    .join("\n");
  const css = files
    .filter((f) => f.language === "css" || f.name.endsWith(".css"))
    .map((f) => f.code || "")
    .join("\n");
  const js = files
    .filter(
      (f) =>
        f.language === "javascript" ||
        f.language === "typescript" ||
        /\.(js|ts|jsx|tsx)$/.test(f.name),
    )
    .map((f) => f.code || "")
    .join("\n");
  const allCode = files.map((f) => f.code || "").join("\n");

  const userAddedLines: string[] = [];
  for (const file of files) {
    const baseline = starterByName.get(file.name) || "";
    const baselineLines = new Set(
      baseline
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    );
    for (const line of (file.code || "").split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !baselineLines.has(trimmed)) {
        userAddedLines.push(trimmed);
      }
    }
  }
  const userAddedCode = userAddedLines.join("\n");

  let doc: Document | null = null;
  if (typeof DOMParser !== "undefined" && html.trim().length > 0) {
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch {
      doc = null;
    }
  }

  const assertions = buildTaskAcceptanceAssertions(task, milestone);
  const criteriaChecked: string[] = [];
  const failedReasons: string[] = [];

  if (userAddedCode.trim().length === 0) {
    return {
      taskId: task.id,
      milestoneId: milestone.id,
      title: task.title,
      passed: false,
      checkedAt: new Date().toISOString(),
      criteriaChecked: assertions.map((a) => a.label),
      failedReasons: [
        "Starter template is unmodified. Write your implementation in index.html, styles.css, or app.js before verifying.",
      ],
    };
  }

  for (const assertion of assertions) {
    criteriaChecked.push(assertion.label);
    const ok = assertion.test({ html, css, js, allCode, userAddedCode, doc });
    if (!ok) {
      failedReasons.push(assertion.failureHint);
    }
  }

  return {
    taskId: task.id,
    milestoneId: milestone.id,
    title: task.title,
    passed: failedReasons.length === 0 && criteriaChecked.length > 0,
    checkedAt: new Date().toISOString(),
    criteriaChecked,
    failedReasons,
  };
}

/**
 * Verifies all tasks in a specific milestone against the learner's workspace files
 * and persists the detailed verification report to localStorage.
 */
export function verifyProjectMilestone(
  milestone: ProjectMilestone,
  project: Project,
  files: PlaygroundFile[],
): MilestoneVerificationReport {
  const tasks = milestone.tasks || [];
  const taskResults: Record<string, TaskVerificationCheckResult> = {};
  let passedCount = 0;

  for (const task of tasks) {
    const res = verifyProjectTaskAgainstFiles(task, milestone, project, files);
    taskResults[task.id] = res;
    if (res.passed) {
      passedCount += 1;
    }
  }

  const report: MilestoneVerificationReport = {
    projectId: project.id,
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    passedCount,
    totalTasks: tasks.length,
    allPassed: tasks.length > 0 && passedCount === tasks.length,
    checkedAt: new Date().toISOString(),
    workspaceHash: computeWorkspaceFilesHash(files),
    taskResults,
  };

  saveProjectVerificationReport(project.id, report);
  return report;
}

/**
 * Executes live iframe runtime validation (DOM queries, computed styles, JS evaluations,
 * and interactive click/submit/setValue actions) when the Playground preview iframe is mounted,
 * combining those results with source AST checks for each task in the milestone.
 */
export async function verifyProjectMilestoneInRuntime(
  milestone: ProjectMilestone,
  project: Project,
  files: PlaygroundFile[],
): Promise<MilestoneVerificationReport> {
  const baseReport = verifyProjectMilestone(milestone, project, files);
  if (typeof document === "undefined") {
    return baseReport;
  }

  const iframe = document.querySelector<HTMLIFrameElement>(
    "iframe[title='Forge Playground Live Preview']",
  );
  if (!iframe || !iframe.contentWindow) {
    return baseReport;
  }

  const tasks = milestone.tasks || [];
  const taskResults: Record<string, TaskVerificationCheckResult> = {
    ...baseReport.taskResults,
  };
  let passedCount = 0;

  for (const task of tasks) {
    const staticResult = baseReport.taskResults[task.id];
    // If starter template is completely unmodified, keep the unmodified failure
    if (
      staticResult &&
      !staticResult.passed &&
      staticResult.failedReasons.some((r) => r.includes("Starter template is unmodified"))
    ) {
      taskResults[task.id] = staticResult;
      continue;
    }

    if (task.validationSpec && task.validationSpec.assertions.length > 0) {
      const runtimeAssertions = task.validationSpec.assertions.filter(
        (a) => a.type !== "source_ast_check",
      );
      const sourceAssertions = task.validationSpec.assertions.filter(
        (a) => a.type === "source_ast_check",
      );

      const criteriaChecked: string[] = [];
      const failedReasons: string[] = [];

      // Check source_ast_check assertions against files
      if (sourceAssertions.length > 0) {
        const html = files
          .filter((f) => f.language === "html" || f.name.endsWith(".html"))
          .map((f) => f.code || "")
          .join("\n");
        const css = files
          .filter((f) => f.language === "css" || f.name.endsWith(".css"))
          .map((f) => f.code || "")
          .join("\n");
        const js = files
          .filter((f) => f.language === "javascript" || f.name.endsWith(".js"))
          .map((f) => f.code || "")
          .join("\n");
        const allCode = files.map((f) => f.code || "").join("\n");

        for (const sa of sourceAssertions) {
          const label = sa.label || sa.description || sa.id;
          criteriaChecked.push(label);
          const ok = evaluateStructuredAssertionStatically(sa, {
            html,
            css,
            js,
            allCode,
            doc: null,
          });
          if (!ok) {
            failedReasons.push(
              sa.errorMessage || sa.hint || `Missing required source pattern: ${label}`,
            );
          }
        }
      }

      if (runtimeAssertions.length > 0) {
        try {
          const runtimeReport = await requestPlaygroundValidation(
            `${project.id}:${milestone.id}:${task.id}`,
            {
              ...task.validationSpec,
              assertions: runtimeAssertions,
            },
            5000,
          );
          for (const res of runtimeReport.results) {
            criteriaChecked.push(res.description);
            if (res.status !== "passed") {
              failedReasons.push(
                res.errorMessage || `Check failed: ${res.description}`,
              );
            }
          }
        } catch (err) {
          failedReasons.push(
            err instanceof Error ? err.message : "Runtime iframe verification failed.",
          );
        }
      }

      const passed = failedReasons.length === 0 && criteriaChecked.length > 0;
      taskResults[task.id] = {
        taskId: task.id,
        milestoneId: milestone.id,
        title: task.title,
        passed,
        checkedAt: new Date().toISOString(),
        criteriaChecked,
        failedReasons,
      };
      if (passed) passedCount += 1;
    } else {
      if (staticResult?.passed) passedCount += 1;
    }
  }

  const finalReport: MilestoneVerificationReport = {
    projectId: project.id,
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    passedCount,
    totalTasks: tasks.length,
    allPassed: tasks.length > 0 && passedCount === tasks.length,
    checkedAt: new Date().toISOString(),
    workspaceHash: computeWorkspaceFilesHash(files),
    taskResults,
  };

  saveProjectVerificationReport(project.id, finalReport);
  return finalReport;
}

export function saveProjectVerificationReport(
  projectId: string,
  milestoneReport: MilestoneVerificationReport,
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getProjectVerificationReports(projectId);
    existing[milestoneReport.milestoneId] = milestoneReport;
    window.localStorage.setItem(
      `${PROJECT_VERIFICATION_REPORT_PREFIX}${projectId}`,
      JSON.stringify(existing),
    );
  } catch {
    // Ignore storage errors
  }
}

export function getProjectVerificationReports(
  projectId: string,
): Record<string, MilestoneVerificationReport> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(
      `${PROJECT_VERIFICATION_REPORT_PREFIX}${projectId}`,
    );
    return raw ? (JSON.parse(raw) as Record<string, MilestoneVerificationReport>) : {};
  } catch {
    return {};
  }
}

export function clearProjectVerificationReports(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${PROJECT_VERIFICATION_REPORT_PREFIX}${projectId}`);
  } catch {
    // Ignore storage errors
  }
}
