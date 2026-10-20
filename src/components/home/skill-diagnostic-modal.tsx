import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Code2,
  Layers,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DiagnosticQuestion {
  id: string;
  domain: string;
  prompt: string;
  codeSnippet?: string;
  options: {
    label: string;
    points: number;
    explanation: string;
  }[];
}

const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "q1-box-layout",
    domain: "01 · HTML & CSS Layout Systems",
    prompt:
      "An element has `width: 240px; padding: 20px; border: 2px solid;` and `box-sizing: content-box`. What is its rendered border-box width, and how does `border-box` change it?",
    codeSnippet: `.card {\n  box-sizing: content-box;\n  width: 240px;\n  padding: 20px;\n  border: 2px solid #334155;\n}`,
    options: [
      {
        label: "I'm brand new to HTML & CSS layout models — start me from first principles",
        points: 0,
        explanation: "We will start at Module 0.1 & 1.1 to build your mental model from the ground up.",
      },
      {
        label: "240px in both modes because padding and border sit inside width",
        points: 1,
        explanation: "In content-box, padding and border add onto width (240 + 40 + 4 = 284px).",
      },
      {
        label: "284px in content-box; switching to border-box constrains total width to 240px",
        points: 3,
        explanation: "Spot on — content-box adds 40px padding + 4px border, whereas border-box absorbs them.",
      },
    ],
  },
  {
    id: "q2-js-closures",
    domain: "02 · JavaScript Execution & Closures",
    prompt:
      "What happens when an async callback inside a loop or event handler references a variable from an outer lexical scope?",
    codeSnippet: `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}`,
    options: [
      {
        label: "I haven't worked with JavaScript functions or closures yet",
        points: 0,
        explanation: "You'll master execution traces and closures step-by-step in Module 2.1.",
      },
      {
        label: "The variable resets to 0 on every call because the outer function finished running",
        points: 1,
        explanation: "The returned function retains a live closure over the outer lexical environment.",
      },
      {
        label: "The inner function closes over the outer lexical environment, preserving `count` across invocations",
        points: 3,
        explanation: "Correct — lexical closures retain references to their outer scope bindings on the heap.",
      },
    ],
  },
  {
    id: "q3-ts-contracts",
    domain: "03 · TypeScript & UI State Contracts",
    prompt:
      "Why do production frontend teams prefer a discriminated union (`status: 'idle' | 'loading' | 'success' | 'error'`) over separate boolean flags (`isLoading`, `isError`, `data`)?",
    options: [
      {
        label: "I'm new to TypeScript and state modeling",
        points: 0,
        explanation: "Module 2.3 & 2.5 teach TypeScript contracts and state machines from scratch.",
      },
      {
        label: "It makes impossible states (like `isLoading: true` and `isError: true` simultaneously) unrepresentable and enables exhaustive type narrowing",
        points: 3,
        explanation: "Exact — discriminated unions eliminate impossible UI states at compile time.",
      },
      {
        label: "It only reduces bundle size at runtime",
        points: 1,
        explanation: "TypeScript types are erased at build time; the benefit is compile-time state safety.",
      },
    ],
  },
  {
    id: "q4-react-architecture",
    domain: "04 · React Rendering & Hook Lifecycle",
    prompt:
      "In a React component, when should a value be computed during render (`const total = items.reduce(...)`) instead of stored in `useState` + synchronized via `useEffect`?",
    options: [
      {
        label: "I haven't built React components with hooks yet",
        points: 0,
        explanation: "Modules 3.1–3.4 take you from JSX fundamentals to advanced React architecture.",
      },
      {
        label: "Whenever the value is deterministically derived from existing props or state — avoiding extra render passes and stale state bugs",
        points: 3,
        explanation: "Spot on — derived state should be calculated during render, never mirrored in useEffect.",
      },
      {
        label: "Always use `useState` + `useEffect` so React knows when to update the DOM",
        points: 1,
        explanation: "Mirroring derived state in useEffect causes redundant double-renders and synchronization bugs.",
      },
    ],
  },
];

interface PlacementRecommendation {
  tierTitle: string;
  moduleCode: string;
  moduleId: string;
  lessonId: string;
  summary: string;
  highlights: string[];
}

