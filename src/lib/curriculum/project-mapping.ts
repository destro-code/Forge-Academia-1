import projectsData from "@/data/projects.json"
import modulesData from "@/data/modules.json"
import type { Project, ProjectMilestone, ProjectTask } from "@/lib/types"
import { canonicalManifest } from "./manifest"
import { getV1LessonById } from "./v1/loader"

interface CanonicalLessonSummary {
  id: string
  title: string
  moduleId: string
  order: number
  capabilities?: string[]
}

function getCanonicalV1LessonById(lessonId: string): CanonicalLessonSummary | undefined {
  const v1 = getV1LessonById(lessonId)
  const manifestRef = canonicalManifest.getLesson(lessonId)
  if (!v1 && !manifestRef) return undefined
  return {
    id: lessonId,
    title: v1?.identity.title ?? manifestRef?.title ?? lessonId,
    moduleId: v1?.curriculum.moduleId ?? manifestRef?.moduleId ?? "module-1-1",
    order: manifestRef?.order ?? manifestRef?.position ?? 1,
    capabilities: v1
      ? [
          v1.learning.primaryCapability.statement,
          ...(v1.learning.secondaryCapabilities?.map((c) => c.statement) ?? []),
        ]
      : undefined,
  }
}

function getCanonicalLessonsForModule(moduleId: string): CanonicalLessonSummary[] {
  return canonicalManifest
    .getLessonsForModule(moduleId)
    .map((ref) => getCanonicalV1LessonById(ref.lessonId))
    .filter((l): l is CanonicalLessonSummary => l !== undefined)
    .sort((a, b) => a.order - b.order)
}

export interface LessonProjectDeliverable {
  lessonId: string
  moduleId: string
  projectId: string
  projectTitle: string
  milestoneId: string
  milestoneTitle: string
  taskId: string
  taskTitle: string
  taskDescription: string
  deliverableSummary: string
  conceptsApplied: string[]
  defaultPlaygroundMode: "beginner" | "advanced"
  ctaLabel: string
}

export interface ProjectUnlockState {
  unlocked: boolean
  completedCount: number
  totalRequired: number
  nextLessonId: string | null
  nextLessonTitle: string | null
  missingLessons: { id: string; title: string; moduleId: string }[]
}

const BEGINNER_MODULES = new Set([
  "module-0-1",
  "module-1-1",
  "module-1-2",
  "module-1-3",
  "module-1-4",
  "module-2-1",
  "module-2-2",
  "module-2-4",
  "html-css-foundations",
])

const MODULE_TO_PRIMARY_PROJECT_ID: Record<string, string> = {
  "module-0-1": "semantic-profile-launchpad",
  "module-1-1": "semantic-profile-launchpad",
  "module-1-2": "css-design-surface-system",
  "module-1-3": "css-responsive-workspace-shell",
  "module-1-4": "accessible-interface-remediation",
  "module-2-1": "js-logic-and-data-engine",
  "module-2-2": "js-dom-interactive-taskboard",
  "module-2-3": "js-logic-and-data-engine",
  "module-2-4": "integrated-api-status-dashboard",
  "module-3-1": "component-library",
  "module-3-2": "kanban-board",
  "module-3-3": "ai-chat-workspace",
  "module-3-4": "js-to-ts-migration",
  "module-3-5": "e-commerce-checkout",
  "module-3-6": "quality-and-security-hardening",
  "module-4-1": "nextjs-server-components-migration",
  "module-4-2": "product-spec-to-architecture-plan",
  // Legacy moduleId fallbacks
  "html-css-foundations": "semantic-profile-launchpad",
  "react-professional": "kanban-board",
  "typescript-mastery": "js-to-ts-migration",
  "language-mastery": "js-logic-and-data-engine",
  "testing-and-tooling": "quality-and-security-hardening",
  "frontend-architecture": "nextjs-server-components-migration",
  "performance-and-a11y": "accessible-component-audit",
}

/**
 * Explicit lesson-to-milestone/task mappings for high-signal curriculum checkpoints,
 * including the First Implementation Slice lessons (`lesson-1-1-8`, `lesson-1-2-12`, `lesson-2-2-10`).
 */
const EXPLICIT_LESSON_DELIVERABLES: Record<
  string,
  {
    projectId: string
    milestoneId: string
    taskId: string
    deliverableSummary: string
    conceptsApplied: string[]
  }
