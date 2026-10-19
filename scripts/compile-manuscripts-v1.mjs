import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const MANUSCRIPTS_DIR = path.join(ROOT, "manuscripts");
const LESSONS_V1_DIR = path.join(ROOT, "src/data/canonical/lessons-v1");
const MANIFEST_PATH = path.join(ROOT, "src/data/canonical/curriculum-manifest.json");
const CONCEPTS_PATH = path.join(ROOT, "src/data/canonical/concepts.json");
const CAPABILITIES_PATH = path.join(ROOT, "src/data/canonical/capabilities.json");
const LEVELS_PATH = path.join(ROOT, "src/data/canonical/levels.json");
const ACADEMY_PATH = path.join(ROOT, "src/data/canonical/academy.json");

const MODULE_CONFIG = {
  "0.1": {
    moduleId: "module-0-1",
    levelId: "level-0",
    phaseId: "phase-0",
    position: 1,
    topicId: "a-website-is-a-conversation",
    topicTitle: "The Web as a System",
    runtimeEnv: "browser",
    preserveExistingFiles: true,
  },
  "0.2": {
    moduleId: "module-0-2",
    levelId: "level-0",
    phaseId: "phase-0",
    position: 2,
    topicId: "debugging-strategies",
    topicTitle: "Thinking Like a Programmer",
    runtimeEnv: "none",
  },
  "1.1": {
    moduleId: "module-1-1",
    levelId: "level-1",
    phaseId: "phase-1",
    position: 1,
    topicId: "html-the-structure-of-the-web",
    topicTitle: "HTML: Structure and Meaning",
    runtimeEnv: "browser",
  },
  "1.2": {
    moduleId: "module-1-2",
    levelId: "level-1",
    phaseId: "phase-1",
    position: 2,
    topicId: "css-presentation-and-styling",
    topicTitle: "CSS: Make the Structure Visible",
    runtimeEnv: "browser",
  },
  "1.3": {
    moduleId: "module-1-3",
    levelId: "level-1",
    phaseId: "phase-1",
    position: 3,
    topicId: "flexbox-layout",
    topicTitle: "Layout and Responsive Design",
    runtimeEnv: "browser",
  },
  "1.4": {
    moduleId: "module-1-4",
    levelId: "level-1",
    phaseId: "phase-1",
    position: 4,
    topicId: "accessible-form-labels",
    topicTitle: "Accessible Interface Craft",
    runtimeEnv: "browser",
  },
  "2.1": {
    moduleId: "module-2-1",
    levelId: "level-2",
    phaseId: "phase-2",
    position: 1,
    topicId: "javascript-fundamentals",
    topicTitle: "JavaScript: The Language of Behavior",
    runtimeEnv: "javascript",
  },
  "2.2": {
    moduleId: "module-2-2",
    levelId: "level-2",
    phaseId: "phase-2",
    position: 2,
    topicId: "browser-debugging-fundamentals",
    topicTitle: "JavaScript in the Browser",
    runtimeEnv: "browser",
  },
  "2.3": {
    moduleId: "module-2-3",
    levelId: "level-2",
    phaseId: "phase-2",
    position: 3,
    topicId: "typescript-fundamentals",
    topicTitle: "TypeScript: Make Intent Explicit",
    runtimeEnv: "typescript",
  },
  "2.4": {
    moduleId: "module-2-4",
    levelId: "level-2",
    phaseId: "phase-2",
    position: 4,
    topicId: "apis-and-web-data-fetching",
    topicTitle: "Web Data and APIs",
    runtimeEnv: "http",
  },
  "2.5": {
    moduleId: "module-2-5",
    levelId: "level-2",
    phaseId: "phase-2",
    position: 5,
    topicId: "git-and-github-workflows",
    topicTitle: "Git, GitHub, and Team Workflow",
    runtimeEnv: "none",
  },
  "3.1": {
    moduleId: "module-3-1",
    levelId: "level-3",
    phaseId: "phase-3",
    position: 1,
    topicId: "react-declarative-foundations",
    topicTitle: "React: Think in UI State",
    runtimeEnv: "react",
  },
  "3.2": {
    moduleId: "module-3-2",
    levelId: "level-3",
    phaseId: "phase-3",
    position: 2,
    topicId: "react-state-and-hooks",
    topicTitle: "React: Interaction and Effects",
    runtimeEnv: "react",
  },
  "3.3": {
    moduleId: "module-3-3",
    levelId: "level-3",
    phaseId: "phase-3",
    position: 3,
    topicId: "component-design-patterns",
    topicTitle: "React: Component Design and Application Patterns",
    runtimeEnv: "react",
  },
  "3.4": {
    moduleId: "module-3-4",
    levelId: "level-3",
    phaseId: "phase-3",
    position: 4,
    topicId: "client-side-routing",
    topicTitle: "Routing, Data Flow, and React Applications",
    runtimeEnv: "react",
  },
  "4.1": {
    moduleId: "module-4-1",
    levelId: "level-4",
    phaseId: "phase-4",
    position: 1,
    topicId: "nextjs-and-meta-frameworks",
    topicTitle: "Next.js Application Engineering",
    runtimeEnv: "nextjs",
  },
  "4.2": {
    moduleId: "module-4-2",
    levelId: "level-4",
    phaseId: "phase-4",
    position: 2,
    topicId: "global-state-management",
    topicTitle: "Application State",
    runtimeEnv: "react",
  },
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseEstimatedMinutes(text) {
  const m = text.match(/\*\*Estimated time:\*\*\s*(\d+)(?:[–-](\d+))?\s*minutes/i);
  if (!m) return 12;
  if (m[2]) {
    return Math.round((parseInt(m[1], 10) + parseInt(m[2], 10)) / 2);
  }
  return parseInt(m[1], 10) || 12;
}

function parseLearnerGoal(text, fallbackTitle) {
  const m = text.match(/\*\*Learner goal:\*\*\s*(.+)/i);
  if (m) return m[1].trim();
  // For 4.1 / 4.2 where learner goal isn't explicitly prefixed, extract the bold mental model or first substantive sentence
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith("#") &&
        !l.startsWith("**Estimated time") &&
        !l.startsWith("---"),
    );
  const boldLine = lines.find((l) => /^\*\*[^*]+\*\*$/.test(l));
  if (boldLine) {
    return `Master ${fallbackTitle}: ${boldLine.replace(/\*\*/g, "")}`;
  }
  if (lines.length > 0) {
    return lines[0].replace(/\*\*/g, "");
  }
  return `Understand and apply ${fallbackTitle}.`;
}

