import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { useProgress } from "@/lib/hooks/use-progress";
import { useTheme } from "@/lib/hooks/use-theme";
import { LandingExperience } from "@/components/home/landing-experience";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Bug,
  Compass,
  Flame,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
  Terminal,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge · Interactive Frontend Engineering & Design Guild" },
      {
        name: "description",
        content:
          "Go from zero to frontend hero with hilarious ELI5 mental models, live CSS/DOM visual studios, and real debugging quests.",
      },
      {
        property: "og:title",
        content: "Forge · Interactive Frontend Engineering & Design Guild",
      },
      {
        property: "og:description",
        content:
          "Master HTML, CSS, JavaScript, and Systems Architecture inside live interactive studios.",
      },
    ],
  }),
  component: StandaloneLandingPage,
});

const AUTO_REDIRECT_STORAGE_KEY = "forge:auto_redirect_dashboard";

function StandaloneLandingPage() {
  const navigate = useNavigate();
  const progress = useProgress();
  const { theme, toggle } = useTheme();
  const { completedCount, totalLessons, currentLesson } = useCurriculumResume();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(AUTO_REDIRECT_STORAGE_KEY) === "true";
    setAutoRedirect(saved);
    if (saved && completedCount > 0) {
      void navigate({ to: "/dashboard" });
    }
  }, [completedCount, navigate]);

  const handleToggleAutoRedirect = () => {
    const next = !autoRedirect;
    setAutoRedirect(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTO_REDIRECT_STORAGE_KEY, String(next));
    }
    if (next) {
      void navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      {/* Standalone Full-Bleed Forge Guild Navbar (Distinct from Dashboard TopBar) */}
      <header className="glass-panel sticky top-0 z-40 border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary shadow-[0_0_20px_-4px_var(--primary)] transition-transform group-hover:scale-105">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div className="leading-none">
                <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                  FORGE
                </span>
                <span className="ml-2 hidden rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline-block">
                  Dev Guild
                </span>
              </div>
            </Link>

            {/* Primary Marketing / Exploration Nav */}
            <nav
              aria-label="Landing navigation"
              className="ml-4 hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <Link
                to="/learn/modules"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground inline-flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>17 Modules</span>
              </Link>
              <Link
                to="/playground"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live Playground</span>
              </Link>
              <Link
                to="/debug-lab"
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Bug className="h-3.5 w-3.5 text-amber-500" />
                <span>Debug Boss Labs</span>
              </Link>
              <button
                type="button"
                onClick={() => setDiagnosticOpen(true)}
                className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/60 hover:text-foreground inline-flex items-center gap-1.5"
              >
                <Compass className="h-3.5 w-3.5 text-sky-500" />
                <span>60s Skill Diagnostic</span>
              </button>
            </nav>
          </div>

          {/* Right CTA Cluster: Studio Dashboard Launch */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 font-mono text-xs">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold tabular-nums">{progress.xp} XP</span>
            </div>

            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:-translate-y-0.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Enter Studio Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* Returning Learner Fast-Lane Strip */}
      <div className="border-b border-primary/20 bg-primary/5">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {completedCount > 0 ? (
                <>
                  Welcome back, Guild Member! You&apos;ve mastered{" "}
                  <strong className="text-foreground">
                    {completedCount}/{totalLessons || 156} lessons
                  </strong>
                  . Next up: <strong className="text-foreground">{currentLesson?.title}</strong>.
                </>
              ) : (
                <>
                  Welcome to <strong className="text-foreground">Forge</strong> — where beginners
                  become fearless frontend engineers with ELI5 clarity, humor, and live studios.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={autoRedirect}
                onChange={handleToggleAutoRedirect}
                className="h-3.5 w-3.5 rounded accent-primary"
              />
              <span>Auto-open Dashboard on visit</span>
            </label>
            <Link
              to="/dashboard"
              className="font-mono text-[11px] font-semibold text-primary hover:underline"
            >
              Go to /dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Full-Bleed Landing Showcase */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <LandingExperience
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
          onSwitchToDashboard={() => void navigate({ to: "/dashboard" })}
        />
      </main>

      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
