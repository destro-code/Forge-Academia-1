// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCapabilityEvidenceRecords,
  clearVerifiedProjectTasks,
  computeGuidedNextStep,
  getAggregatedTopicCapabilityStatuses,
  getCapabilityEvidenceRecords,
  getLessonStepResumeInfo,
  getTaskEvidenceStatus,
  getVerifiedProjectTasks,
  markProjectTasksVerified,
  recordCapabilityEvidence,
  unmarkProjectTasksVerified,
} from "../evidence-store";
import {
  clearProjectVerificationReports,
  getProjectVerificationReports,
  getTaskVerificationCriteria,
  normalizeProjectAssertionForRuntime,
  verifyProjectMilestone,
} from "../project-verifier";
import { executeAssertion } from "@/lib/compiler/validation-evaluator";
import { buildProjectWorkspaceFiles } from "@/lib/project-workspace-templates";
import {
  extractGuidedTaskSlot,
  spliceGuidedTaskSlot,
} from "@/components/projects/guided-task-slot-editor";
import { checkPathEligibility } from "@/lib/utils/path-eligibility";
import lessonsData from "@/data/lessons.json";
import modulesData from "@/data/modules.json";
import topicsData from "@/data/topics.json";
import projectsData from "@/data/projects.json";
import learningPathsData from "@/data/learning-paths.json";
import quizzesData from "@/data/quizzes.json";
import { goldenLesson0CanonicalV1 } from "@/lib/curriculum/golden-lesson-v1";
import { adaptLessonV1ToLayer1 } from "@/lib/curriculum/v1/adapter";
import type { Lesson, Module, Topic, Project, LearningPath, Quiz, ProgressState } from "@/lib/types";

const lessons = lessonsData as Lesson[];
const modules = modulesData as Module[];
const topics = topicsData as Topic[];
const projects = projectsData as Project[];
const learningPaths = learningPathsData as LearningPath[];
const quizzes = quizzesData as Quiz[];

function makeBaseProgress(overrides: Partial<ProgressState> = {}): ProgressState {
  return {
    lessonsCompleted: [],
    quizResults: [],
    interviewResults: [],
    projectTasks: {},
    solvedBugs: [],
    challengesCompleted: [],
    challengeStreakDays: 0,
    bookmarks: [],
    notes: {},
    flashcardReviews: {},
    certificates: [],
    streakDays: 0,
    studySeconds: 0,
    dailyActivity: {},
    ...overrides,
  };
}