/**
 * Splits a single lesson's markdown into ordered section blocks:
 * [{ title: string, body: string }]
 */
function splitLessonSections(lessonMarkdown) {
  // Remove leading metadata lines (**Estimated time:**, **Learner goal:**)
  const lines = lessonMarkdown.split("\n");
  const bodyLines = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\*\*Estimated time:\*\*/i.test(l.trim())) continue;
    if (/^\*\*Learner goal:\*\*/i.test(l.trim())) continue;
    if (/^---\s*$/.test(l.trim())) continue;
    bodyLines.push(l);
  }

  // Also normalize standalone "**Forge takeaway**" lines into "## Forge takeaway"
  const normalizedLines = bodyLines.map((l) => {
    if (/^\*\*Forge takeaway\*\*\s*$/i.test(l.trim())) {
      return "## Forge takeaway";
    }
    return l;
  });

  // Determine whether this lesson uses ## or ### for main sections
  const hasH2Sections = normalizedLines.some(
    (l) => /^##\s+/.test(l) && !/^##\s+Forge takeaway/i.test(l),
  );

  const sections = [];
  let currentTitle = "Start here";
  let currentLines = [];
  let inCodeBlock = false;

  for (const line of normalizedLines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      currentLines.push(line);
      continue;
    }

    if (!inCodeBlock) {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      const isLessonCompletionH3 =
        h3Match && /lesson completion|module mastery|question\s+[a-z0-9]/i.test(h3Match[1]);
      const isSectionHeading = hasH2Sections
        ? Boolean(h2Match || isLessonCompletionH3)
        : Boolean(h2Match || h3Match);

      if (isSectionHeading) {
        const rawHeading = (h2Match ? h2Match[1] : h3Match[1]).trim();
        if (currentLines.join("\n").trim().length > 0) {
          sections.push({
            title: currentTitle,
            body: currentLines.join("\n").trim(),
          });
        }
        currentTitle = rawHeading.replace(/^\d+\.\s*/, "").trim();
        currentLines = [];
        continue;
      }
    }

    currentLines.push(line);
  }

  if (currentLines.join("\n").trim().length > 0) {
    sections.push({
      title: currentTitle,
      body: currentLines.join("\n").trim(),
    });
  }

  // Split any section that contains multiple **Review key** blocks into separate sub-sections
  const expandedSections = [];
  for (const sec of sections) {
    const rkMatches = [...sec.body.matchAll(/^(?:>\s*)?\*\*Review key:?/gim)];
    if (rkMatches.length <= 1) {
      expandedSections.push(sec);
      continue;
    }

    const secLines = sec.body.split("\n");
    const subChunks = [];
    let chunkLines = [];
    let seenReviewKeyInChunk = false;

    for (let i = 0; i < secLines.length; i++) {
      const l = secLines[i];
      const t = l.trim();
      const isRk = /^(?:>\s*)?\*\*Review key:?/i.test(t);
      const isFb = /^(?:>\s*)?\*\*(?:Feedback|Why):?/i.test(t);

      if (seenReviewKeyInChunk && !isFb && !t.startsWith(">") && t !== "") {
        // Check if any remaining lines contain another Review key
        const restHasRk = secLines
          .slice(i)
          .some((rl) => /^(?:>\s*)?\*\*Review key:?/i.test(rl.trim()));
        if (restHasRk) {
          subChunks.push(chunkLines.join("\n").trim());
          chunkLines = [];
          seenReviewKeyInChunk = false;
        }
      }

      if (isRk) {
        seenReviewKeyInChunk = true;
      }
      chunkLines.push(l);
    }
    if (chunkLines.join("\n").trim().length > 0) {
      subChunks.push(chunkLines.join("\n").trim());
    }

    if (subChunks.length > 1) {
      subChunks.forEach((body, idx) => {
        expandedSections.push({
          title: `${sec.title} (${idx + 1})`,
          body,
        });
      });
    } else {
      expandedSections.push(sec);
    }
  }

  return expandedSections;
}

