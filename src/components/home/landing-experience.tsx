import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  MousePointerClick,
  Play,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import {
  ChapterFolio3DArt,
  CurvedDoodleArrow,
  ForgeAcademiaLogo,
  ForgeBuddyMascot3D,
  HandwrittenCallout,
  StudioDesk3DCluster,
  TrophyFlame3D,
} from "@/components/atelier/forge-buddy-illos";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";
import { buildAtelierChapterFolios } from "@/lib/curriculum/atelier-chapters";
import { useModules, useProjects } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { cn } from "@/lib/utils";

interface LandingExperienceProps {
  onOpenDiagnostic: () => void;
  onSwitchToDashboard?: () => void;
}

export function LandingExperience({
  onOpenDiagnostic,
  onSwitchToDashboard,
}: LandingExperienceProps) {
  const modules = useModules();
  const projects = useProjects();
  const progress = useProgress();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();

  const [activeHeroCard, setActiveHeroCard] = useState<"preview" | "code" | "buddy">("preview");
  const startLessonId = currentLesson?.id || "lesson-0-1-1";

  const chapterFolios = useMemo(
    () =>
      buildAtelierChapterFolios(
        modules,
        progress.lessonsCompleted,
        currentLesson?.id,
      ),
    [modules, progress.lessonsCompleted, currentLesson?.id],
  );

  // 4 Student-Focused Value Cards ("How You Master Frontend")
  const interactiveFeatures = [
    {
      title: "15-Minute Interactive Lessons",
      description: "Bite-sized visual explanations that turn complex browser mechanics into clear intuition.",
      icon: MousePointerClick,
      accentBg: "bg-[#EEF2FF] text-[#4F6BFF] border-[#C9BBFF]",
    },
    {
      title: "Real-Time Code & DOM Stage",
      description: "Edit HTML, CSS, and JavaScript right in your browser and watch the UI update live.",
      icon: Play,
      accentBg: "bg-[#E8F8F2] text-[#0F7656] border-[#A7E3D1]",
    },
    {
      title: "Guided Mentorship & Debugging",
      description: "Switch between friendly analogies and senior engineering tips whenever you get stuck.",
      icon: Wand2,
      accentBg: "bg-[#F5F3FF] text-[#6D28D9] border-[#C9BBFF]",
    },
    {
      title: "Portfolio-Ready Specs",
      description: "Apply every chapter to real frontend projects with step-by-step acceptance criteria.",
      icon: Sparkles,
      accentBg: "bg-[#FFF0ED] text-[#D9483B] border-[#FF8C7A]",
    },
  ] as const;

  // 4 Student Outcome Cards ("Why Builders Love the Creative Atelier")
  const signatureElements = [
    {
      title: "Visual Mental Models",
      subtitle: "See how the DOM tree, CSS box model, and React state fit together in 3D space.",
      bg: "from-[#FFFBEB] to-[#FEF3C7] border-[#FFE08A]",
      visual: <StudioDesk3DCluster className="h-24 w-full" />,
    },
    {
      title: "Zero Setup Sandboxes",
      subtitle: "Write real code from minute one inside living browser frames — no local config needed.",
      bg: "from-[#EEF2FF] to-[#E0E7FF] border-[#C9BBFF]",
      visual: <ChapterFolio3DArt accent="mint" className="h-24 w-full" />,
    },
    {
      title: "Friendly Studio Mentor",
      subtitle: "Forge Buddy explains tricky concepts in plain English or deep-dives into pro patterns.",
      bg: "from-[#F5F3FF] to-[#EDE9FE] border-[#C9BBFF]",
      visual: <ForgeBuddyMascot3D className="h-24 w-24 mx-auto" mood="cheerful" />,
    },
    {
      title: "Real Proof of Mastery",
      subtitle: "Earn die-cut studio stickers and build a verified streak as you ship real interfaces.",
      bg: "from-[#E8F8F2] to-[#D1FAE5] border-[#A7E3D1]",
      visual: <TrophyFlame3D className="h-24 w-24 mx-auto" />,
    },
  ] as const;

  return (
    <div className="space-y-12 sm:space-y-16 w-full min-w-0">
      {/* =====================================================================
          1. HERO SECTION — Focused Conversion Hierarchy & 3D Studio Stage
         ===================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#E5DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#F5F7FF] to-[#E4EAFF] p-5 sm:p-10 lg:p-14 shadow-[0_24px_60px_-20px_rgba(14,27,61,0.1)] dark:border-white/10 dark:from-[#0F1830] dark:via-[#131E3A] dark:to-[#1D294D]"
      >
        {/* Ambient Soft Pastel Blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-[#FFE08A]/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[#C9BBFF]/35 blur-3xl"
        />

        {/* Top Category Pill ("Learn · Build · Create · Grow") */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9BBFF]/80 bg-white/85 px-4 py-1.5 text-xs font-extrabold tracking-wide text-[#0E1B3D] shadow-xs backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-white">
            <span className="h-2 w-2 rounded-full bg-[#4F6BFF]" />
            <span>Learn</span>
            <span aria-hidden="true" className="text-[#4F6BFF]">
              ·
            </span>
            <span>Build</span>
            <span aria-hidden="true" className="text-[#4F6BFF]">
              ·
            </span>
            <span>Create</span>
            <span aria-hidden="true" className="text-[#4F6BFF]">
              ·
            </span>
            <span>Grow</span>
          </div>

          {/* Handwritten Callout ("Small steps. Big dreams.") */}
          <div className="flex items-center gap-1.5">
            <HandwrittenCallout rotation="-rotate-6" className="text-2xl sm:text-3xl text-[#1E3A8A] dark:text-[#FFE08A]">
              Small steps. Big dreams.
            </HandwrittenCallout>
            <CurvedDoodleArrow variant="coral-up-right" className="h-9 w-12" />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column (6 cols): Display Headline, Copy, Focused Primary/Secondary CTAs & Stats */}
          <div className="space-y-6 lg:col-span-6">
            <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-[#0E1B3D] sm:text-5xl lg:text-[56px] dark:text-white">
              Turn your curiosity into{" "}
              <span className="text-[#4F6BFF] dark:text-[#8DA2FF]">real skills.</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              The next generation coding academy for curious minds. Master HTML, CSS, JavaScript,
              and React through hands-on projects, interactive live studios, and friendly mentorship.
            </p>

            {/* Clear 2-Button Conversion Hierarchy + Subtle Dashboard Link */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  to="/lesson/$lessonId"
                  params={{ lessonId: startLessonId }}
                  className="inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-[#4F6BFF] px-7 py-3.5 font-display text-base font-extrabold text-white shadow-[0_14px_30px_-6px_rgba(79,107,255,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3B53D9]"
                >
                  <span>
                    {completedCount > 0 ? "Continue Learning" : "Start Learning Free"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={onOpenDiagnostic}
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 border-[#C9BBFF] bg-white px-6 py-3.5 font-display text-sm sm:text-base font-extrabold text-[#0E1B3D] shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#0B1226] dark:text-white"
                >
                  <Compass className="h-4 w-4 text-[#4F6BFF]" />
                  <span>Take 60s Skill Check</span>
                </button>
              </div>

              <div>
                <Link
                  to="/dashboard"
                  onClick={() => onSwitchToDashboard?.()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5578] hover:text-[#4F6BFF] dark:text-[#CBD5F0] dark:hover:text-[#8DA2FF]"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#4F6BFF]" />
                  <span>Or explore the full Creative Atelier Studio Dashboard →</span>
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 sm:max-w-md border-t border-[#E5DFD3]/80 dark:border-white/10">
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0E1B3D] dark:text-white">
                  {modules.length || 17}
                </div>
                <div className="text-xs font-medium text-[#4A5578] dark:text-[#94A3C9]">
                  Studio Courses
                </div>
              </div>
              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0E1B3D] dark:text-white">
                  {totalLessons || 139}+
                </div>
                <div className="text-xs font-medium text-[#4A5578] dark:text-[#94A3C9]">
                  Interactive Lessons
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 font-display text-2xl sm:text-3xl font-extrabold text-[#0E1B3D] dark:text-white">
                  <span>4.9</span>
                  <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
                </div>
                <div className="text-xs font-medium text-[#4A5578] dark:text-[#94A3C9]">
                  Learner Rating
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (6 cols): 3D Hero Sculpture Scene */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto max-w-[540px] rounded-[32px] border border-white/80 bg-gradient-to-b from-white/90 via-[#EEF2FF]/90 to-[#E0E7FF]/90 p-5 sm:p-6 shadow-[0_24px_50px_-16px_rgba(79,107,255,0.22)] backdrop-blur-md dark:border-white/15 dark:from-[#131E3A] dark:to-[#0B1226]">
              {/* Top Floating 3D Code Tag Badge </> */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 shadow-sm dark:bg-[#0B1226]">
                  <ForgeAcademiaLogo size="sm" />
                </div>

                {/* Interactive Mode Switcher on the 3D Hero Stage */}
                <div className="flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-xs dark:bg-[#0B1226]">
                  {(
                    [
                      { id: "preview", label: "3D Studio" },
                      { id: "code", label: "Live Code" },
                      { id: "buddy", label: "Forge Buddy" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHeroCard(tab.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-all",
                        activeHeroCard === tab.id
                          ? "bg-[#4F6BFF] text-white shadow-xs"
                          : "text-[#4A5578] hover:text-[#0E1B3D] dark:text-[#CBD5F0]",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic 3D Hero Stage */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
                {/* Left Floating Browser / Code Frame */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="atelier-code-window rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FF8C7A]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FFE08A]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#A7E3D1]" />
                      </div>
                      <span className="rounded-full bg-[#4F6BFF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                        ● Live
                      </span>
                    </div>

                    {activeHeroCard === "code" ? (
                      <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-[#F8F6F0]">
                        <code>
                          <span className="text-[#FFE08A]">const</span> studio ={" "}
                          <span className="text-[#93C5FD]">createAtelier</span>({"{\n"}
                          {"  "}theme: <span className="text-[#A7E3D1]">&apos;living-blueprint&apos;</span>,{"\n"}
                          {"  "}magic: <span className="text-[#FF8C7A]">true</span>{"\n"}
                          {"}"});
                        </code>
                      </pre>
                    ) : activeHeroCard === "buddy" ? (
                      <div className="mt-3 space-y-1.5 text-xs text-[#E2E8F0]">
                        <div className="font-bold text-[#FFE08A]">
                          🤖 Forge Buddy says:
                        </div>
                        <p className="leading-relaxed">
                          &ldquo;Think of HTML as the bones, CSS as the outfit, and JavaScript as
                          the muscles that make your page dance!&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[#A7E3D1]">
                            &lt;StudioCard /&gt;
                          </span>
                          <span className="font-mono text-[10px] text-[#C9BBFF]">
                            flex · gap-12px
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-12 rounded-xl bg-gradient-to-br from-[#4F6BFF] to-[#7B91FF] p-2 text-[10px] font-bold text-white">
                            HTML
                          </div>
                          <div className="h-12 rounded-xl bg-gradient-to-br from-[#A7E3D1] to-[#10B981] p-2 text-[10px] font-bold text-[#0E1B3D]">
                            CSS
                          </div>
                          <div className="h-12 rounded-xl bg-gradient-to-br from-[#FFE08A] to-[#F59E0B] p-2 text-[10px] font-bold text-[#0E1B3D]">
                            JS
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Butter Yellow 3D Slide Wave Bar */}
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FFE08A] via-[#FDE047] to-[#F59E0B] px-4 py-3 text-[#0E1B3D] shadow-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#0E1B3D]" />
                      <span className="font-display text-xs font-extrabold">
                        Lesson Complete! +50 XP
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">100%</span>
                  </div>
                </div>

                {/* Right: 3D Forge Buddy Mascot with Speech Bubble */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="sm:col-span-5 flex flex-col items-center justify-center"
                >
                  <ForgeBuddyMascot3D
                    className="h-36 w-36 sm:h-44 sm:w-44"
                    mood="celebrating"
                    speechBubble="You got this!"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Student-Focused Value Tiles at Bottom of Hero */}
        <div className="relative z-10 mt-8 sm:mt-10 grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {interactiveFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06, duration: 0.35 }}
                whileHover={{ y: -4 }}
                className="flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_24px_-10px_rgba(14,27,61,0.07)] backdrop-blur-md transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0B1226]/85"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                    feat.accentBg,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-extrabold text-[#0E1B3D] dark:text-white">
                    {feat.title}
                  </h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* =====================================================================
          2. WHY BUILDERS LOVE THE CREATIVE ATELIER (Student Outcome Cards)
         ===================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              How You Master Frontend
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl dark:text-white">
              A creative studio where code visibly transforms into real interfaces
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[#4A5578] dark:text-[#CBD5F0]">
              Instead of passive video lectures, you learn inside interactive browser stages with
              visual mental models, instant feedback, and real portfolio projects.
            </p>
          </div>

          <HandwrittenCallout rotation="rotate-2" className="text-2xl text-[#4F6BFF]">
            Learn by building. ✨
          </HandwrittenCallout>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {signatureElements.map((item) => (
            <div
              key={item.title}
              className={cn(
                "flex flex-col justify-between rounded-[26px] border bg-gradient-to-b p-5 shadow-[0_14px_32px_-12px_rgba(14,27,61,0.06)] dark:border-white/10 dark:from-[#131E3A] dark:to-[#0B1226]",
                item.bg,
              )}
            >
              <div className="my-2 flex items-center justify-center">{item.visual}</div>
              <div className="mt-3">
                <h3 className="font-display text-base font-extrabold text-[#0E1B3D] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          3. LIVE LESSON EXPERIENCE PREVIEW ("Let's style that button!")
         ===================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              Interactive Lesson Experience
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl dark:text-white">
              Try a live studio lesson right now — click the style tokens below
            </h2>
          </div>
          <Link
            to="/lesson/$lessonId"
            params={{ lessonId: startLessonId }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F6BFF] hover:underline dark:text-[#8DA2FF]"
          >
            <span>Open Full Interactive Lesson Player</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <LiveBlueprintStage />
      </section>

      {/* =====================================================================
          4. COURSE CARDS & LEARNING PATH PREVIEW
         ===================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#4F6BFF] dark:text-[#8DA2FF]">
              4 Studio Chapters · {projects.length} Portfolio Projects
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-3xl dark:text-white">
              Explore the Creative Atelier Curriculum
            </h2>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#4F6BFF] px-5 py-2.5 font-display text-xs font-extrabold text-white shadow-[0_10px_24px_-6px_rgba(79,107,255,0.5)] transition-transform hover:scale-105"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Open Full Atelier Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chapterFolios.map((folio) => {
            const isCobalt = folio.accent === "cobalt";
            const isMint = folio.accent === "mint";
            const isButter = folio.accent === "butter";

            return (
              <Link
                key={folio.id}
                to="/dashboard"
                className={cn(
                  "group flex min-h-[250px] flex-col justify-between rounded-[26px] p-5 transition-all hover:-translate-y-1",
                  isCobalt
                    ? "bg-gradient-to-br from-[#4F6BFF] via-[#5E60CE] to-[#6930C3] text-white shadow-[0_20px_40px_-14px_rgba(79,107,255,0.55)]"
                    : isMint
                      ? "border border-[#A7E3D1] bg-gradient-to-br from-[#E6FBF2] via-[#D1FAE5] to-[#A7E3D1]/70 text-[#0E1B3D] dark:border-[#A7E3D1]/30 dark:from-[#064E3B] dark:to-[#0F7656]/50 dark:text-white"
                      : isButter
                        ? "border border-[#FFE08A] bg-gradient-to-br from-[#FFFDF7] via-[#FEF3C7] to-[#FDE68A]/55 text-[#0E1B3D] dark:border-[#FFE08A]/30 dark:from-[#451A03] dark:to-[#78350F]/45 dark:text-white"
                        : "border border-[#C9BBFF] bg-gradient-to-br from-[#F8F7FF] via-[#EDE9FE] to-[#DDD6FE]/65 text-[#0E1B3D] dark:border-[#C9BBFF]/30 dark:from-[#2E1065] dark:to-[#4C1D95]/45 dark:text-white",
                )}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold">
                    <span>Chapter {folio.numberLabel}</span>
                    <span>
                      {folio.totalAuthoredLessonsCount} lessons · {folio.estimatedHours}h
                    </span>
                  </div>
                  <ChapterFolio3DArt
                    accent={folio.accent}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-xl font-extrabold tracking-tight">
                    {folio.shortTitle}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-xs leading-relaxed",
                      isCobalt ? "text-white/85" : "text-[#4A5578] dark:text-white/80",
                    )}
                  >
                    {folio.subtitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold",
                      isCobalt
                        ? "bg-white text-[#4F6BFF]"
                        : "bg-[#4F6BFF] text-white",
                    )}
                  >
                    <span>Explore Chapter</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          5. CREATIVE ATELIER FOOTER
         ===================================================================== */}
      <footer className="mt-12 rounded-[28px] border border-[#E5DFD3] bg-white/90 p-6 sm:p-10 shadow-[0_14px_34px_-16px_rgba(14,27,61,0.06)] dark:border-white/10 dark:bg-[#131E3A]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="space-y-3 md:col-span-5">
            <ForgeAcademiaLogo size="md" />
            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              Forge Academia Creative Atelier — the interactive coding studio where curious minds
              master HTML, CSS, JavaScript, TypeScript, and React through living blueprints.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenDiagnostic}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[#C9BBFF] bg-[#F5F3FF] px-4 py-1.5 text-xs font-bold text-[#4F6BFF] transition-colors hover:bg-[#EDE9FE] dark:border-white/15 dark:bg-[#1D294D] dark:text-[#C9BBFF]"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Take the 60s Skill Diagnostic</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-7">
            <div className="space-y-2.5">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E1B3D] dark:text-white">
                Curriculum
              </div>
              <ul className="space-y-2 text-xs font-medium text-[#4A5578] dark:text-[#CBD5F0]">
                <li>
                  <Link to="/learn/modules" className="hover:text-[#4F6BFF]">
                    01 · HTML Foundations
                  </Link>
                </li>
                <li>
                  <Link to="/learn/modules" className="hover:text-[#4F6BFF]">
                    02 · CSS Magic &amp; Layout
                  </Link>
                </li>
                <li>
                  <Link to="/learn/modules" className="hover:text-[#4F6BFF]">
                    03 · JavaScript Adventure
                  </Link>
                </li>
                <li>
                  <Link to="/learn/modules" className="hover:text-[#4F6BFF]">
                    04 · React Architecture
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E1B3D] dark:text-white">
                Studio Tools
              </div>
              <ul className="space-y-2 text-xs font-medium text-[#4A5578] dark:text-[#CBD5F0]">
                <li>
                  <Link to="/dashboard" className="hover:text-[#4F6BFF]">
                    Atelier Studio Desk
                  </Link>
                </li>
                <li>
                  <Link to="/playground" className="hover:text-[#4F6BFF]">
                    Live Code Playground
                  </Link>
                </li>
                <li>
                  <Link to="/debug-lab" className="hover:text-[#4F6BFF]">
                    Debug Lab Quests
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-[#4F6BFF]">
                    Portfolio Projects
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E1B3D] dark:text-white">
                Academy
              </div>
              <ul className="space-y-2 text-xs font-medium text-[#4A5578] dark:text-[#CBD5F0]">
                <li>
                  <Link to="/achievements" className="hover:text-[#4F6BFF]">
                    Sticker Collection
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#4F6BFF]">
                    About Forge Academia
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="hover:text-[#4F6BFF]">
                    Studio Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5DFD3]/80 pt-5 text-xs text-[#7B86A6] dark:border-white/10 dark:text-[#94A3C9]">
          <span>© {new Date().getFullYear()} Forge Academia · Creative Atelier for Frontend Minds</span>
          <span className="font-mono">Not just lessons. Real skills. A brighter future.</span>
        </div>
      </footer>
    </div>
  );
}
