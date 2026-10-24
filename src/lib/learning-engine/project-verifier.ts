import type { Project, ProjectMilestone, ProjectTask } from "@/lib/types";
import type { PlaygroundFile } from "@/lib/types/playground";
import { buildProjectWorkspaceFiles } from "@/lib/project-workspace-templates";

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
  taskResults: Record<string, TaskVerificationCheckResult>;
}

const PROJECT_VERIFICATION_REPORT_PREFIX = "forge_project_verification_report_";

interface CriterionAssertion {
  label: string;
  test: (ctx: {
    html: string;
    css: string;
    js: string;
    allCode: string;
    userAddedCode: string;
  }) => boolean;
  failureHint: string;
}

/**
 * Derives concrete, task-specific acceptance assertions from a task's specification
 * so each task is verified against its own acceptance criteria and one passing check
 * can never verify unrelated tasks.
 */
export function buildTaskAcceptanceAssertions(
  task: ProjectTask,
  milestone: ProjectMilestone,
): CriterionAssertion[] {
  const specText = `${task.title} ${task.description} ${(task.hints || []).join(" ")}`.toLowerCase();
  const assertions: CriterionAssertion[] = [];

  // 1. HTML landmark / element checks mentioned in the task
  const tagMatches = Array.from(specText.matchAll(/<([a-z][a-z0-9-]*)[^>]*>/g)).map(
    (m) => m[1],
  );
  const uniqueTags = Array.from(new Set(tagMatches));

  for (const tag of uniqueTags) {
    if (tag === "header" || tag === "main" || tag === "h1") {
      // Starter template already includes <main>, <header>, <h1>; require user enhancement or specific attributes
      if (tag === "header" && specText.includes("alt")) {
        assertions.push({
          label: `Includes <img ... alt="..."> inside <header>`,
          test: ({ html }) =>
            /<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/i.test(html),
          failureHint: `Add an <img> element with a descriptive non-empty alt="..." attribute in your header.`,
        });
      }
      continue;
    }
    assertions.push({
      label: `Renders semantic <${tag}> element`,
      test: ({ allCode }) => new RegExp(`<${tag}\\b`, "i").test(allCode),
      failureHint: `Include the <${tag}> element in your markup as required by "${task.title}".`,
    });
  }

  // Specific attribute checks
  if (specText.includes("aria-label")) {
    assertions.push({
      label: `Includes aria-label attribute on landmark/control`,
      test: ({ allCode }) => /\baria-label\s*=\s*["'][^"']+["']/i.test(allCode),
      failureHint: `Add a descriptive aria-label="..." attribute (e.g. <nav aria-label="Social links">).`,
    });
  }

  if (specText.includes("alt text") || specText.includes("alt=")) {
    assertions.push({
      label: `Includes image with descriptive alt text`,
      test: ({ allCode }) => /<img\b[^>]*\balt\s*=\s*["'][^"']+["']/i.test(allCode),
      failureHint: `Include an <img> tag with a non-empty alt="..." attribute.`,
    });
  }

  // 2. CSS custom properties / variables checks
  const cssVarMatches = Array.from(specText.matchAll(/(--[a-z0-9-]+)/g)).map((m) => m[1]);
  const uniqueCssVars = Array.from(new Set(cssVarMatches));
  if (uniqueCssVars.length > 0) {
    for (const cssVar of uniqueCssVars) {
      assertions.push({
        label: `Defines CSS custom property ${cssVar}`,
        test: ({ css, allCode }) =>
          css.includes(cssVar) || allCode.includes(cssVar),
        failureHint: `Define the ${cssVar} custom property on :root in your stylesheet.`,
      });
    }
  } else if (
    specText.includes("custom propert") ||
    specText.includes("css variable") ||
    specText.includes(":root")
  ) {
    assertions.push({
      label: `Defines :root CSS custom properties (--*)`,
      test: ({ css, allCode }) =>
        /:root\s*\{[\s\S]*?--[a-z0-9-]+\s*:/i.test(css) ||
        /--[a-z0-9-]+\s*:\s*[^;]+;/i.test(allCode),
      failureHint: `Define CSS custom properties (e.g. :root { --bg: ...; --accent: ...; }) in your CSS.`,
    });
  }

  // 3. Flexbox / Grid layout checks
  if (specText.includes("flex-direction: column") || specText.includes("stack link")) {
    assertions.push({
      label: `Uses flex-direction: column with gap spacing`,
      test: ({ css, allCode }) =>
        /flex-direction\s*:\s*column/i.test(css || allCode) &&
        /\bgap\s*:/i.test(css || allCode),
      failureHint: `Apply display: flex, flex-direction: column, and gap in your CSS rules.`,
    });
  } else if (specText.includes("display: grid") || specText.includes("css grid")) {
    assertions.push({
      label: `Uses CSS Grid layout (grid-template-columns)`,
      test: ({ css, allCode }) =>
        /grid-template-columns/i.test(css || allCode) || /grid-cols-/i.test(allCode),
      failureHint: `Configure a CSS Grid layout using grid-template-columns.`,
    });
  }

  // 4. Interactive focus / hover states
  if (specText.includes(":focus-visible") || specText.includes("focus-visible")) {
    assertions.push({
      label: `Defines :focus-visible keyboard focus styling`,
      test: ({ css, allCode }) => /:focus-visible\b/i.test(css || allCode),
      failureHint: `Add a :focus-visible selector in your stylesheet so keyboard users see a clear focus ring.`,
    });
  }

  // 5. Fallback task-specific keyword / implementation check if no structural regex matched above
  if (assertions.length === 0) {
    const stopWords = new Set([
      "build",
      "create",
      "implement",
      "define",
      "setup",
      "with",
      "from",
      "into",
      "that",
      "this",
      "your",
      "using",
      "inside",
      "state",
      "component",
      "feature",
      "system",
      "project",
      "support",
      "handle",
    ]);
    const taskTokens = `${task.title} ${task.description}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    const keySignals = Array.from(new Set(taskTokens)).slice(0, 4);

    assertions.push({
      label: `Implements task logic for "${task.title}" (${keySignals.slice(0, 2).join(", ") || milestone.id})`,
      test: ({ userAddedCode, allCode }) => {
        if (userAddedCode.trim().length < 25) return false;
        const lowerUser = userAddedCode.toLowerCase();
        const lowerAll = allCode.toLowerCase();
        // Either explicit task marker (@task t1) or at least half of the task's domain tokens appear in user code
        if (
          lowerUser.includes(task.id.toLowerCase()) ||
          lowerUser.includes(task.title.toLowerCase().slice(0, 18))
        ) {
          return true;
        }
        if (keySignals.length === 0) return userAddedCode.trim().length >= 40;
        const matched = keySignals.filter(
          (tok) => lowerUser.includes(tok) || lowerAll.includes(tok),
        );
        return matched.length >= Math.max(1, Math.ceil(keySignals.length / 2));
      },
      failureHint: `Implement the required code for "${task.title}" (expected signals: ${keySignals.join(", ") || task.id}).`,
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
  const starter = buildProjectWorkspaceFiles(project);
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

  // Compute code actually added/modified by the learner compared to starter template
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

  const assertions = buildTaskAcceptanceAssertions(task, milestone);
  const criteriaChecked: string[] = [];
  const failedReasons: string[] = [];

  // If the learner hasn't modified the starter template at all, fail immediately
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
    const ok = assertion.test({ html, css, js, allCode, userAddedCode });
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
    taskResults,
  };

  saveProjectVerificationReport(project.id, report);
  return report;
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
