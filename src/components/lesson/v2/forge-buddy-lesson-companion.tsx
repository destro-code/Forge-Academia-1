import { useState, useEffect, useRef } from "react"
import { ForgeBuddyMascot3D, type ForgeMascotMood } from "@/components/atelier/forge-buddy-illos"
import { getEli5MentorNote } from "@/lib/curriculum/v1/eli5-mentor-bank"
import { LessonLiveSandboxDrawer } from "./lesson-live-sandbox-drawer"
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Pause,
  RotateCcw,
  Code2,
  Laugh,
  Briefcase,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react"

export interface ForgeBuddyLessonCompanionProps {
  lessonId: string
  lessonTitle: string
  moduleTitle?: string
  lessonSummary?: string
  stepIndex: number
  totalSteps: number
  stepTitle: string
  stepInstruction?: string
  activityType?: string
  stepKind?: string
  isInteractive?: boolean
  status?: "idle" | "submitted" | "correct" | "incorrect" | "completed"
  isCompleted?: boolean
  attempts?: number
  hintsAvailable?: number
  hintsRevealed?: number
  lastFeedbackMessage?: string
  stepError?: string | null
  onRevealHint?: () => void
}

type BuddyTab = "step" | "joke" | "interview" | "watchout"

export function ForgeBuddyLessonCompanion({
  lessonId,
  lessonTitle,
  moduleTitle,
  lessonSummary,
  stepIndex,
  totalSteps,
  stepTitle,
  stepInstruction,
  activityType,
  stepKind,
  isInteractive = false,
  status = "idle",
  isCompleted: isCompletedProp,
  attempts = 0,
  hintsAvailable = 0,
  hintsRevealed = 0,
  lastFeedbackMessage,
  stepError,
  onRevealHint,
}: ForgeBuddyLessonCompanionProps) {
  const [activeTab, setActiveTab] = useState<BuddyTab>("step")
  const [showSandbox, setShowSandbox] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speechRate, setSpeechRate] = useState<1 | 1.25 | 1.5>(1)
  const [autoRead, setAutoRead] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const mentorNote = getEli5MentorNote(lessonId, moduleTitle)
  const effectiveKind = activityType || stepKind || "concept"
  const isCompleted =
    isCompletedProp ?? (status === "correct" || status === "completed")
  const isIncorrect = status === "incorrect" || Boolean(stepError)
  const errorText = stepError || (isIncorrect ? lastFeedbackMessage : undefined)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true)
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Build clean narration script for current step + Forge Buddy context
  const rawBody = stepInstruction || lessonSummary || mentorNote.eli5Text
  const cleanInstruction = rawBody
    .replace(/```[\s\S]*?```/g, " Check the code block on screen. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#+\s*/g, "")
    .replace(/\n+/g, " ")
    .trim()

  const narrationScript = `Step ${stepIndex + 1} of ${totalSteps}: ${stepTitle}. ${cleanInstruction}. Forge Buddy analogy: ${mentorNote.analogy}. Quick dev joke: ${mentorNote.joke}`

  const stopSpeech = () => {
    if (!speechSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  const startSpeech = (rateOverride?: 1 | 1.25 | 1.5) => {
    if (!speechSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(narrationScript)
    utterance.rate = rateOverride ?? speechRate
    utterance.pitch = 1.03
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setIsPaused(false)
  }

  const togglePlayPauseSpeech = () => {
    if (!speechSupported) return
    if (!isSpeaking) {
      startSpeech()
    } else if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const cycleSpeechRate = () => {
    const nextRate: 1 | 1.25 | 1.5 =
      speechRate === 1 ? 1.25 : speechRate === 1.25 ? 1.5 : 1
    setSpeechRate(nextRate)
    if (isSpeaking) {
      startSpeech(nextRate)
    }
  }

  // Stop or auto-read when step changes
  useEffect(() => {
    if (!speechSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    if (autoRead) {
      const timer = setTimeout(() => {
        startSpeech()
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [stepIndex, lessonId])

  // Determine mascot expression based on step state & active lens
  const getMascotMood = (): ForgeMascotMood => {
    if (isIncorrect) return "thinking"
    if (isCompleted) return stepIndex === totalSteps - 1 ? "excited" : "cheering"
    if (showSandbox) return "coding"
    if (activeTab === "joke") return "winking"
    if (activeTab === "interview" || activeTab === "watchout") return "thinking"
    if (isInteractive) return "coding"
    return "happy"
  }

  const getStepSpecificGuidance = () => {
    if (isIncorrect) {
      return `Hold up—let's inspect that closely! ${errorText || "Not quite matching yet."} Don't sweat it (${attempts} ${attempts === 1 ? "attempt" : "attempts"} so far)—every senior engineer hits this bump. Test your theory in the Live Sandbox or reveal a hint!`
    }
    if (isCompleted) {
      return `${lastFeedbackMessage ? `${lastFeedbackMessage} ` : ""}Boom! Step ${stepIndex + 1} locked in. Notice how "${stepTitle}" connects directly to ${lessonTitle}. Keep that momentum rolling!`
    }
    if (effectiveKind.includes("code") || effectiveKind.includes("replicate") || isInteractive) {
      return `Hands on the keyboard! Break the requirement into small pieces. ${mentorNote.analogy} Watch out for: ${mentorNote.watchOut}`
    }
    return `${mentorNote.analogy}`
  }

  return (
    <div className="mb-4 rounded-2xl border border-[#6E6AF6]/25 bg-gradient-to-br from-[#F5F3FF]/95 via-[#FFFDF9] to-[#EEF2FF]/80 p-4 sm:p-5 shadow-xs transition-all">
      {/* Top Row: Mascot + Active Commentary + Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Mascot Avatar + Mood Badge */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-center shrink-0">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-[#6E6AF6]/40 shadow-md">
            <ForgeBuddyMascot3D
              mood={getMascotMood()}
              className="w-14 h-14"
              animate={true}
            />
            {isCompleted && (
              <span
                title="Step Mastered!"
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E6B4E] text-white shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#1E1B4B] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">
            <Sparkles className="h-2.5 w-2.5 text-[#A78BFA]" />
            Forge Buddy
          </span>
        </div>

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 w-full">
          {/* Header & Studio Tools Bar (Audio Voice Player + Live Sandbox Toggle) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#6E6AF6]/15">
            {/* Lens Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-[#1E1B4B]/5 p-1 rounded-xl border border-[#1E1B4B]/10">
              <button
                type="button"
                onClick={() => setActiveTab("step")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "step"
                    ? "bg-[#1E1B4B] text-white shadow-xs"
                    : "text-[#5C5346] hover:text-[#1C1814]"
                }`}
              >
                <Lightbulb className="h-3 w-3 text-[#FBBF24]" />
                ELI5 & Guide
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("joke")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "joke"
                    ? "bg-[#6E6AF6] text-white shadow-xs"
                    : "text-[#5C5346] hover:text-[#1C1814]"
                }`}
              >
                <Laugh className="h-3 w-3" />
                Dev Humor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("interview")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "interview"
                    ? "bg-[#D97706] text-white shadow-xs"
                    : "text-[#5C5346] hover:text-[#1C1814]"
                }`}
              >
                <Briefcase className="h-3 w-3" />
                Interview Trap
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("watchout")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "watchout"
                    ? "bg-[#B84A39] text-white shadow-xs"
                    : "text-[#5C5346] hover:text-[#1C1814]"
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                Gotcha
              </button>
            </div>

            {/* Right Controls: Audio Narration + Hint + Code It Live */}
            <div className="flex flex-wrap items-center gap-1.5">
              {speechSupported && (
                <div className="inline-flex items-center gap-1 rounded-xl border border-[#6E6AF6]/30 bg-white px-2 py-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={togglePlayPauseSpeech}
                    title={isSpeaking && !isPaused ? "Pause lesson audio" : "Listen to this step"}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold transition-colors ${
                      isSpeaking && !isPaused
                        ? "bg-[#6E6AF6] text-white"
                        : "text-[#1E1B4B] hover:bg-[#F5F3FF]"
                    }`}
                  >
                    {isSpeaking && !isPaused ? (
                      <>
                        <Pause className="h-3 w-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-[#6E6AF6]" />
                        <span>{isPaused ? "Resume" : "Listen"}</span>
                      </>
                    )}
                  </button>

                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeech}
                      title="Stop audio"
                      className="p-1 text-[#8C8173] hover:text-[#1C1814] rounded"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={cycleSpeechRate}
                    title="Change narration speed"
                    className="rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#4F46E5] hover:bg-[#EDE9FE]"
                  >
                    {speechRate}x
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoRead((v) => !v)}
                    title="Auto-read each new step aloud"
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                      autoRead
                        ? "bg-[#2E6B4E] text-white"
                        : "text-[#8C8173] hover:text-[#1C1814]"
                    }`}
                  >
                    Auto
                  </button>
                </div>
              )}

              {onRevealHint && hintsAvailable > hintsRevealed && (
                <button
                  type="button"
                  onClick={onRevealHint}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#D97706]/35 bg-[#FFFBEB] px-2.5 py-1.5 text-xs font-semibold text-[#B45309] hover:bg-[#FEF3C7] transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Hint ({hintsRevealed}/{hintsAvailable})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSandbox((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
                  showSandbox
                    ? "bg-[#1E1B4B] text-[#FBBF24] border border-[#6E6AF6]"
                    : "bg-[#6E6AF6] text-white hover:bg-[#5B57E6]"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{showSandbox ? "Hide Live Sandbox" : "Practice Live Here"}</span>
                {showSandbox ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Active Lens Content */}
          {activeTab === "step" && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                  {mentorNote.analogyTitle}
                </span>
                <span className="text-[11px] text-[#8C8173]">
                  • Step {stepIndex + 1} of {totalSteps}: {stepTitle}
                </span>
              </div>
              <p className="text-sm text-[#1C1814] leading-relaxed">
                {getStepSpecificGuidance()}
              </p>
              <div className="flex items-start gap-2 rounded-xl bg-white/80 border border-[#6E6AF6]/15 px-3 py-2 text-xs text-[#5C5346]">
                <Sparkles className="h-3.5 w-3.5 text-[#6E6AF6] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1E1B4B]">Real-World Hook:</strong>{" "}
                  {mentorNote.hook}
                </span>
              </div>
            </div>
          )}

          {activeTab === "joke" && (
            <div className="rounded-xl bg-white/90 border border-[#6E6AF6]/25 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6E6AF6]">
                <Laugh className="h-3.5 w-3.5" />
                <span>Forge Buddy's Dev Humor & Memory Hook</span>
              </div>
              <p className="text-sm font-medium text-[#1C1814] leading-relaxed italic">
                "{mentorNote.joke}"
              </p>
              <p className="text-xs text-[#5C5346]">
                <strong className="text-[#1E1B4B]">Why it sticks:</strong>{" "}
                {mentorNote.seniorWit}
              </p>
            </div>
          )}

          {activeTab === "interview" && (
            <div className="rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/35 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B45309]">
                  <Briefcase className="h-3.5 w-3.5" />
                  How Interviewers Ask This Live
                </span>
                <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
                  Real Interview Trap
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1C1814]">
                Q: "{mentorNote.interviewTrap.question}"
              </p>
              <p className="text-xs text-[#78350F] leading-relaxed">
                <strong>The Trap:</strong> {mentorNote.interviewTrap.trap}
              </p>
              <div className="rounded-lg bg-white/90 border border-[#F59E0B]/25 px-3 py-2 text-xs text-[#1E1B4B]">
                <strong className="text-[#2E6B4E]">Senior Answer That Hires You:</strong>{" "}
                {mentorNote.interviewTrap.punchline}
              </div>
            </div>
          )}

          {activeTab === "watchout" && (
            <div className="rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B91C1C]">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Common Production Bug to Avoid</span>
              </div>
              <p className="text-sm text-[#7F1D1D] leading-relaxed">
                {mentorNote.watchOut}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible In-Lesson Live Code Sandbox Drawer */}
      {showSandbox && (
        <LessonLiveSandboxDrawer
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          snippet={mentorNote.practiceSnippet}
          onClose={() => setShowSandbox(false)}
        />
      )}
    </div>
  )
}