> = {
  // Module 1.1 — HTML Foundations -> semantic-profile-launchpad
  "lesson-1-1-1": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Inspect and author your profile document's semantic root, head metadata, and top-level <header>.",
    conceptsApplied: ["HTML5 Document Skeleton", "<header> Landmark", "<h1> Heading Hierarchy"],
  },
  "lesson-1-1-2": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Structure the profile header with an <h1> developer name and bio summary paragraph.",
    conceptsApplied: ["Heading Hierarchy", "Paragraph Semantics", "Document Outline"],
  },
  "lesson-1-1-3": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t2",
    deliverableSummary: "Build the unordered social links list (<ul>/<li>) and current learning definition list (<dl>).",
    conceptsApplied: ["Unordered Lists (<ul>)", "Definition Lists (<dl>, <dt>, <dd>)", "List Nesting"],
  },
  "lesson-1-1-4": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t2",
    deliverableSummary: "Wire accessible anchor tags (<a href=...>) inside your <nav aria-label=\"Social links\"> landmark.",
    conceptsApplied: ["Anchor Attributes", "Accessible Navigation Links", "External Link Safety"],
  },
  "lesson-1-1-5": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Add your developer avatar <img> with descriptive alt text and intrinsic dimensions.",
    conceptsApplied: ["<img> Element", "Descriptive alt Text", "Image Accessibility"],
  },
  "lesson-1-1-8": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Replace generic <div> wrappers in the Developer Bio Launchpad with semantic <header>, <nav>, <main>, <section>, and <footer> landmarks.",
    conceptsApplied: ["<header>, <main>, <nav>, <footer> Landmarks", "Zero Div-Soup Architecture", "Screen Reader Landmark Tree"],
  },

  // Module 1.2 — CSS Foundations -> css-design-surface-system & semantic-profile-launchpad m2
  "lesson-1-2-1": {
    projectId: "css-design-surface-system",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Define :root CSS custom properties (--bg, --surface, --text, --accent) for the Design Surface System.",
    conceptsApplied: ["CSS Custom Properties", "Cascade & Inheritance", "Design Tokens"],
  },
  "lesson-1-2-5": {
    projectId: "css-design-surface-system",
    milestoneId: "m1",
    taskId: "t2",
    deliverableSummary: "Apply border-box sizing, consistent padding, and surface borders to the pricing and profile cards.",
    conceptsApplied: ["box-sizing: border-box", "Padding vs. Margin", "Card Surface Rhythm"],
  },
  "lesson-1-2-11": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m2",
    taskId: "t4",
    deliverableSummary: "Apply :root color and spacing tokens (--bg, --surface, --text, --accent) to your Developer Bio Launchpad.",
    conceptsApplied: [":root Custom Properties", "var() Token Consumption", "Theme Consistency"],
  },
  "lesson-1-2-12": {
    projectId: "css-design-surface-system",
    milestoneId: "m1",
    taskId: "t2",
    deliverableSummary: "Fix the Pricing & Feature Card surface using box-sizing: border-box, explicit padding tokens, and :focus-visible interactive button states.",
    conceptsApplied: ["Box Model Sizing", "Card Padding & Border Tokens", "Accessible :focus-visible Rings"],
  },

  // Module 1.3 — CSS Layout & Responsive -> css-responsive-workspace-shell
  "lesson-1-3-3": {
    projectId: "semantic-profile-launchpad",
    milestoneId: "m2",
    taskId: "t5",
    deliverableSummary: "Center the profile card and stack action buttons using display: flex, flex-direction: column, and gap.",
    conceptsApplied: ["Flexbox Axis Alignment", "flex-direction: column", "Gap Spacing"],
  },
  "lesson-1-3-8": {
    projectId: "css-responsive-workspace-shell",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Construct the multi-panel Workspace Shell using CSS Grid template areas and responsive auto-fit metric cards.",
    conceptsApplied: ["CSS Grid Template Areas", "repeat(auto-fit, minmax())", "Responsive Breakpoints"],
  },

  // Module 2.2 — DOM & Browser Events -> js-dom-interactive-taskboard
  "lesson-2-2-1": {
    projectId: "js-dom-interactive-taskboard",
    milestoneId: "m1",
    taskId: "t1",
    deliverableSummary: "Query the task board container and render dynamic task items into the live DOM.",
    conceptsApplied: ["querySelector", "DOM Element Creation", "Dynamic Counter Updates"],
  },
  "lesson-2-2-4": {
    projectId: "js-dom-interactive-taskboard",
    milestoneId: "m1",
    taskId: "t2",
    deliverableSummary: "Handle the new-task form submit event with event.preventDefault() and input validation.",
    conceptsApplied: ["Form Submit Event", "event.preventDefault()", "Live DOM Insertion"],
  },
  "lesson-2-2-10": {
    projectId: "js-dom-interactive-taskboard",
    milestoneId: "m2",
    taskId: "t3",
    deliverableSummary: "Attach a single delegated click listener on #task-list using event.target.closest() to toggle completion and delete tasks.",
    conceptsApplied: ["Event Bubbling", "Single-Listener Event Delegation", "event.target.closest()"],
  },
}