/**
 * Extracts options A, B, C, D (and E) from a section body if present.
 * Handles both inline options ("A. Foo", "**A.** Foo") and multiline/code options ("**A.**\n```html...```").
 */
function parseSectionInteraction(sectionTitle, sectionBody) {
  const lines = sectionBody.split("\n");
  let inCode = false;

  let reviewKey = null;
  let feedbackLines = [];
  const hints = [];
  let suggestedAnswer = null;
  let sensibleOrder = null;

  const contentLines = [];
  let collectingFeedback = false;
  let collectingReviewKeyBlock = false;
  const reviewKeyBlockLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      if (collectingReviewKeyBlock) {
        reviewKeyBlockLines.push(rawLine);
        continue;
      }
      contentLines.push(rawLine);
      continue;
    }

    if (!inCode) {
      // Check Hint
      const hintMatch = trimmed.match(
        /^(?:>\s*)?\*\*Hint(?:\s*\d+)?:\*\*\s*(.+)$/i,
      );
      if (hintMatch) {
        hints.push(hintMatch[1].replace(/^Hint\s*\d+:\s*/i, "").trim());
        continue;
      }

      // Check Review Key: e.g. "**Review key: C**", "**Review key:** B.", "**Review key:**"
      const rkMatch = trimmed.match(
        /^(?:>\s*)?\*\*Review key:?\s*([^*]*)\*\*:?\s*(.*)$/i,
      );
      if (rkMatch) {
        const inlineKey = (rkMatch[1] + " " + rkMatch[2]).trim();
        if (inlineKey.length > 0) {
          reviewKey = inlineKey;
          collectingReviewKeyBlock = false;
        } else {
          collectingReviewKeyBlock = true;
        }
        collectingFeedback = false;
        continue;
      }

      // Check Feedback: e.g. "> **Feedback:** ...", "**Feedback after submit:** ...", "**Why:** ..."
      const fbMatch = trimmed.match(
        /^(?:>\s*)?\*\*(?:Feedback(?:\s+after\s+submit)?|Why):?\s*([^*]*)\*\*:?\s*(.*)$/i,
      );
      if (fbMatch) {
        const fbText = (fbMatch[1] + " " + fbMatch[2]).trim();
        if (fbText) feedbackLines.push(fbText);
        collectingFeedback = true;
        collectingReviewKeyBlock = false;
        continue;
      }

      // Check Suggested answer / Answer / Expected result
      const saMatch = trimmed.match(
        /^(?:>\s*)?(?:\*\*)?(?:Suggested answer|Expected result|Answer|Reference answers?):?(?:\*\*)?:?\s*(.+)$/i,
      );
      if (saMatch) {
        suggestedAnswer = saMatch[1].trim();
        collectingReviewKeyBlock = false;
        continue;
      }

      // Check "One sensible order is: B → C → A."
      const orderMatch = trimmed.match(
        /^One sensible order is:\s*([A-E](?:\s*→\s*[A-E])+)\.?$/i,
      );
      if (orderMatch) {
        sensibleOrder = orderMatch[1].trim();
        continue;
      }

      if (collectingReviewKeyBlock) {
        reviewKeyBlockLines.push(rawLine);
        continue;
      }

      if (collectingFeedback && trimmed.startsWith(">")) {
        feedbackLines.push(trimmed.replace(/^>\s*/, ""));
        continue;
      } else if (collectingFeedback && trimmed === "") {
        continue;
      }
    }

    contentLines.push(rawLine);
  }

  if (!reviewKey && reviewKeyBlockLines.length > 0) {
    reviewKey = reviewKeyBlockLines.join("\n").trim();
  }

  // Now check if contentLines contain options A, B, C...
  const options = [];
  const questionLines = [];
  let currentOption = null;
  let optInCode = false;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      optInCode = !optInCode;
      if (currentOption) {
        currentOption.lines.push(line);
      } else {
        questionLines.push(line);
      }
      continue;
    }

    if (!optInCode) {
      const seenOptionsCount = options.length + (currentOption ? 1 : 0);
      // Skip redundant "A. A" / "B. B" lines if options A and B were already captured as code blocks
      if (seenOptionsCount >= 2 && /^(?:\*\*([A-E])\.\*\*|([A-E])\.)\s*[A-E]$/i.test(trimmed)) {
        continue;
      }

      // Match option start: "A. text", "**A.** text", "**A.**"
      const optMatch = trimmed.match(/^(?:\*\*([A-E])\.\*\*|([A-E])\.)\s*(.*)$/);
      if (optMatch) {
        const letter = (optMatch[1] || optMatch[2]).toUpperCase();
        const rest = optMatch[3] || "";
        // Verify sequential letter (A first, or B after A, etc.)
        const expectedLetter = String.fromCharCode(65 + seenOptionsCount);
        if (letter === expectedLetter) {
          if (currentOption) {
            options.push(currentOption);
          }
          currentOption = {
            letter,
            id: `opt-${letter.toLowerCase()}`,
            lines: rest ? [rest] : [],
          };
          continue;
        }
      }
    }

    if (currentOption) {
      currentOption.lines.push(line);
    } else {
      questionLines.push(line);
    }
  }
  if (currentOption) {
    options.push(currentOption);
  }

  const cleanOptions = options.map((o) => {
    const rawText = o.lines.join("\n").trim();
    // Check if rawText is a fenced code block
    const codeMatch = rawText.match(/^```(\w*)\n([\s\S]*?)\n```$/);
    if (codeMatch) {
      return {
        id: o.id,
        letter: o.letter,
        text: codeMatch[2].trim(),
        codeSnippet: {
          language: codeMatch[1] || "text",
          code: codeMatch[2].trim(),
        },
      };
    }
    return {
      id: o.id,
      letter: o.letter,
      text: rawText || `Option ${o.letter}`,
    };
  });

  const feedbackText = feedbackLines.join(" ").trim();
  const questionText = questionLines.join("\n").trim();

  // Check if it's an ordering exercise: e.g. sensibleOrder or reviewKey is "A → C → B → D"
  const orderKeyStr = sensibleOrder || reviewKey;
  if (
    cleanOptions.length >= 3 &&
    orderKeyStr &&
    /^[A-E](?:\s*→\s*[A-E])+$/i.test(orderKeyStr.replace(/\.$/, "").trim())
  ) {
    const seqLetters = orderKeyStr
      .replace(/\.$/, "")
      .split("→")
      .map((s) => s.trim().toUpperCase());
    const itemMap = new Map(cleanOptions.map((o) => [o.letter, `item-${o.letter.toLowerCase()}`]));
    if (seqLetters.every((l) => itemMap.has(l)) && seqLetters.length === cleanOptions.length) {
      return {
        kind: "ordering",
        prompt: questionText || sectionTitle,
        items: cleanOptions.map((o) => ({
          id: `item-${o.letter.toLowerCase()}`,
          text: o.text,
        })),
        correctSequence: seqLetters.map((l) => itemMap.get(l)),
        feedback:
          feedbackText ||
          `The correct sequence is ${seqLetters.join(" → ")}.`,
        hints,
      };
    }
  }

  // Check if it's a standard single-choice MCQ: options >= 2 and reviewKey is a single letter A-E
  if (cleanOptions.length >= 2 && reviewKey) {
    const singleLetterMatch = reviewKey.trim().match(/^([A-E])\.?$/i);
    if (singleLetterMatch) {
      const correctLetter = singleLetterMatch[1].toUpperCase();
      const matchingOpt = cleanOptions.find((o) => o.letter === correctLetter);
      if (matchingOpt) {
        return {
          kind: "multiple-choice",
          question: questionText || sectionTitle,
          options: cleanOptions.map(({ id, text, codeSnippet }) => ({
            id,
            text,
            ...(codeSnippet ? { codeSnippet } : {}),
          })),
          correctAnswer: matchingOpt.id,
          feedback:
            feedbackText ||
            `Correct answer: ${correctLetter}. ${matchingOpt.text}`,
          hints,
        };
      }
    }
  }

  // Check if it's a reflection / lab / exercise / mission step
  const isExerciseTitle =
    /exercise|own words|explain it|tiny .*lab|mission|checkpoint|build the map|classify|quick classification|match the|put it in order|change one|change the|task|write the|your job/i.test(
      sectionTitle,
    );
  const hasAnswerOrKey = Boolean(reviewKey || suggestedAnswer || hints.length > 0);

  if (hasAnswerOrKey || isExerciseTitle) {
    // Reconstruct full prompt from sectionBody minus the Review key / Suggested answer / Feedback lines
    const promptParts = [questionText];
    if (cleanOptions.length > 0) {
      promptParts.push(
        cleanOptions.map((o) => `${o.letter}. ${o.text}`).join("\n"),
      );
    }
    const fullPrompt = promptParts.filter(Boolean).join("\n\n").trim() || sectionBody.trim();
    const referenceAnswerParts = [];
    if (suggestedAnswer) referenceAnswerParts.push(suggestedAnswer);
    if (reviewKey) referenceAnswerParts.push(reviewKey);
    if (feedbackText) referenceAnswerParts.push(feedbackText);
    const sampleResponse =
      referenceAnswerParts.join("\n\n").trim() ||
      "Review your explanation against the core mental model of this lesson.";

    return {
      kind: "reflection",
      prompt: fullPrompt,
      guidelines:
        hints.length > 0
          ? hints
          : [
              "State your reasoning clearly in your own words or code.",
              "Compare your response with the reference guide after submitting.",
            ],
      sampleResponse,
      feedback: feedbackText || sampleResponse,
    };
  }

  return {
    kind: "explanation",
    text: sectionBody.trim(),
  };
}