function getRecommendation(score: number): PlacementRecommendation {
  if (score <= 3) {
    return {
      tierTitle: "Track 01 · Foundations & Web Systems",
      moduleCode: "Module 0.1 → Module 1.1",
      moduleId: "module-0-1",
      lessonId: "lesson-0-1-1",
      summary:
        "Start at the foundational system layer. You will trace how browsers request, parse, and render HTML/CSS/JS before building semantic documents and interactive layouts.",
      highlights: [
        "Interactive HTTP RequestFlow & ComputerPipeline visualizers",
        "Semantic HTML5 & Document Landmark Architecture",
        "Guided Replicate-This UI Studio from zero to production",
      ],
    };
  }
  if (score <= 6) {
    return {
      tierTitle: "Track 02 · CSS Layout, Web Design Craft & Responsive UI",
      moduleCode: "Module 1.2 → Module 1.4",
      moduleId: "module-1-2",
      lessonId: "lesson-1-2-1",
      summary:
        "You have foundational familiarity. Jump directly into CSS Box Model, Flexbox, CSS Grid, Typography Scale, and WCAG Contrast studios to master visual UI engineering.",
      highlights: [
        "Live BoxModelStudio & FlexGridStudio interactive sandboxes",
        "Typography scale, optical hierarchy & WCAG AA/AAA contrast labs",
        "Side-by-side DOM/CSS Replicate-This challenges",
      ],
    };
  }
  if (score <= 9) {
    return {
      tierTitle: "Track 03 · JavaScript Mechanics, DOM & TypeScript Contracts",
      moduleCode: "Module 2.1 → Module 2.5",
      moduleId: "module-2-1",
      lessonId: "lesson-2-1-1",
      summary:
        "Your HTML/CSS foundation is solid. Start at JavaScript execution models, closures, async network resilience, and TypeScript discriminated union contracts.",
      highlights: [
        "Step-by-step closure, memory reference & event loop labs",
        "Async fetch resilience, race condition & error recovery drills",
        "TypeScript UI contracts & state architecture patterns",
      ],
    };
  }
  return {
    tierTitle: "Track 04 · React Architecture, Design Systems & Production Polish",
    moduleCode: "Module 3.1 → Module 4.2",
    moduleId: "module-3-1",
    lessonId: "lesson-3-1-1",
    summary:
      "You have strong core frontend instincts. Dive straight into React component composition, hook lifecycle debugging, multi-token Design Systems, and Core Web Vitals polish.",
    highlights: [
      "React render-cycle, custom hooks & stale-closure debugging",
      "Design System token architecture & compound component APIs",
      "WCAG keyboard accessibility & performance optimization",
    ],
  };
}

interface SkillDiagnosticModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkillDiagnosticModal({ open, onOpenChange }: SkillDiagnosticModalProps) {
  const navigate = useNavigate();
  const { setLastActiveLesson } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);

  const currentQuestion = QUESTIONS[stepIndex];
  const totalScore = Object.values(answers).reduce((acc, v) => acc + v, 0);
  const recommendation = getRecommendation(totalScore);

  const handleSelectOption = (points: number) => {
    const nextAnswers = { ...answers, [currentQuestion.id]: points };
    setAnswers(nextAnswers);
    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setAnswers({});
    setCompleted(false);
  };

  const handleLaunchRecommended = () => {
    setLastActiveLesson(recommendation.lessonId);
    onOpenChange(false);
    toast.success(`Calibrated to ${recommendation.moduleCode}`);
    void navigate({
      to: "/lesson/$lessonId",
      params: { lessonId: recommendation.lessonId },
      search: { mode: "curriculum" },
    });
  };

  const handleViewModule = () => {
    setLastActiveLesson(recommendation.lessonId);
    onOpenChange(false);
    void navigate({
      to: "/learn/modules/$moduleId",
      params: { moduleId: recommendation.moduleId },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border bg-card p-0 overflow-hidden">
        <div className="border-b border-border/70 bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Compass className="h-3.5 w-3.5" />
              60-Second Skill Placement Diagnostic
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {completed ? "Calibrated" : `Step ${stepIndex + 1} of ${QUESTIONS.length}`}
            </span>
          </div>
          <DialogHeader className="mt-1.5 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {completed ? "Your Calibrated Forge Track" : currentQuestion.domain}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {completed
                ? "Based on your responses across HTML/CSS, JavaScript, TypeScript, and React architecture."
                : "Select the answer that best matches your current engineering mental model."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {!completed ? (
          <div className="space-y-5 p-6">
            {/* Step progress bar */}
            <div className="grid grid-cols-4 gap-1.5">
              {QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    idx < stepIndex
                      ? "bg-primary"
                      : idx === stepIndex
                        ? "bg-primary/60"
                        : "bg-muted",
                  )}
                />
              ))}
            </div>

            <p className="text-sm font-medium leading-relaxed text-foreground">
              {currentQuestion.prompt}
            </p>

            {currentQuestion.codeSnippet && (
              <pre className="overflow-x-auto rounded-lg border border-border bg-background/80 p-3.5 font-mono text-xs leading-relaxed text-foreground">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt.points)}
                  className="group flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-background/50 p-3.5 text-left text-xs sm:text-sm transition-colors hover:border-primary/60 hover:bg-primary/5"
                >
                  <span className="leading-relaxed text-foreground group-hover:text-primary transition-colors">
                    {opt.label}
                  </span>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                </button>
              ))}
            </div>

            {stepIndex > 0 && (
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStepIndex(stepIndex - 1)}
                  className="text-xs"
                >
                  Previous question
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                  {recommendation.moduleCode}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  Diagnostic Score: {totalScore} / 12
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {recommendation.tierTitle}
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {recommendation.summary}
              </p>

              <ul className="space-y-1.5 pt-2 border-t border-border/60">
                {recommendation.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake diagnostic
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewModule}
                  className="gap-1.5 text-xs"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Inspect Module Syllabus
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLaunchRecommended}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch Recommended Lesson
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