function getAllProjects(): Project[] {
  return projectsData as unknown as Project[]
}

export function getProjectById(projectId: string): Project | null {
  return getAllProjects().find((p) => p.id === projectId) ?? null
}

export function getProjectsForModule(moduleId: string): Project[] {
  const all = getAllProjects()
  const direct = all.filter((p) => p.moduleId === moduleId)
  if (direct.length > 0) return direct

  const mappedId = MODULE_TO_PRIMARY_PROJECT_ID[moduleId]
  if (!mappedId) return []
  return all.filter((p) => p.id === mappedId)
}

export function getDefaultPlaygroundModeForLessonOrProject(options: {
  lessonId?: string
  moduleId?: string
  projectId?: string
}): "beginner" | "advanced" {
  if (options.projectId) {
    const project = getProjectById(options.projectId)
    if (project?.defaultPlaygroundMode) {
      return project.defaultPlaygroundMode
    }
    if (project?.moduleId && BEGINNER_MODULES.has(project.moduleId)) {
      return "beginner"
    }
  }

  if (options.moduleId && BEGINNER_MODULES.has(options.moduleId)) {
    return "beginner"
  }

  if (options.lessonId) {
    const canonicalLesson = getCanonicalV1LessonById(options.lessonId)
    if (canonicalLesson && BEGINNER_MODULES.has(canonicalLesson.moduleId)) {
      return "beginner"
    }
    if (
      options.lessonId.startsWith("lesson-0-") ||
      options.lessonId.startsWith("lesson-1-") ||
      options.lessonId.startsWith("lesson-2-1-") ||
      options.lessonId.startsWith("lesson-2-2-") ||
      options.lessonId.startsWith("lesson-2-4-")
    ) {
      return "beginner"
    }
  }

  return "advanced"
}