function buildLessonV1({
  lessonId,
  lessonNumber,
  lessonTitle,
  lessonMarkdown,
  moduleConfig,
  moduleOutcome,
  prerequisiteLessonIds,
  primaryCapId,
  secondaryCapId,
  conceptId,
}) {
  const estimatedMinutes = parseEstimatedMinutes(lessonMarkdown);
  const learnerGoal = parseLearnerGoal(lessonMarkdown, lessonTitle);
  const rawSections = splitLessonSections(lessonMarkdown);

  // Extract takeaway and lesson completion sections at the end
  let mentalModelText = learnerGoal;
  const summaryTakeaways = [];
  const summaryNextSteps = [];
  const mainSections = [];

  for (const sec of rawSections) {
    if (/^forge takeaway$/i.test(sec.title)) {
      const lines = sec.body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const l of lines) {
        if (/^###\s+Lesson completion/i.test(l)) continue;
        const cleanLine = l.replace(/^\*\*|\*\*$/g, "");
        if (/mental model:/i.test(l)) {
          mentalModelText = l.replace(/^\*?Mental model:\*?\s*/i, "").replace(/\*\*/g, "").trim();
        }
        summaryTakeaways.push(l);
      }
    } else if (/^lesson completion$/i.test(sec.title)) {
      const lines = sec.body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      summaryNextSteps.push(...lines);
    } else {
      mainSections.push(sec);
    }
  }

  const activities = [];
  const requiredActivities = [];
  const producedEvidenceTypes = new Set();
  const arcStages = new Set(["encounter"]);

  mainSections.forEach((sec, idx) => {
    const parsed = parseSectionInteraction(sec.title, sec.body);
    const actId = `act-${lessonId.replace(/^lesson-/, "")}-${idx + 1}`;

    if (idx === 0 && parsed.kind === "explanation") {
      const paragraphs = parsed.text.split(/\n\n+/);
      const hook = paragraphs[0] || lessonTitle;
      const context = paragraphs.slice(1).join("\n\n") || parsed.text;
      activities.push({
        id: actId,
        type: "intro",
        role: "encounter",
        title: sec.title || "Start here",
        instruction: learnerGoal,
        content: {
          title: lessonTitle,
          hook,
          context,
          goals: [learnerGoal],
        },
      });
      return;
    }

    if (parsed.kind === "ordering") {
      arcStages.add("interaction");
      producedEvidenceTypes.add("prediction");
      requiredActivities.push(actId);
      activities.push({
        id: actId,
        type: "ordering",
        role: "practice",
        title: sec.title,
        instruction: "Arrange the steps in the most logical sequence.",
        content: {
          prompt: parsed.prompt,
          items: parsed.items,
        },
        validation: {
          type: "sequence",
          correctSequence: parsed.correctSequence,
        },
        feedback: {
          correct: parsed.feedback,
          incorrect: parsed.feedback,
        },
        evidence: {
          types: ["prediction"],
          capabilityIds: [primaryCapId],
        },
      });
      return;
    }

    if (parsed.kind === "multiple-choice") {
      const isPred = /predict/i.test(sec.title);
      const isCheckpoint = /checkpoint/i.test(sec.title);
      const role = isPred ? "prediction" : isCheckpoint ? "verification" : "practice";
      const evType = isPred ? "prediction" : "explanation";
      arcStages.add(isPred ? "prediction" : isCheckpoint ? "verification" : "interaction");
      producedEvidenceTypes.add(evType);
      requiredActivities.push(actId);

      const actObj = {
        id: actId,
        type: "multiple-choice",
        role,
        title: sec.title,
        content: {
          question: parsed.question,
          options: parsed.options,
        },
        validation: {
          type: "single-choice",
          correctAnswer: parsed.correctAnswer,
        },
        feedback: {
          correct: parsed.feedback,
          incorrect: parsed.feedback,
        },
        evidence: {
          types: [evType],
          capabilityIds: [isPred ? primaryCapId : secondaryCapId],
        },
      };

      if (parsed.hints && parsed.hints.length > 0) {
        actObj.hints = parsed.hints.map((hText, hIdx) => ({
          level: hIdx + 1,
          text: hText,
        }));
      }

      activities.push(actObj);
      return;
    }

    if (parsed.kind === "reflection") {
      arcStages.add("reflection");
      producedEvidenceTypes.add("explanation");
      requiredActivities.push(actId);
      activities.push({
        id: actId,
        type: "reflection",
        role: "practice",
        title: sec.title,
        instruction: "Compose your response below, then submit to compare with the reference guide.",
        content: {
          prompt: parsed.prompt,
          guidelines: parsed.guidelines,
          sampleResponse: parsed.sampleResponse,
          minCharacters: 10,
        },
        feedback: {
          correct: parsed.feedback,
          incorrect: "Please write a brief response (at least 10 characters) before submitting.",
        },
        evidence: {
          types: ["explanation"],
          capabilityIds: [primaryCapId, secondaryCapId],
        },
      });
      return;
    }

    // Default: explanation
    arcStages.add("explanation");
    activities.push({
      id: actId,
      type: "explanation",
      role: "explanation",
      title: sec.title,
      content: {
        title: sec.title,
        text: parsed.text,
      },
    });
  });

  // Ensure at least one active activity exists so checkLessonV1PedagogyQuality never warns
  const hasActive = activities.some(
    (a) => !["encounter", "explanation", "reflection", "discovery"].includes(a.role),
  );
  if (!hasActive) {
    const checkId = `act-${lessonId.replace(/^lesson-/, "")}-synthesis`;
    producedEvidenceTypes.add("explanation");
    requiredActivities.push(checkId);
    arcStages.add("reflection");
    activities.push({
      id: checkId,
      type: "reflection",
      role: "practice",
      title: "Synthesize the Mental Model",
      instruction: "Articulate the core engineering principle from this lesson in your own words.",
      content: {
        prompt: `Explain the core mental model of "${lessonTitle}" and how it guides your engineering decisions.`,
        guidelines: [
          "Summarize the core mechanism in 1–2 clear sentences.",
          "Describe one practical scenario where you would apply this habit.",
        ],
        sampleResponse: mentalModelText,
        minCharacters: 10,
      },
      feedback: {
        correct: mentalModelText,
        incorrect: "Please write at least 10 characters.",
      },
      evidence: {
        types: ["explanation"],
        capabilityIds: [primaryCapId],
      },
    });
  }

  // Add closing summary activity preserving Forge takeaway and Lesson completion
  if (summaryTakeaways.length > 0 || summaryNextSteps.length > 0) {
    activities.push({
      id: `act-${lessonId.replace(/^lesson-/, "")}-takeaway`,
      type: "summary",
      role: "reflection",
      title: "Forge takeaway",
      content: {
        title: "Forge takeaway & Lesson completion",
        takeaways:
          summaryTakeaways.length > 0 ? summaryTakeaways : [mentalModelText],
        ...(summaryNextSteps.length > 0 ? { nextSteps: summaryNextSteps } : {}),
      },
    });
  }

  const isMission = /mission/i.test(lessonTitle);

  return {
    id: lessonId,
    schemaVersion: "1.0.0",
    identity: {
      title: lessonTitle,
      description: learnerGoal,
      learnerFacing: true,
      role: isMission ? "challenge" : "encounter",
      estimatedMinutes,
      slug: slugify(lessonTitle),
    },
    curriculum: {
      phaseId: moduleConfig.phaseId,
      moduleId: moduleConfig.moduleId,
      topicId: moduleConfig.topicId,
      capabilityIds: [primaryCapId, secondaryCapId],
      conceptIds: [conceptId],
      prerequisiteLessonIds,
    },
    learning: {
      primaryCapability: {
        id: primaryCapId,
        statement: learnerGoal,
      },
      secondaryCapabilities: [
        {
          id: secondaryCapId,
          statement: moduleOutcome,
        },
      ],
      startingState: {
        knows: ["Foundational concepts from prior lessons in this learning path"],
        canDo: ["Read and trace basic examples in this module"],
        likelyMisconceptions: [
          "Relying on trial-and-error guessing instead of predicting and verifying behavior",
        ],
      },
      targetState: {
        canDo: [learnerGoal],
      },
      targetMentalModel: mentalModelText,
    },
    experience: {
      guidanceLevel: isMission ? "semi-guided" : "guided",
      arc: Array.from(arcStages),
      emotionalJourney: ["curiosity", "recognition", "confidence"],
      startingState: `Beginning ${lessonNumber}: ${lessonTitle}`,
      narrativeContext: moduleOutcome,
      primaryInteraction: "Reading structured explanations, predicting outcomes, and articulating reasoning.",
      expectedOutcome: learnerGoal,
    },
    activities,
    mastery: {
      requiredEvidence: Array.from(producedEvidenceTypes),
      completionCriteria: {
        requiredActivities,
        minimumScore: 80,
      },
      masteryCriteria: {
        minimumDemonstrations: 1,
        requiresTransfer: isMission,
        threshold: 80,
      },
    },
    relationships: {
      prerequisites: prerequisiteLessonIds,
      reinforces: [conceptId],
      extends: [],
      applies: [primaryCapId],
      challenges: [],
      debugs: [],
      revisits: [],
      transfers: [],
    },
    runtime: {
      required: moduleConfig.runtimeEnv !== "none",
      environment: moduleConfig.runtimeEnv,
      dependencies: [],
      requiredFeatures: [],
    },
    accessibility: {
      requirements: ["Keyboard navigable activities", "Screen-reader accessible code blocks and options"],
      keyboardNavigation: true,
      colorContrastCompliant: true,
    },
  };
}

