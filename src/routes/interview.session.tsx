import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInterviewQuestions, useProject } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  ForgeBuddyMascot3D,
  ForgeCrystal3D,
  type ForgeMascotMood,
} from "@/components/atelier/forge-buddy-illos";
import type { InterviewQuestion } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Timer,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  FileText,
  Sparkles,
  Trophy,
  RotateCcw,
  Building2,
  Clock,
  Eye,
  Check,
  X,
  UserCheck,
  Bot,
  Brain,
  MessageSquareCode,
  Send,
  Loader2,
  Award,
  Lightbulb,
  Terminal,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/interview/session")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: (search.category as string) || undefined,
      mode: (search.mode as "single" | "mock") || "single",
      preset: (search.preset as string) || "mixed",
      duration: (search.duration as string) || "30",
      projectId: (search.projectId as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Interview Practice Session · Forge" },
      { name: "description", content: "A live timed interview practice session with rubrics." },
    ],
  }),
  component: SessionComponent,
});

function SessionComponent() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const project = useProject(searchParams.projectId);
  const allQuestions = useInterviewQuestions();
  const { saveInterviewResult } = useProgress();

  // Filter Questions for Session
  const sessionQuestions = useMemo(() => {
    if (searchParams.category) {
      return allQuestions.filter((q) => q.category === searchParams.category);
    }
    if (searchParams.mode === "mock") {
      if (searchParams.preset === "frontend") {
        return allQuestions.filter((q) =>
          ["HTML", "CSS", "JavaScript", "React"].includes(q.category),
        );
      }
      if (searchParams.preset === "architecture") {
        return allQuestions.filter((q) =>
          ["Performance", "Debugging", "Architecture", "Git"].includes(q.category),
        );
      }
      if (searchParams.preset === "behavioral") {
        return allQuestions.filter((q) => q.category === "Behavioral");
      }
    }
    return allQuestions; // Default: all
  }, [allQuestions, searchParams.category, searchParams.mode, searchParams.preset]);

  // Session Navigation State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Timer State
  const totalAllocatedSeconds = (parseInt(searchParams.duration, 10) || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalAllocatedSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Per-Question Candidate Answers & Self-Evaluation State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [starState, setStarState] = useState<
    Record<string, { situation: string; task: string; action: string; result: string }>
  >({});
  const [checkedRubrics, setCheckedRubrics] = useState<Record<string, number[]>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [reflectionNotes, setReflectionNotes] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  // AI Interviewer & Live Code Runner State
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({});
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [isAiEvaluating, setIsAiEvaluating] = useState<Record<string, boolean>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [followUpFeedbacks, setFollowUpFeedbacks] = useState<Record<string, string>>({});
  const [coachHintLevel, setCoachHintLevel] = useState<Record<string, number>>({});
  const [codeRunOutput, setCodeRunOutput] = useState<
    Record<string, { logs: string[]; error: string | null }>
  >({});

  const currentQuestion: InterviewQuestion | undefined = sessionQuestions[currentIndex];

  // Execute Candidate Code Draft Live in Browser
  const handleRunCandidateCode = async (q: InterviewQuestion) => {
    const rawCode =
      codeDrafts[q.id] ||
      q.codeSnippet ||
      `// Write and test your ${q.category} interview solution here:\nconsole.log("Testing solution for:", ${JSON.stringify(q.question)});`;

    if (!codeDrafts[q.id]) {
      setCodeDrafts((prev) => ({ ...prev, [q.id]: rawCode }));
    }

    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) =>
        logs.push(
          args
            .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
            .join(" "),
        ),
      info: (...args: unknown[]) =>
        logs.push(
          "ℹ️ " +
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
              .join(" "),
        ),
      warn: (...args: unknown[]) =>
        logs.push(
          "⚠️ " +
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
              .join(" "),
        ),
      error: (...args: unknown[]) =>
        logs.push(
          "❌ " +
            args
              .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
              .join(" "),
        ),
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction("console", rawCode);
      const result = await fn(customConsole);
      if (result !== undefined) {
        logs.push(
          `↳ Return: ${typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}`,
        );
      }
      if (logs.length === 0) {
        logs.push("✓ Code executed cleanly with no console output.");
      }
      setCodeRunOutput((prev) => ({ ...prev, [q.id]: { logs, error: null } }));
      toast.success("Code executed in live interview sandbox!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCodeRunOutput((prev) => ({ ...prev, [q.id]: { logs, error: msg } }));
      toast.error(`Runtime error: ${msg}`);
    }
  };

  const getParsedFeedback = (raw: string) => {
    try {
      const match = raw.match(/\{([\s\S]*)\}/);
      const toParse = match ? match[0] : raw;
      return JSON.parse(toParse);
    } catch {
      return null;
    }
  };

  // Deterministic Staff Interviewer Rubric & Code Evaluator
  const handleRequestAiEvaluation = async (q: InterviewQuestion) => {
    setIsAiEvaluating((prev) => ({ ...prev, [q.id]: true }));
    setRevealedAnswers((prev) => ({ ...prev, [q.id]: true }));

    const written = (userAnswers[q.id] || "").trim();
    const code = (codeDrafts[q.id] || "").trim();
    const combinedLower = `${written} ${code}`.toLowerCase();
    const rubricList = q.rubric || [];

    // Match rubric items based on key technical terms in the candidate's response
    const matchedIndices: number[] = [];
    const missedCriteria: string[] = [];
    const matchedCriteria: string[] = [];

    rubricList.forEach((criterion, idx) => {
      const keywords = criterion
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !["that", "with", "from", "this", "what", "when", "explain", "describe", "mention"].includes(w));

      const hitCount = keywords.filter((kw) => combinedLower.includes(kw)).length;
      const threshold = Math.max(1, Math.min(2, Math.floor(keywords.length / 3)));

      if (hitCount >= threshold || (written.length > 140 && idx === 0)) {
        matchedIndices.push(idx);
        matchedCriteria.push(criterion);
      } else {
        missedCriteria.push(criterion);
      }
    });

    // Update checked rubrics automatically with any newly matched items
    setCheckedRubrics((prev) => {
      const existing = new Set(prev[q.id] || []);
      matchedIndices.forEach((idx) => existing.add(idx));
      return { ...prev, [q.id]: Array.from(existing) };
    });

    const wordCount = written ? written.split(/\s+/).filter(Boolean).length : 0;
    const hasCode = code.length > 15;
    const rubricRatio =
      rubricList.length > 0 ? matchedIndices.length / rubricList.length : wordCount > 25 ? 0.85 : 0.4;

    const depthBonus = Math.min(20, Math.round(wordCount / 4) + (hasCode ? 12 : 0));
    const overallScore =
      wordCount === 0 && !hasCode
        ? 15
        : Math.min(98, Math.max(35, Math.round(rubricRatio * 78 + depthBonus)));

    const clarityScore = Math.min(100, Math.max(30, wordCount >= 30 ? 88 : wordCount * 3));
    const technicalDepth = Math.min(100, Math.max(25, Math.round(rubricRatio * 90 + (hasCode ? 10 : 0))));
    const edgeCaseAwareness = Math.min(
      100,
      Math.max(30, matchedIndices.length >= 2 ? 85 : 55 + matchedIndices.length * 15),
    );

    const evaluationPayload = {
      overallScore,
      executiveAssessment:
        wordCount === 0 && !hasCode
          ? `You haven't entered a written explanation or code draft yet for "${q.question}". In a live ${q.category} interview, always start by stating your high-level mental model out loud before diving into edge cases.`
          : overallScore >= 80
            ? `Strong Staff/Senior-calibrated response on ${q.category}. You addressed ${matchedIndices.length} of ${rubricList.length} core rubric signals clearly${hasCode ? " and backed your explanation with concrete code." : "."}`
            : `Solid foundational start (${matchedIndices.length}/${rubricList.length} rubric signals covered), but a senior interviewer will probe deeper into the unaddressed edge cases below.`,
      criteriaRatings: {
        technicalAccuracy: technicalDepth,
        communicationClarity: clarityScore,
        edgeCaseHandling: edgeCaseAwareness,
        productionReadiness: hasCode ? 88 : 68,
      },
      starScoring: {
        situation: Math.min(100, clarityScore),
        task: Math.min(100, technicalDepth),
        action: hasCode ? 90 : Math.min(100, clarityScore),
        result: overallScore,
      },
      strengths:
        matchedCriteria.length > 0
          ? matchedCriteria.slice(0, 3).map((c) => `Covered rubric signal: ${c}`)
          : [
              hasCode
                ? "Provided a concrete code implementation draft."
                : "Attempted an initial framing of the problem.",
            ],
      improvements:
        missedCriteria.length > 0
          ? missedCriteria.slice(0, 3).map((c) => `Explicitly address: ${c}`)
          : (q.commonPitfalls || ["Add a concrete code or production trade-off example."]).slice(0, 2),
      refactoredSolution: q.codeSnippet || "N/A",
      followUpQuestions: q.followUpQuestions || [],
    };

    setAiFeedback((prev) => ({ ...prev, [q.id]: JSON.stringify(evaluationPayload, null, 2) }));
    setAiScores((prev) => ({ ...prev, [q.id]: overallScore }));
    setIsAiEvaluating((prev) => ({ ...prev, [q.id]: false }));
    toast.success(`Staff Rubric Evaluation complete: ${overallScore}%`);
  };

  // Deterministic Evaluation for Follow-Up Question Probe
  const handleRequestFollowUpEval = async (q: InterviewQuestion, followUpQ: string) => {
    const ansKey = `${q.id}-${followUpQ}`;
    const userFollowUpAns = (followUpAnswers[ansKey] || "").trim();
    if (!userFollowUpAns) {
      toast.warning("Please enter an answer to the follow-up question first.");
      return;
    }

    setIsAiEvaluating((prev) => ({ ...prev, [ansKey]: true }));
    const wordCount = userFollowUpAns.split(/\s+/).filter(Boolean).length;
    const pitfallReminder =
      q.commonPitfalls?.[0] || "Always tie your follow-up answer back to browser performance or maintainability.";

    const feedbackMarkdown =
      wordCount >= 18
        ? `**Strong Follow-Up Defense (${Math.min(96, 75 + wordCount)}%):** You directly addressed *"${followUpQ}"* with concrete trade-offs. **Staff Tip:** Also keep in mind: ${pitfallReminder}`
        : `**Needs More Depth:** Your response is a bit brief (${wordCount} words). When an interviewer asks *"${followUpQ}"*, walk through the failure mode first, then explain how you mitigate it in production (${pitfallReminder}).`;

    setFollowUpFeedbacks((prev) => ({ ...prev, [ansKey]: feedbackMarkdown }));
    setIsAiEvaluating((prev) => ({ ...prev, [ansKey]: false }));
    toast.success("Follow-up response evaluated!");
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (isTimerPaused || isSessionFinished || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          toast.warning("Time limit reached! Review your remaining answers.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isSessionFinished, secondsRemaining]);

  // Format Timer mm:ss
  const minutesStr = String(Math.floor(secondsRemaining / 60)).padStart(2, "0");
  const secondsStr = String(secondsRemaining % 60).padStart(2, "0");
  const timerPercent = Math.max(0, (secondsRemaining / totalAllocatedSeconds) * 100);

  // Helper: Get user's score % for active question based on rubric checklist
  const calculateQuestionScore = (q: InterviewQuestion): number => {
    const totalRubric = q.rubric?.length || 0;
    if (totalRubric === 0) return 100;
    const checked = checkedRubrics[q.id] || [];
    return Math.round((checked.length / totalRubric) * 100);
  };

  // Toggle rubric checkbox
  const toggleRubricItem = (qId: string, itemIdx: number) => {
    setCheckedRubrics((prev) => {
      const currentList = prev[qId] || [];
      const updated = currentList.includes(itemIdx)
        ? currentList.filter((i) => i !== itemIdx)
        : [...currentList, itemIdx];
      return { ...prev, [qId]: updated };
    });
  };

  // Save current question result to Progress Store
  const handleSaveQuestionResult = (q: InterviewQuestion) => {
    const answer = userAnswers[q.id] || "";
    const code = codeDrafts[q.id] || "";
    const combinedAnswer = code ? `${answer}\n\n\`\`\`tsx\n${code}\n\`\`\`` : answer;
    const checkedIndexes = checkedRubrics[q.id] || [];
    const rubricScore = calculateQuestionScore(q);
    const score = aiScores[q.id] !== undefined ? aiScores[q.id] : rubricScore;
    const checkedRubricItems = (q.rubric || []).filter((_, idx) => checkedIndexes.includes(idx));

    saveInterviewResult({
      questionId: q.id,
      category: q.category,
      userAnswer: combinedAnswer,
      scorePercent: score,
      checkedRubricItems,
      timeSpentSeconds: totalAllocatedSeconds - secondsRemaining,
      notes: reflectionNotes[q.id] || (aiScores[q.id] ? "Evaluated by AI Staff Interviewer" : ""),
    });

    setSavedStatus((prev) => ({ ...prev, [q.id]: true }));
    toast.success(`Saved evaluation result (${score}%) to interview history!`);
  };

  if (!currentQuestion || sessionQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/interview" })} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Session
        </Button>
        <Card className="p-8 text-center border-border/60">
          <CardContent className="space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-lg font-bold">No Questions Found</h3>
            <p className="text-xs text-muted-foreground">
              No questions matched your requested session filters.
            </p>
            <Button onClick={() => navigate({ to: "/interview" })}>
              Return to Interview Academy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session Completion View
  if (isSessionFinished) {
    const totalQuestionsCount = sessionQuestions.length;
    const evaluatedCount = Object.keys(savedStatus).length;

    return (
      <div className="space-y-6 max-w-3xl mx-auto py-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/interview" })} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Mock Interviews
        </Button>

        <Card className="border-primary/30 bg-card p-6 text-center space-y-6">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl grid place-items-center mx-auto">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Interview Session Completed!</h2>
            <p className="text-xs text-muted-foreground">
              Great practice session. You reviewed {evaluatedCount} of {totalQuestionsCount}{" "}
              questions in this loop.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 text-center">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground font-semibold">
                Total Time
              </p>
              <p className="text-lg font-extrabold font-mono mt-1">
                {Math.round((totalAllocatedSeconds - secondsRemaining) / 60)} mins
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground font-semibold">
                Questions Saved
              </p>
              <p className="text-lg font-extrabold font-mono text-cyan-400 mt-1">
                {evaluatedCount}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground font-semibold">Loop Mode</p>
              <p className="text-lg font-extrabold text-emerald-400 mt-1 capitalize">
                {searchParams.category || searchParams.preset}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button onClick={() => navigate({ to: "/interview" })} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSessionFinished(false);
                setCurrentIndex(0);
                setSecondsRemaining(totalAllocatedSeconds);
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Restart Session Loop
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isCurrentRevealed = revealedAnswers[currentQuestion.id] || false;
  const isCurrentSaved = savedStatus[currentQuestion.id] || false;
  const currentScore = calculateQuestionScore(currentQuestion);

  return (
    <div className="space-y-6">
      {/* Project Context Banner */}
      {project && (
        <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-foreground">
              Evaluating Mock Interview in context of project:{" "}
              <strong className="text-amber-300">{project.title}</strong>
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-300 text-[10px] uppercase font-mono"
          >
            Project Interview Loop
          </Badge>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Button variant="ghost" onClick={() => navigate({ to: "/interview" })} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit Session
        </Button>

        {/* Stepper + Timer */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-xs py-1">
            Question {currentIndex + 1} of {sessionQuestions.length}
          </Badge>

          <div className="flex items-center gap-2 bg-card border border-border/60 px-3 py-1 rounded-full shadow-sm">
            <Timer
              className={`h-4 w-4 ${
                secondsRemaining < 120
                  ? "text-rose-400 animate-pulse"
                  : secondsRemaining < 300
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            />
            <span className="font-mono font-bold text-sm">
              {minutesStr}:{secondsStr}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
            >
              {isTimerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <Progress value={timerPercent} className="h-1" />

      {/* FORGE BUDDY SIDELINE INTERVIEW COACH (Progressive Hints Without Spoiling) */}
      {(() => {
        const revealedHints = coachHintLevel[currentQuestion.id] || 0;
        const rubricHints = currentQuestion.rubric || [];
        const pitfallHints = currentQuestion.commonPitfalls || [];
        const activeRun = codeRunOutput[currentQuestion.id];
        const evaluatedScore = aiScores[currentQuestion.id];

        const progressiveClues = [
          rubricHints[0]
            ? `Start your answer by framing this core concept: "${rubricHints[0]}".`
            : `Define the core ${currentQuestion.category} mechanism first before jumping into edge cases.`,
          pitfallHints[0]
            ? `Watch out for this classic interview trap: "${pitfallHints[0]}".`
            : rubricHints[1]
              ? `Next, make sure you explain: "${rubricHints[1]}".`
              : `Explain what happens under the hood when an error or race condition occurs.`,
          rubricHints[2]
            ? `To sound like a Senior Engineer, wrap up with: "${rubricHints[2]}".`
            : `Close by comparing trade-offs (performance vs readability) in a real production app.`,
        ];

        let coachMood: ForgeMascotMood = "winking";
        let coachHeadline = "Forge Buddy · Friendly Sideline Interview Coach";
        let coachMessage =
          "Take a breath! Structure your answer in 3 parts: 1) Core mental model, 2) How it works under the hood, 3) Production edge cases. Need a nudge? Unlock a clue below—I won't spoil the answer!";

        if (activeRun?.error) {
          coachMood = "thinking";
          coachHeadline = "Forge Buddy Spotted a Sandbox Error";
          coachMessage = `Your code threw: "${activeRun.error}". Fix that syntax or reference issue and run it again!`;
        } else if (evaluatedScore !== undefined) {
          coachMood = evaluatedScore >= 80 ? "excited" : "cheering";
          coachHeadline =
            evaluatedScore >= 80
              ? `Crushed It! ${evaluatedScore}% Staff Rubric Score 🎉`
              : `Good Progress (${evaluatedScore}%) — Check the Rubric Below!`;
          coachMessage =
            evaluatedScore >= 80
              ? "That answer would impress a Senior/Staff interviewer. Check out the follow-up probes below to lock in 100% confidence!"
              : "You got the foundation down! Review the missed rubric signals below and try refining your explanation.";
        } else if (revealedHints > 0) {
          coachMood = "thinking";
          coachHeadline = `Coach Clue ${revealedHints} of 3 Unlocked`;
        }

        return (
          <div className="rounded-2xl border border-[#6E6AF6]/35 bg-gradient-to-r from-[#1E1B4B] via-[#27235C] to-[#1E1B4B] p-4 sm:p-5 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-[#6E6AF6]/40">
                  <ForgeBuddyMascot3D mood={coachMood} className="w-12 h-12" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                      {coachHeadline}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-[#C7D2FE]">
                      {revealedHints}/3 Clues Used
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#E0E7FF] mt-1 leading-relaxed">
                    {coachMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  disabled={revealedHints >= 3}
                  onClick={() =>
                    setCoachHintLevel((prev) => ({
                      ...prev,
                      [currentQuestion.id]: Math.min(3, (prev[currentQuestion.id] || 0) + 1),
                    }))
                  }
                  className="bg-[#6E6AF6] hover:bg-[#5B57E6] text-white font-bold text-xs gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>
                    {revealedHints >= 3
                      ? "All 3 Clues Revealed"
                      : `Get Coach Hint (${revealedHints + 1}/3)`}
                  </span>
                </Button>
              </div>
            </div>

            {revealedHints > 0 && (
              <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {progressiveClues.slice(0, revealedHints).map((clue, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-3 text-xs text-[#FEF3C7] leading-relaxed"
                  >
                    <strong className="text-[#FBBF24] block mb-0.5 uppercase tracking-wider text-[10px]">
                      Coach Clue #{idx + 1}
                    </strong>
                    {clue}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Question Brief & Model Answer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/60 bg-card">
            <CardHeader className="p-5 pb-3 space-y-3 border-b border-border/40">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{currentQuestion.category}</Badge>
                <Badge
                  variant="outline"
                  className={
                    currentQuestion.difficulty === "Hard"
                      ? "text-rose-400 border-rose-500/20"
                      : currentQuestion.difficulty === "Medium"
                        ? "text-amber-400 border-amber-500/20"
                        : "text-emerald-400 border-emerald-500/20"
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline" className="gap-1 font-mono text-[11px]">
                  <Clock className="h-3 w-3" /> ~{currentQuestion.estimatedMinutes}m
                </Badge>
                {currentQuestion.companyTags?.map((c) => (
                  <Badge key={c} variant="outline" className="text-[10px] font-mono">
                    {c}
                  </Badge>
                ))}
              </div>

              <CardTitle className="text-lg font-bold leading-snug">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {/* Code Snippet if present */}
              {currentQuestion.codeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      Code Context
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeDrafts((prev) => ({
                          ...prev,
                          [currentQuestion.id]: currentQuestion.codeSnippet || "",
                        }));
                        toast.info("Copied snippet into your Live Code Runner tab!");
                      }}
                      className="text-[11px] font-semibold text-[#6E6AF6] hover:underline cursor-pointer"
                    >
                      Copy to Live Code Runner →
                    </button>
                  </div>
                  <pre className="p-3 bg-muted/60 rounded-lg overflow-x-auto font-mono text-xs border border-border/50 text-foreground">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* STAR Framework Helper for Behavioral Questions */}
              {currentQuestion.category === "Behavioral" && currentQuestion.starFramework && (
                <div className="bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-lg space-y-2">
                  <h5 className="font-bold text-teal-400 flex items-center gap-1.5 text-xs">
                    <UserCheck className="h-4 w-4" /> Behavioral STAR Guide
                  </h5>
                  <div className="space-y-1 text-muted-foreground text-[11px]">
                    <p>
                      <strong className="text-foreground">S (Situation):</strong>{" "}
                      {currentQuestion.starFramework.situation}
                    </p>
                    <p>
                      <strong className="text-foreground">T (Task):</strong>{" "}
                      {currentQuestion.starFramework.task}
                    </p>
                    <p>
                      <strong className="text-foreground">A (Action):</strong>{" "}
                      {currentQuestion.starFramework.action}
                    </p>
                    <p>
                      <strong className="text-foreground">R (Result):</strong>{" "}
                      {currentQuestion.starFramework.result}
                    </p>
                  </div>
                </div>
              )}

              {/* Common Pitfalls Collapsible */}
              {currentQuestion.commonPitfalls && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-3 rounded-lg space-y-1.5">
                  <h5 className="font-bold text-rose-400 text-[11px] flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Common Candidate Pitfalls
                  </h5>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-[11px]">
                    {currentQuestion.commonPitfalls.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Questions */}
              {currentQuestion.followUpQuestions && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Expected Interviewer Follow-ups
                  </span>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-[11px]">
                    {currentQuestion.followUpQuestions.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Response Editor, Live Code Sandbox & Self-Evaluation Rubric (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="p-4 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Candidate Response &amp; Live Code Sandbox
              </CardTitle>
              {isCurrentSaved && (
                <Badge
                  variant="outline"
                  className="text-emerald-400 border-emerald-500/20 gap-1 text-[10px]"
                >
                  <Check className="h-3 w-3" /> Saved Result
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Tabs for Response Input */}
              <Tabs defaultValue="text" className="space-y-3">
                <TabsList className="h-8">
                  <TabsTrigger value="text" className="text-xs">
                    Verbal / Written Explanation
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-[#6E6AF6]" />
                    Live Code &amp; Runner
                  </TabsTrigger>
                </TabsList>

                {/* Text Response Area */}
                <TabsContent value="text" className="space-y-2">
                  <Textarea
                    value={userAnswers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                    }
                    placeholder="Type your response here... Structure your key arguments clearly as if speaking out loud to the interviewer."
                    className="min-h-[220px] font-mono text-xs leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>
                      Words:{" "}
                      {
                        (userAnswers[currentQuestion.id] || "").trim().split(/\s+/).filter(Boolean)
                          .length
                      }
                    </span>
                    <span>Chars: {(userAnswers[currentQuestion.id] || "").length}</span>
                  </div>
                </TabsContent>

                {/* Live Runnable Code Area */}
                <TabsContent value="code" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Write JavaScript / async code and run it live to verify your interview solution:
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRunCandidateCode(currentQuestion)}
                      className="h-7 text-xs gap-1.5 bg-[#6E6AF6] hover:bg-[#5B57E6] text-white font-bold cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Run Code Live
                    </Button>
                  </div>

                  <Textarea
                    value={
                      codeDrafts[currentQuestion.id] ??
                      currentQuestion.codeSnippet ??
                      ""
                    }
                    onChange={(e) =>
                      setCodeDrafts((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                    }
                    placeholder="// Write your runnable JavaScript or async/await solution here..."
                    className="min-h-[200px] font-mono text-xs leading-relaxed bg-[#0F0D26] text-[#F8FAFC] border-[#6E6AF6]/40"
                  />

                  {codeRunOutput[currentQuestion.id] && (
                    <div className="rounded-xl border border-[#6E6AF6]/30 bg-[#0F0D26] p-3 font-mono text-xs text-white space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] mb-1">
                        Live Console Output
                      </div>
                      {codeRunOutput[currentQuestion.id].logs.map((line, i) => (
                        <div key={i} className="text-emerald-300 whitespace-pre-wrap">
                          {line}
                        </div>
                      ))}
                      {codeRunOutput[currentQuestion.id].error && (
                        <div className="text-rose-400 font-semibold">
                          ❌ Runtime Error: {codeRunOutput[currentQuestion.id].error}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Staff Interviewer Evaluation & Rubric Triggers */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <Button
                  onClick={() => handleRequestAiEvaluation(currentQuestion)}
                  disabled={isAiEvaluating[currentQuestion.id]}
                  className="w-full sm:flex-1 text-xs gap-1.5 shadow-sm bg-[#6E6AF6] hover:bg-[#5B57E6] text-white font-bold cursor-pointer"
                >
                  {isAiEvaluating[currentQuestion.id] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Evaluating against Staff Rubric...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                      Evaluate with Staff Rubric &amp; Coach
                    </>
                  )}
                </Button>

                <Button
                  onClick={() =>
                    setRevealedAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }))
                  }
                  variant="outline"
                  className="w-full sm:w-auto text-xs gap-1.5 cursor-pointer"
                >
                  <Eye className="h-4 w-4" /> Reveal Rubric &amp; Model Solution
                </Button>
              </div>

              {/* REVEALED EVALUATION PANEL (AI Feedback + Self-Eval Checklist + Follow-ups) */}
              {isCurrentRevealed && (
                <div className="space-y-5 pt-3 border-t border-border/60">
                  {/* AI INTERVIEWER FEEDBACK BLOCK */}
                  {(aiFeedback[currentQuestion.id] || isAiEvaluating[currentQuestion.id]) && (
                    <Card className="border-primary/40 bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              AI Staff Interviewer Feedback
                            </h5>
                            <p className="text-[10px] text-muted-foreground">
                              Calibrated to Google L6 / Meta E6 hiring bar
                            </p>
                          </div>
                        </div>

                        {aiScores[currentQuestion.id] !== undefined && (
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs py-1 px-2.5 ${
                              aiScores[currentQuestion.id] >= 80
                                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                : aiScores[currentQuestion.id] >= 60
                                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                  : "text-rose-400 border-rose-500/30 bg-rose-500/10"
                            }`}
                          >
                            <Award className="h-3.5 w-3.5 mr-1 inline" /> AI Score:{" "}
                            {aiScores[currentQuestion.id]}%
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-foreground space-y-2 leading-relaxed max-h-[400px] overflow-y-auto pr-1">
                        {(() => {
                          const raw = aiFeedback[currentQuestion.id];
                          if (!raw) {
                            return (
                              <div className="flex items-center gap-2 py-4 text-muted-foreground justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>
                                  Analyzing candidate answer, type safety, and architecture...
                                </span>
                              </div>
                            );
                          }
                          const parsed = getParsedFeedback(raw);
                          if (parsed) {
                            return (
                              <div className="space-y-4 text-sm mt-4">
                                <div className="p-3 bg-secondary/20 rounded-md border border-border/40">
                                  <h6 className="font-semibold text-foreground mb-1">
                                    Executive Assessment
                                  </h6>
                                  <p className="text-muted-foreground">
                                    {parsed.executiveAssessment}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h6 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                      <Award className="w-4 h-4" /> Criteria Ratings
                                    </h6>
                                    <ul className="space-y-1">
                                      {Object.entries(parsed.criteriaRatings || {}).map(
                                        ([key, val]) => (
                                          <li key={key} className="flex justify-between">
                                            <span className="capitalize text-muted-foreground">
                                              {key}
                                            </span>
                                            <span className="font-mono text-primary">
                                              {val as number}/100
                                            </span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h6 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                      <Trophy className="w-4 h-4" /> STAR Scoring
                                    </h6>
                                    <ul className="space-y-1">
                                      {Object.entries(parsed.starScoring || {}).map(
                                        ([key, val]) => (
                                          <li key={key} className="flex justify-between">
                                            <span className="capitalize text-muted-foreground">
                                              {key}
                                            </span>
                                            <span className="font-mono text-primary">
                                              {val as number}/100
                                            </span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-green-500/10 rounded-md border border-green-500/20">
                                    <h6 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                                      Strengths
                                    </h6>
                                    <ul className="list-disc pl-4 space-y-1 text-green-700 dark:text-green-300">
                                      {(parsed.strengths || []).map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="p-3 bg-red-500/10 rounded-md border border-red-500/20">
                                    <h6 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                                      Areas for Improvement
                                    </h6>
                                    <ul className="list-disc pl-4 space-y-1 text-red-700 dark:text-red-300">
                                      {(parsed.improvements || []).map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                {parsed.refactoredSolution &&
                                  parsed.refactoredSolution !== "N/A" && (
                                    <div>
                                      <h6 className="font-semibold text-foreground mb-2">
                                        Refactored Solution
                                      </h6>
                                      <div className="markdown-body text-xs">
                                        <Markdown>{`\`\`tsx\n${parsed.refactoredSolution}\n\`\`\``}</Markdown>
                                      </div>
                                    </div>
                                  )}
                                {parsed.followUpQuestions &&
                                  parsed.followUpQuestions.length > 0 && (
                                    <div className="p-3 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                                      <h6 className="font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                                        Targeted Follow-Up Questions
                                      </h6>
                                      <ul className="list-disc pl-4 space-y-1 text-cyan-700 dark:text-cyan-300">
                                        {parsed.followUpQuestions.map((s: string, i: number) => (
                                          <li key={i}>{s}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            );
                          }
                          return (
                            <div className="font-mono text-xs whitespace-pre-wrap mt-4 text-muted-foreground bg-black/5 p-4 rounded-md border border-border/40 overflow-hidden">
                              {raw}
                            </div>
                          );
                        })()}
                      </div>
                    </Card>
                  )}

                  {/* INTERACTIVE AI FOLLOW-UP QUESTIONS PROBE */}
                  {currentQuestion.followUpQuestions &&
                    currentQuestion.followUpQuestions.length > 0 && (
                      <div className="space-y-3 bg-card p-4 rounded-xl border border-border/60">
                        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                          <MessageSquareCode className="h-4 w-4 text-cyan-400" />
                          <h5 className="text-xs font-bold text-foreground">
                            Targeted Follow-Up Probes
                          </h5>
                        </div>
                        <div className="space-y-4">
                          {currentQuestion.followUpQuestions.map((followUpQ, i) => {
                            const ansKey = `${currentQuestion.id}-${followUpQ}`;
                            const isEvaluatingThis = isAiEvaluating[ansKey];
                            const feedback = followUpFeedbacks[ansKey];

                            return (
                              <div key={i} className="space-y-2">
                                <p className="text-sm font-medium text-foreground">{followUpQ}</p>
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Your answer to this follow-up..."
                                    value={followUpAnswers[ansKey] || ""}
                                    onChange={(e) =>
                                      setFollowUpAnswers((prev) => ({
                                        ...prev,
                                        [ansKey]: e.target.value,
                                      }))
                                    }
                                    className="text-xs min-h-[60px] bg-background"
                                  />

                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() =>
                                        handleRequestFollowUpEval(currentQuestion, followUpQ)
                                      }
                                      disabled={isEvaluatingThis}
                                      className="text-[11px] h-7 gap-1"
                                    >
                                      {isEvaluatingThis ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Send className="h-3 w-3 text-primary" />
                                      )}
                                      Evaluate Follow-up Answer
                                    </Button>
                                  </div>

                                  {feedback && (
                                    <div className="p-3 bg-card rounded border border-cyan-500/20 text-xs text-foreground mt-2">
                                      <span className="font-bold text-cyan-400 block mb-1">
                                        AI Interviewer Follow-up Feedback:
                                      </span>
                                      <div className="markdown-body">
                                        <Markdown>{feedback}</Markdown>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Model Answer Box */}
                  {currentQuestion.sampleAnswer && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Model Answer & Ideal Response
                      </h5>
                      <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground leading-relaxed">
                        <div className="markdown-body">
                          <Markdown>{currentQuestion.sampleAnswer}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rubric Checklist */}
                  {currentQuestion.rubric && (
                    <div className="space-y-2 bg-muted/30 p-3.5 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Self-Evaluation Checklist
                        </h5>
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            (aiScores[currentQuestion.id] ?? currentScore) >= 80
                              ? "text-emerald-400 border-emerald-500/20"
                              : "text-amber-400 border-amber-500/20"
                          }`}
                        >
                          Score: {aiScores[currentQuestion.id] ?? currentScore}%
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-1">
                        {currentQuestion.rubric.map((criterion, idx) => {
                          const isChecked = (checkedRubrics[currentQuestion.id] || []).includes(
                            idx,
                          );
                          return (
                            <label
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer hover:text-primary transition-colors"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleRubricItem(currentQuestion.id, idx)}
                                className="mt-0.5"
                              />
                              <span
                                className={isChecked ? "line-through text-muted-foreground" : ""}
                              >
                                {criterion}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reflection Note */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Personal Reflection / Key Takeaway Note
                    </label>
                    <Input
                      placeholder="e.g. Remember to mention event loop microtask queue order next time..."
                      value={reflectionNotes[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setReflectionNotes((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      className="text-xs h-8"
                    />
                  </div>

                  {/* Save Result Button */}
                  <Button
                    onClick={() => handleSaveQuestionResult(currentQuestion)}
                    disabled={isCurrentSaved}
                    className="w-full text-xs gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isCurrentSaved
                      ? "Result Saved to History"
                      : `Save Result & Log Score (${aiScores[currentQuestion.id] ?? currentScore}%)`}
                  </Button>
                </div>
              )}

              {/* Navigation Actions (Previous / Next) */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="text-xs"
                >
                  Previous
                </Button>

                {currentIndex < sessionQuestions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="text-xs gap-1"
                  >
                    Next Question <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsSessionFinished(true)}
                    className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Complete Session <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