export function getDeliverableForLesson(
  lessonId: string,
  fallbackModuleId?: string
): LessonProjectDeliverable | null {
  const canonicalLesson = getCanonicalV1LessonById(lessonId)
  const moduleId = canonicalLesson?.moduleId || fallbackModuleId || "module-1-1"

  const explicit = EXPLICIT_LESSON_DELIVERABLES[lessonId]
  if (explicit) {
    const project = getProjectById(explicit.projectId)
    if (project) {
      const milestone =
        project.milestones.find((m) => m.id === explicit.milestoneId) ??
        project.milestones[0]
      const task =
        milestone?.tasks.find((t) => t.id === explicit.taskId) ??
        milestone?.tasks[0]

      if (milestone && task) {
        return {
          lessonId,
          moduleId,
          projectId: project.id,
          projectTitle: project.title,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description || milestone.description,
          deliverableSummary: explicit.deliverableSummary,
          conceptsApplied: explicit.conceptsApplied,
          defaultPlaygroundMode: getDefaultPlaygroundModeForLessonOrProject({
            lessonId,
            moduleId,
            projectId: project.id,
          }),
          ctaLabel: `Apply in Project: ${milestone.title.replace(/^Milestone \d+:\s*/i, "")}`,
        }
      }
    }
  }

  // Fallback to module's primary cumulative project and proportional milestone/task
  const projectId = MODULE_TO_PRIMARY_PROJECT_ID[moduleId] || "semantic-profile-launchpad"
  const project = getProjectById(projectId)
  if (!project || project.milestones.length === 0) return null

  // Check if any task or milestone explicitly references this lessonId
  for (const milestone of project.milestones) {
    for (const task of milestone.tasks) {
      if (
        task.recommendedAfterLessonId === lessonId ||
        task.prerequisiteLessonIds?.includes(lessonId)
      ) {
        return {
          lessonId,
          moduleId,
          projectId: project.id,
          projectTitle: project.title,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description || milestone.description,
          deliverableSummary:
            task.description ||
            `Apply concepts from ${canonicalLesson?.title || "this lesson"} to complete "${task.title}".`,
          conceptsApplied: canonicalLesson?.capabilities?.slice(0, 3) || project.tags.slice(0, 3),
          defaultPlaygroundMode: getDefaultPlaygroundModeForLessonOrProject({
            lessonId,
            moduleId,
            projectId: project.id,
          }),
          ctaLabel: `Apply in Project: ${milestone.title.replace(/^Milestone \d+:\s*/i, "")}`,
        }
      }
    }
  }

  // Deterministically pick milestone based on lesson order inside module
  const moduleLessons = getCanonicalLessonsForModule(moduleId)
  const lessonIndex = Math.max(
    0,
    moduleLessons.findIndex((l) => l.id === lessonId)
  )
  const ratio =
    moduleLessons.length > 1 ? lessonIndex / (moduleLessons.length - 1) : 0
  const milestoneIndex = Math.min(
    project.milestones.length - 1,
    Math.floor(ratio * project.milestones.length)
  )
  const milestone: ProjectMilestone = project.milestones[milestoneIndex]
  const taskIndex =
    milestone.tasks.length > 0
      ? lessonIndex % milestone.tasks.length
      : 0
  const task: ProjectTask | undefined = milestone.tasks[taskIndex]

  if (!task) return null

  return {
    lessonId,
    moduleId,
    projectId: project.id,
    projectTitle: project.title,
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    taskId: task.id,
    taskTitle: task.title,
    taskDescription: task.description || milestone.description,
    deliverableSummary:
      task.description ||
      `Apply ${canonicalLesson?.title || "this lesson's concepts"} directly inside ${project.title}.`,
    conceptsApplied:
      canonicalLesson?.capabilities?.slice(0, 3) || project.tags.slice(0, 3),
    defaultPlaygroundMode: getDefaultPlaygroundModeForLessonOrProject({
      lessonId,
      moduleId,
      projectId: project.id,
    }),
    ctaLabel: `Apply in Project: ${milestone.title.replace(/^Milestone \d+:\s*/i, "")}`,
  }
}

export function getPrerequisiteLessonsForProject(
  project: Project
): { id: string; title: string; moduleId: string }[] {
  if (project.prerequisiteLessonIds && project.prerequisiteLessonIds.length > 0) {
    return project.prerequisiteLessonIds.map((lessonId) => {
      const lesson = getCanonicalV1LessonById(lessonId)
      return {
        id: lessonId,
        title: lesson?.title || lessonId,
        moduleId: lesson?.moduleId || project.moduleId || "module-1-1",
      }
    })
  }

  const targetModuleId = project.moduleId || "module-1-1"
  const moduleLessons = getCanonicalLessonsForModule(targetModuleId)

  if (moduleLessons.length > 0) {
    return moduleLessons.slice(0, 4).map((l) => ({
      id: l.id,
      title: l.title,
      moduleId: l.moduleId,
    }))
  }

  return []
}

export function isProjectUnlocked(
  project: Project,
  completedLessons: string[]
): ProjectUnlockState {
  const prereqLessons = getPrerequisiteLessonsForProject(project)
  if (prereqLessons.length === 0) {
    return {
      unlocked: true,
      completedCount: 0,
      totalRequired: 0,
      nextLessonId: null,
      nextLessonTitle: null,
      missingLessons: [],
    }
  }

  const completedSet = new Set(completedLessons)
  const missingLessons = prereqLessons.filter((l) => !completedSet.has(l.id))
  const completedCount = prereqLessons.length - missingLessons.length
  // A cumulative module project unlocks as soon as the first prerequisite lesson is completed,
  // or when all prerequisites are met if only 1 prerequisite exists.
  const unlocked = completedCount >= 1 || missingLessons.length === 0

  return {
    unlocked,
    completedCount,
    totalRequired: prereqLessons.length,
    nextLessonId: missingLessons[0]?.id ?? prereqLessons[0]?.id ?? null,
    nextLessonTitle: missingLessons[0]?.title ?? prereqLessons[0]?.title ?? null,
    missingLessons,
  }
}

export function getModuleTitleById(moduleId?: string): string {
  if (!moduleId) return "Core Curriculum"
  const found = (modulesData as { id: string; title: string }[]).find(
    (m) => m.id === moduleId
  )
  return found?.title || moduleId
}