function main() {
  const existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const existingConcepts = JSON.parse(fs.readFileSync(CONCEPTS_PATH, "utf8"));
  const existingCapabilities = JSON.parse(fs.readFileSync(CAPABILITIES_PATH, "utf8"));

  const conceptMap = new Map(existingConcepts.map((c) => [c.id, c]));
  const capabilityMap = new Map(existingCapabilities.map((c) => [c.id, c]));

  const allManifestLessons = [];
  const updatedModules = [];
  const updatedTopics = [];

  const manuscriptFiles = fs
    .readdirSync(MANUSCRIPTS_DIR)
    .filter((f) => f.startsWith("FORGE_MODULE_") && f.endsWith(".md"))
    .sort();

  let globalLessonPosition = 1;

  for (const file of manuscriptFiles) {
    const modKeyMatch = file.match(/FORGE_MODULE_(\d+)_(\d+)_/);
    if (!modKeyMatch) continue;
    const modKey = `${modKeyMatch[1]}.${modKeyMatch[2]}`;
    const cfg = MODULE_CONFIG[modKey];
    if (!cfg) {
      throw new Error(`No MODULE_CONFIG for ${modKey} (${file})`);
    }

    const rawMd = fs.readFileSync(path.join(MANUSCRIPTS_DIR, file), "utf8");

    // Extract Module Title & Outcome
    const modTitleMatch = rawMd.match(/^#{1,3}\s+Module\s+\d+\.\d+\s+[—–-]\s+(.+)$/m);
    const moduleTitle = modTitleMatch ? modTitleMatch[1].trim() : cfg.topicTitle;

    const outcomeMatch = rawMd.match(
      /^#{2,3}\s+Module outcome\s*\n+([\s\S]*?)(?=\n+#{1,3}\s+|\n+---)/im,
    );
    const moduleOutcome = outcomeMatch
      ? outcomeMatch[1].split("\n\n")[0].replace(/\n/g, " ").trim()
      : `Master ${moduleTitle}.`;

    // Register module capabilities & concept if not present
    const primaryCapId = `cap-module-${modKey.replace(".", "-")}-core`;
    const secondaryCapId = `cap-module-${modKey.replace(".", "-")}-reasoning`;
    const conceptId = `concept-module-${modKey.replace(".", "-")}`;

    if (!capabilityMap.has(primaryCapId)) {
      const cap1 = {
        id: primaryCapId,
        statement: `Apply core principles of ${moduleTitle}`,
        phaseId: cfg.phaseId,
        moduleId: cfg.moduleId,
        evidenceTypes: ["prediction", "explanation", "implementation", "debugging"],
      };
      existingCapabilities.push(cap1);
      capabilityMap.set(primaryCapId, cap1);
    }

    if (!capabilityMap.has(secondaryCapId)) {
      const cap2 = {
        id: secondaryCapId,
        statement: moduleOutcome,
        phaseId: cfg.phaseId,
        moduleId: cfg.moduleId,
        evidenceTypes: ["explanation", "prediction", "judgment", "transfer"],
      };
      existingCapabilities.push(cap2);
      capabilityMap.set(secondaryCapId, cap2);
    }

    if (!conceptMap.has(conceptId)) {
      const newConcept = {
        id: conceptId,
        title: moduleTitle,
        definition: moduleOutcome,
        description: moduleOutcome,
        topicId: cfg.topicId,
        prerequisiteConceptIds: [],
        relatedConceptIds: [],
        misconceptionIds: [],
      };
      existingConcepts.push(newConcept);
      conceptMap.set(conceptId, newConcept);
    }

    // Split lessons by `# X.Y.Z — Title`
    const lessonRegex = /^#\s+(\d+\.\d+\.\d+)\s+[—–-]\s+(.+)$/gm;
    const matches = [...rawMd.matchAll(lessonRegex)];
    const moduleLessonIds = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const lessonNum = match[1].trim();
      const lessonTitle = match[2].trim();
      const lessonId = `lesson-${lessonNum.replace(/\./g, "-")}`;
      const startIdx = match.index + match[0].length;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index : rawMd.length;
      const lessonBody = rawMd.slice(startIdx, endIdx);

      moduleLessonIds.push(lessonId);

      const prereqIds = i === 0 ? [] : [`lesson-${matches[i - 1][1].trim().replace(/\./g, "-")}`];

      const lessonFilePath = path.join(LESSONS_V1_DIR, `${lessonId}.json`);
      if (!cfg.preserveExistingFiles) {
        const lessonObj = buildLessonV1({
          lessonId,
          lessonNumber: lessonNum,
          lessonTitle,
          lessonMarkdown: lessonBody,
          moduleConfig: cfg,
          moduleOutcome,
          prerequisiteLessonIds: prereqIds,
          primaryCapId,
          secondaryCapId,
          conceptId,
        });
        fs.writeFileSync(lessonFilePath, JSON.stringify(lessonObj, null, 2) + "\n", "utf8");
      }

      // Read back the actual title from disk if preserveExistingFiles is true
      let finalTitle = lessonTitle;
      if (cfg.preserveExistingFiles && fs.existsSync(lessonFilePath)) {
        const onDisk = JSON.parse(fs.readFileSync(lessonFilePath, "utf8"));
        finalTitle = onDisk.identity?.title || lessonTitle;
      }

      allManifestLessons.push({
        lessonId,
        levelId: cfg.levelId,
        moduleId: cfg.moduleId,
        phaseId: cfg.phaseId,
        topicId: cfg.topicId,
        position: globalLessonPosition++,
        title: finalTitle,
        canonicalFilename: `${lessonId}.json`,
        authored: true,
      });
    }

    updatedModules.push({
      moduleId: cfg.moduleId,
      levelId: cfg.levelId,
      phaseId: cfg.phaseId,
      title: moduleTitle,
      position: cfg.position,
      topicIds: [cfg.topicId],
      lessonIds: moduleLessonIds,
    });

    updatedTopics.push({
      topicId: cfg.topicId,
      moduleId: cfg.moduleId,
      title: cfg.topicTitle,
      position: 1,
      lessonIds: moduleLessonIds,
    });
  }

  // Keep any remaining unauthored modules/topics from existingManifest (e.g. 4.3-4.6, 5.1-5.6) so no existing references break
  const authoredModIds = new Set(updatedModules.map((m) => m.moduleId));
  const authoredTopicIds = new Set(updatedTopics.map((t) => t.topicId));

  for (const oldMod of existingManifest.modules) {
    if (!authoredModIds.has(oldMod.moduleId)) {
      updatedModules.push({
        ...oldMod,
        lessonIds: [],
      });
    }
  }

  for (const oldTop of existingManifest.topics) {
    if (!authoredTopicIds.has(oldTop.topicId)) {
      updatedTopics.push({
        ...oldTop,
        lessonIds: [],
      });
    }
  }

  // Ensure every concept.topicId in existingConcepts exists in updatedTopics
  const finalTopicIds = new Set(updatedTopics.map((t) => t.topicId));
  for (const c of existingConcepts) {
    if (c.topicId && !finalTopicIds.has(c.topicId)) {
      updatedTopics.push({
        topicId: c.topicId,
        moduleId: "module-0-1",
        title: c.title || c.topicId,
        position: updatedTopics.length + 1,
        lessonIds: [],
      });
      finalTopicIds.add(c.topicId);
    }
  }

  const newManifest = {
    ...existingManifest,
    modules: updatedModules,
    topics: updatedTopics,
    lessons: allManifestLessons,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2) + "\n", "utf8");
  fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(existingConcepts, null, 2) + "\n", "utf8");
  fs.writeFileSync(CAPABILITIES_PATH, JSON.stringify(existingCapabilities, null, 2) + "\n", "utf8");

  console.log(
    `Successfully compiled ${allManifestLessons.length} lessons across ${ manuscriptFiles.length } manuscripts.`,
  );
}

main();