describe("Forge Academia — Core Learning Engine & Verification QA", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCapabilityEvidenceRecords();
    clearVerifiedProjectTasks();
    clearProjectVerificationReports("p-isolation-test");
  });

  describe("1. Core Learning Engine & Persistence", () => {
    it("persists exact lesson step resume info and capability evidence across storage reads", () => {
      const targetLesson = lessons[0];
      const initialResume = getLessonStepResumeInfo(targetLesson.id, []);
      expect(initialResume.status).toBe("not-started");
      expect(initialResume.currentStepIndex).toBe(0);

      // Simulate persisted mid-lesson session state
      window.localStorage.setItem(
        `forge_lesson_session_${targetLesson.id}`,
        JSON.stringify({
          lessonId: targetLesson.id,
          status: "in_progress",
          currentActivityIndex: 3,
          totalActivities: 7,
          completedActivityIds: ["a1", "a2", "a3"],
          activities: {
            a1: { activityId: "a1", status: "passed", attempts: 1 },
            a2: { activityId: "a2", status: "passed", attempts: 1 },
            a3: { activityId: "a3", status: "completed", attempts: 1 },
          },
          updatedAt: "2026-10-24T00:00:00.000Z",
        }),
      );

      const resumeInfo = getLessonStepResumeInfo(targetLesson.id, []);
      expect(resumeInfo.status).toBe("in-progress");
      expect(resumeInfo.currentStepIndex).toBe(3);
      expect(resumeInfo.totalSteps).toBe(7);
      expect(resumeInfo.completedStepCount).toBe(3);
      expect(resumeInfo.verifiedStepCount).toBe(3);

      recordCapabilityEvidence({
        id: "lesson:l-web-01-conversation",
        title: "Completed A Website Is a Conversation",
        sourceType: "lesson",
        sourceId: targetLesson.id,
        topicId: targetLesson.topicId,
        moduleId: targetLesson.moduleId,
        status: "demonstrated",
        evidenceStatus: "verified",
        summary: "Passed all interactive checks.",
        updatedAt: "2026-10-24T00:00:00.000Z",
      });

      const persisted = getCapabilityEvidenceRecords();
      expect(persisted).toHaveLength(1);
      expect(persisted[0].id).toBe("lesson:l-web-01-conversation");
      expect(persisted[0].evidenceStatus).toBe("verified");
    });

    it("keeps lesson completion, self-reported work, verified work, and mastery distinct", () => {
      const firstProject = projects[0];
      const firstMilestone = firstProject.milestones[0];
      const task1 = firstMilestone.tasks[0];
      const task2 = firstMilestone.tasks[1];

      const selfReportedMap = {
        [`${firstProject.id}:${task1.id}`]: true,
        [`${firstProject.id}:${task2.id}`]: true,
      };

      // Self-reported task is 'self-reported', NOT 'verified'
      expect(getTaskEvidenceStatus(firstProject.id, task1.id, selfReportedMap)).toBe(
        "self-reported",
      );
      expect(getTaskEvidenceStatus(firstProject.id, task2.id, selfReportedMap)).toBe(
        "self-reported",
      );

      // Verify only task1
      markProjectTasksVerified(firstProject.id, [task1.id]);
      expect(getTaskEvidenceStatus(firstProject.id, task1.id, selfReportedMap)).toBe("verified");
      expect(getTaskEvidenceStatus(firstProject.id, task2.id, selfReportedMap)).toBe(
        "self-reported",
      );

      // Unverify task1 when a subsequent check fails
      unmarkProjectTasksVerified(firstProject.id, [task1.id]);
      expect(getTaskEvidenceStatus(firstProject.id, task1.id, selfReportedMap)).toBe(
        "self-reported",
      );
      expect(getVerifiedProjectTasks()[`${firstProject.id}:${task1.id}`]).toBeUndefined();
    });

    it("prevents stale or conflicting evidence from producing misleading mastery claims", () => {
      const targetTopic = topics[0];
      const topicLessons = lessons.filter((l) => l.topicId === targetTopic.id);

      // Older verified record
      recordCapabilityEvidence({
        id: "lesson:check-1",
        title: "Lesson Check Passed",
        sourceType: "lesson",
        sourceId: topicLessons[0]?.id || "l-1",
        topicId: targetTopic.id,
        status: "demonstrated",
        evidenceStatus: "verified",
        summary: "Initial lesson check passed.",
        updatedAt: "2026-10-24T01:00:00.000Z",
      });

      let map = getAggregatedTopicCapabilityStatuses({
        topics: [targetTopic],
        lessons,
        progress: makeBaseProgress({
          lessonsCompleted: topicLessons.map((l) => l.id),
        }),
      });
      expect(map[targetTopic.id].status).toBe("demonstrated");
      expect(map[targetTopic.id].hasConflictingOrFragileEvidence).toBe(false);

      // Newer failing quiz or interview check on the same topic
      recordCapabilityEvidence({
        id: "quiz:check-2",
        title: "Topic Quiz Failed",
        sourceType: "quiz",
        sourceId: "q-1",
        topicId: targetTopic.id,
        status: "needs-review",
        evidenceStatus: "needs-attention",
        summary: "Missed key questions on HTTP status codes.",
        updatedAt: "2026-10-24T02:00:00.000Z",
      });

      map = getAggregatedTopicCapabilityStatuses({
        topics: [targetTopic],
        lessons,
        progress: makeBaseProgress({
          lessonsCompleted: topicLessons.map((l) => l.id),
        }),
      });
      // Must downgrade to needs-review rather than claiming demonstrated or mastered
      expect(map[targetTopic.id].status).toBe("needs-review");
      expect(map[targetTopic.id].evidenceStatus).toBe("needs-attention");
      expect(map[targetTopic.id].hasConflictingOrFragileEvidence).toBe(true);
    });

    it("computes accurate GuidedNextStep for new, active, struggling, project-verification, and completed learners", () => {
      const currentLesson = lessons[0];
      const activeModule = modules[0];

      // 1. New learner -> starts first lesson
      const newStep = computeGuidedNextStep({
        currentLesson,
        activeModule,
        lessons,
        projects,
        progress: makeBaseProgress(),
      });
      expect(newStep.kind).toBe("start-lesson");
      expect(newStep.to).toBe("/lesson/$lessonId");
      expect(newStep.params?.lessonId).toBe(currentLesson.id);

      // 2. Active mid-lesson learner -> resumes exact step
      window.localStorage.setItem(
        `forge_lesson_session_${currentLesson.id}`,
        JSON.stringify({
          lessonId: currentLesson.id,
          status: "in_progress",
          currentActivityIndex: 2,
          totalActivities: 7,
          completedActivityIds: ["a1", "a2"],
          activities: {},
          updatedAt: "2026-10-24T01:00:00.000Z",
        }),
      );
      const activeStep = computeGuidedNextStep({
        currentLesson,
        activeModule,
        lessons,
        projects,
        progress: makeBaseProgress(),
      });
      expect(activeStep.kind).toBe("resume-lesson");
      expect(activeStep.params?.lessonId).toBe(currentLesson.id);
      expect(activeStep.ctaLabel).toContain("Step 3 of 7");

      // 3. Struggling learner with needs-review record -> routes to remediation lesson
      const remediationLesson = lessons[1] || lessons[0];
      recordCapabilityEvidence({
        id: "interview:weak-http",
        title: "HTTP Request Lifecycle",
        sourceType: "interview",
        sourceId: "int-1",
        topicId: remediationLesson.topicId,
        remediationLessonId: remediationLesson.id,
        status: "needs-review",
        evidenceStatus: "needs-attention",
        summary: "Missed status code and header questions.",
        updatedAt: "2026-10-24T03:00:00.000Z",
      });
      const strugglingStep = computeGuidedNextStep({
        currentLesson,
        activeModule,
        lessons,
        projects,
        progress: makeBaseProgress(),
      });
      expect(strugglingStep.kind).toBe("review-weakness");
      expect(strugglingStep.params?.lessonId).toBe(remediationLesson.id);
      expect(strugglingStep.stepBadge).toBe("Targeted Review");

      // Clear struggling record and mid-lesson step
      clearCapabilityEvidenceRecords();
      window.localStorage.removeItem(`forge_lesson_session_${currentLesson.id}`);

      // 4. Learner with self-reported project task awaiting verification -> routes to Project Studio
      const firstProject = projects[0];
      const firstTask = firstProject.milestones[0].tasks[0];
      const verifyStep = computeGuidedNextStep({
        currentLesson: lessons[1],
        activeModule,
        lessons,
        projects,
        progress: makeBaseProgress({
          lessonsCompleted: [lessons[0].id],
          projectTasks: {
            [`${firstProject.id}:${firstTask.id}`]: true,
          },
        }),
      });
      expect(verifyStep.kind).toBe("verify-project");
      expect(verifyStep.to).toBe("/projects/$projectId");
      expect(verifyStep.params?.projectId).toBe(firstProject.id);

      // 5. Completed-lessons learner with all tasks verified -> routes to interview readiness
      const allLessonIds = lessons.map((l) => l.id);
      for (const p of projects) {
        markProjectTasksVerified(
          p.id,
          p.milestones.flatMap((m) => (m.tasks || []).map((t) => t.id)),
        );
      }
      const completedStep = computeGuidedNextStep({
        currentLesson: undefined,
        activeModule,
        lessons,
        projects,
        progress: makeBaseProgress({
          lessonsCompleted: allLessonIds,
        }),
      });
      expect(completedStep.kind).toBe("practice-interview");
      expect(completedStep.to).toBe("/interview");
    });
  });

  describe("2. Real Project Verification (Per-Task Acceptance Criteria Isolation)", () => {
    it("fails verification when starter code is unmodified", () => {
      const project = projects[0];
      const milestone = project.milestones[0];
      const starterFiles = buildProjectWorkspaceFiles(project).files;

      const report = verifyProjectMilestone(milestone, project, starterFiles);

      expect(report.allPassed).toBe(false);
      expect(report.passedCount).toBe(0);
      expect(report.totalTasks).toBe(milestone.tasks.length);
      for (const task of milestone.tasks) {
        expect(report.taskResults[task.id].passed).toBe(false);
      }
    });

    it("isolates per-task verification so passing Task 1 cannot falsely verify Task 2", () => {
      const testProject: Project = {
        id: "p-isolation-test",
        title: "Isolation Verification Project",
        moduleId: "m-01",
        difficulty: "Beginner",
        estimatedHours: 2,
        description: "Test per-task acceptance criteria isolation",
        learningGoals: ["Semantic HTML", "Accessibility"],
        milestones: [
          {
            id: "ms-1",
            title: "Semantic Structure & Navigation",
            description: "Build landmarks and skip link",
            acceptanceCriteria: [
              "Include semantic <section> and <footer> landmarks",
              "Include a <nav> with aria-label and <form>",
            ],
            tasks: [
              {
                id: "task-landmarks",
                title: "Add semantic <section> and <footer> landmarks",
                description: "Create a <section> content block and a <footer> element.",
                hints: ["Use <section> and <footer> elements"],
              },
              {
                id: "task-aria-nav",
                title: "Add a <nav> element with an aria-label attribute and <form> input",
                description: "Build accessible navigation with aria-label and a search <form>.",
                hints: ["Use <nav aria-label='Main'> and <form><input /></form>"],
              },
            ],
          },
        ],
      };

      const milestone = testProject.milestones[0];

      // Code only satisfies Task 1 (<section>, <footer>), NOT Task 2 (<nav>, aria-label, <form>, <input>)
      const partialFiles = [
        {
          id: "index.html",
          name: "index.html",
          language: "html" as const,
          code: `<header><h1>Site Title</h1></header><main><section><p>Welcome to our semantic page layout content.</p></section></main><footer>Copyright 2026</footer>`,
        },
      ];

      const partialReport = verifyProjectMilestone(milestone, testProject, partialFiles);
      expect(partialReport.allPassed).toBe(false);
      expect(partialReport.passedCount).toBe(1);
      expect(partialReport.taskResults["task-landmarks"].passed).toBe(true);
      expect(partialReport.taskResults["task-aria-nav"].passed).toBe(false);

      // Now satisfy both Task 1 and Task 2
      const completeFiles = [
        {
          id: "index.html",
          name: "index.html",
          language: "html" as const,
          code: `<header><nav aria-label="Primary"><a href="#main">Skip</a></nav></header><main id="main"><section><p>Main content section</p></section><form><label for="q">Search</label><input id="q" /></form></main><footer>Footer</footer>`,
        },
      ];

      const fullReport = verifyProjectMilestone(milestone, testProject, completeFiles);
      expect(fullReport.allPassed).toBe(true);
      expect(fullReport.passedCount).toBe(2);
      expect(fullReport.taskResults["task-landmarks"].passed).toBe(true);
      expect(fullReport.taskResults["task-aria-nav"].passed).toBe(true);

      const savedReports = getProjectVerificationReports(testProject.id);
      expect(savedReports[milestone.id]).toBeDefined();
      expect(savedReports[milestone.id].allPassed).toBe(true);
    });

    it("normalizes all curriculum project assertions for runtime iframe execution including count_at_least (minCount)", () => {
      const allRawAssertions = projects.flatMap((p) =>
        p.milestones.flatMap((m) =>
          (m.tasks || []).flatMap((t) => t.validationSpec?.assertions || []),
        ),
      );
      expect(allRawAssertions.length).toBeGreaterThan(0);

      for (const raw of allRawAssertions) {
        const normalized = normalizeProjectAssertionForRuntime(raw);
        expect(normalized.id).toBe(raw.id);
        expect(["dom_query", "js_evaluation", "computed_style", "source_ast_check"]).toContain(
          normalized.strategy,
        );
        expect(typeof normalized.description).toBe("string");
        expect(normalized.description.length).toBeGreaterThan(0);
        expect(typeof normalized.failureMessage).toBe("string");
      }

      // Verify count_at_least maps to expected.minCount and evaluates accurately against a live DOM
      const minLinksAssertion = normalizeProjectAssertionForRuntime({
        id: "spl-t2-links",
        label: "Includes at least 3 navigation links inside <nav>",
        type: "dom_query",
        selector: "nav a[href]",
        assertion: "count_at_least",
        expected: 3,
        errorMessage: "Add at least 3 <a href='...'> links inside your <nav> element.",
      });

      expect(minLinksAssertion.strategy).toBe("dom_query");
      if (minLinksAssertion.strategy === "dom_query") {
        expect(minLinksAssertion.expected.minCount).toBe(3);
      }

      const failingDoc = new DOMParser().parseFromString(
        `<nav><a href="#one">One</a><a href="#two">Two</a></nav>`,
        "text/html",
      );
      const failRes = executeAssertion(minLinksAssertion, failingDoc, window);
      expect(failRes.status).toBe("failed");

      const passingDoc = new DOMParser().parseFromString(
        `<nav><a href="#one">One</a><a href="#two">Two</a><a href="#three">Three</a><a href="#four">Four</a></nav>`,
        "text/html",
      );
      const passRes = executeAssertion(minLinksAssertion, passingDoc, window);
      expect(passRes.status).toBe("passed");
    });

    it("classifies all 17 projects by projectKind and verifies starter fails while solution passes for all 7 Guided Builds", () => {
      const guidedBuilds = projects.filter((p) => p.projectKind === "guided-build");
      const moduleProjects = projects.filter((p) => p.projectKind === "module-project");
      expect(guidedBuilds).toHaveLength(7);
      expect(moduleProjects).toHaveLength(10);

      const portfolioSite = projects.find((p) => p.id === "portfolio-site");
      const a11yAudit = projects.find((p) => p.id === "accessible-component-audit");
      expect(portfolioSite?.moduleId).toBe("module-3-2");
      expect(a11yAudit?.moduleId).toBe("module-3-1");

      for (const project of guidedBuilds) {
        const workspace = buildProjectWorkspaceFiles(project);
        for (const milestone of project.milestones) {
          const starterReport = verifyProjectMilestone(milestone, project, workspace.files);
          expect(
            starterReport.allPassed,
            `Expected starter files to fail for ${project.id}:${milestone.id}`,
          ).toBe(false);

          const solutionPlaygroundFiles = workspace.files.map((f) => ({
            ...f,
            code: workspace.solutionFiles[f.id] ?? f.code,
          }));
          const solutionReport = verifyProjectMilestone(
            milestone,
            project,
            solutionPlaygroundFiles,
          );
          expect(
            solutionReport.allPassed,
            `Expected solution files to pass for ${project.id}:${milestone.id} (${JSON.stringify(solutionReport.taskResults)})`,
          ).toBe(true);
        }
      }
    });

    it("edits only the explicitly marked code-entry region and preserves the hidden file around it", () => {
      const code = [
        "<body>",
        "  <header>Existing site header</header>",
        "  <!-- FORGE_SLOT_START:slot-test -->",
        "  <p>Starter code</p>",
        "  <!-- FORGE_SLOT_END:slot-test -->",
        "  <footer>Existing site footer</footer>",
        "</body>",
      ].join("\n");
      const file = {
        id: "test-html",
        name: "index.html",
        language: "html" as const,
        code,
      };
      const task = {
        id: "slot-task",
        milestoneId: "m1",
        title: "Write a paragraph",
        taskSlot: {
          targetFile: "index.html" as const,
          slotId: "slot-test",
          slotStartMarker: "FORGE_SLOT_START:slot-test",
          slotEndMarker: "FORGE_SLOT_END:slot-test",
          initialSlotCode: "  <p>Starter code</p>",
          solutionSlotCode: "  <p>Completed code</p>",
        },
      };

      const extraction = extractGuidedTaskSlot(file, task, 1);
      expect(extraction.configurationError).toBeUndefined();
      expect(extraction.slotCode).toBe("  <p>Starter code</p>");
      expect(extraction.slotCode).not.toContain("<header>");
      expect(extraction.slotCode).not.toContain("<footer>");
      expect(spliceGuidedTaskSlot(extraction, extraction.slotCode)).toBe(code);

      const updated = spliceGuidedTaskSlot(extraction, "  <p>Completed code</p>");
      expect(updated).toContain("<header>Existing site header</header>");
      expect(updated).toContain("<footer>Existing site footer</footer>");
      expect(updated).toContain("<p>Completed code</p>");
      expect(updated).not.toContain("<p>Starter code</p>");
    });

    it("refuses to guess when a task has no valid, unique code-entry markers", () => {
      const file = {
        id: "test-html",
        name: "index.html",
        language: "html" as const,
        code: "<body><p>Do not expose this entire file</p></body>",
      };
      const unconfiguredTask = {
        id: "unconfigured",
        milestoneId: "m1",
        title: "Task without a slot",
      };
      const missing = extractGuidedTaskSlot(file, unconfiguredTask, 1);
      expect(missing.configurationError).toContain("does not have a configured code-entry area");
      expect(missing.slotCode).toBe("");

      const malformedTask = {
        id: "malformed",
        milestoneId: "m1",
        title: "Task with missing markers",
        taskSlot: {
          targetFile: "index.html" as const,
          slotId: "missing",
          slotStartMarker: "FORGE_SLOT_START:missing",
          slotEndMarker: "FORGE_SLOT_END:missing",
          initialSlotCode: "",
          solutionSlotCode: "<p>Done</p>",
        },
      };
      const malformed = extractGuidedTaskSlot(file, malformedTask, 1);
      expect(malformed.configurationError).toContain("exactly one start marker and one end marker");
      expect(malformed.slotCode).toBe("");
    });

  describe("3. Lesson-Player QA & Golden Lesson Adaptation", () => {
    it("adapts goldenLesson0CanonicalV1 with no duplicate scene-setting spoiler step and valid activity render plans", () => {
      const adapted = adaptLessonV1ToLayer1(goldenLesson0CanonicalV1);
      expect(adapted.lesson.activities.length).toBe(7);
      expect(Object.keys(adapted.originalActivities).length).toBe(7);
      expect(Object.keys(adapted.renderPlan).length).toBe(7);
      // First activity is the interactive demo, not a duplicate prose scene-setter
      expect(goldenLesson0CanonicalV1.activities[0].type).toBe("interactive-demo");
    });
  });

  describe("4. Path & Certificate Eligibility Requires Sandbox-Verified Project Tasks", () => {
    it("blocks final assessment eligibility until lessons, quizzes, AND sandbox project verification are all met", () => {
      const targetPath: LearningPath = learningPaths[0];
      const pathLessons = lessons.filter((l) => targetPath.moduleIds.includes(l.moduleId));
      const completedLessonIds = pathLessons.map((l) => l.id);

      const passedQuizResults = quizzes.map((q) => ({
        quizId: q.id,
        topicId: q.topicId,
        bestScore: 90,
        scorePercent: 90,
        attempts: 1,
        completedAt: "2026-10-24T00:00:00.000Z",
      }));

      // Lessons & quizzes complete, but 0 sandbox-verified project tasks
      const withoutVerifiedProject = checkPathEligibility(
        targetPath.id,
        completedLessonIds,
        passedQuizResults,
      );
      expect(withoutVerifiedProject.isLessonsComplete).toBe(true);
      expect(withoutVerifiedProject.isQuizzesComplete).toBe(true);
      expect(withoutVerifiedProject.verifiedProjectTasksCount).toBe(0);
      expect(withoutVerifiedProject.isProjectVerificationComplete).toBe(false);
      expect(withoutVerifiedProject.isEligible).toBe(false);

      // Now verify a project task in the path
      const pathProject =
        projects.find((p) => targetPath.moduleIds.includes(p.moduleId)) || projects[0];
      markProjectTasksVerified(pathProject.id, [pathProject.milestones[0].tasks[0].id]);

      const withVerifiedProject = checkPathEligibility(
        targetPath.id,
        completedLessonIds,
        passedQuizResults,
      );
      expect(withVerifiedProject.verifiedProjectTasksCount).toBeGreaterThanOrEqual(1);
      expect(withVerifiedProject.isProjectVerificationComplete).toBe(true);
      expect(withVerifiedProject.isEligible).toBe(true);
    });
  });

  describe("5. End-to-End Curriculum-to-Projects Architecture & Module Coverage", () => {
    it("maps all 17 projects to valid curriculum modules, covers all 15 practical modules (module-1-1 to module-4-2), and decouples project verification from /playground", () => {
      expect(modules).toHaveLength(17);
      expect(projects).toHaveLength(17);

      const moduleIds = new Set(modules.map((m) => m.id));
      for (const project of projects) {
        expect(
          moduleIds.has(project.moduleId),
          `Expected project ${project.id} moduleId (${project.moduleId}) to exist in modules.json`,
        ).toBe(true);
      }

      const practicalModules = modules.filter((m) => !m.id.startsWith("module-0-"));
      expect(practicalModules).toHaveLength(15);

      for (const mod of practicalModules) {
        const linkedProjects = projects.filter((p) => p.moduleId === mod.id);
        expect(
          linkedProjects.length,
          `Expected at least 1 project linked to ${mod.id} (${mod.title})`,
        ).toBeGreaterThanOrEqual(1);
      }

      // Every Guided Build task across all 7 Guided Builds extracts a valid slot and round-trips losslessly
      const guidedBuilds = projects.filter((p) => p.projectKind === "guided-build");
      expect(guidedBuilds).toHaveLength(7);

      for (const project of guidedBuilds) {
        const workspace = buildProjectWorkspaceFiles(project);
        const flatTasks = project.milestones.flatMap((m) => m.tasks || []);
        flatTasks.forEach((task, idx) => {
          const taskNumber = idx + 1;
          const todoRegex = new RegExp(`TODO\\s*\\(?Task\\s*${taskNumber}\\b`, "i");
          const targetFile =
            workspace.files.find((f) => todoRegex.test(f.code || "")) ?? workspace.files[0];
          const slot = extractGuidedTaskSlot(targetFile, task, taskNumber);
          expect(slot.slotCode.length).toBeGreaterThan(0);
          expect(spliceGuidedTaskSlot(slot, slot.slotCode)).toBe(targetFile.code);
        });
      }

      // Verify computeGuidedNextStep routes project verification directly to /projects/$projectId (never /playground)
      const allLessonIds = lessons.map((l) => l.id);
      const nextStep = computeGuidedNextStep({
        currentLesson: undefined,
        activeModule: modules[0],
        lessons,
        projects,
        progress: makeBaseProgress({
          lessonsCompleted: allLessonIds,
          projectTasks: {
            "semantic-profile-launchpad:spl-t1-header": true,
          },
        }),
      });
      expect(nextStep.kind).toBe("verify-project");
      expect(nextStep.to).toBe("/projects/$projectId");
      expect(nextStep.to).not.toContain("/playground");
      expect(nextStep.params).toEqual({ projectId: "semantic-profile-launchpad" });
    });
  });
});


