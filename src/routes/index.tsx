import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { useTheme } from "@/lib/hooks/use-theme";
import { LandingExperience } from "@/components/home/landing-experience";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";
import { ForgeAcademiaLogo } from "@/components/atelier/forge-buddy-illos";
import { ArrowRight, Compass, LayoutDashboard, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — Frontend Engineering Academy" },
      {
        name: "description",
        content:
          "A creative engineering workshop where curiosity becomes understanding, experimentation becomes capability, and learning leads to independence.",
      },
      {
        property: "og:title",
        content: "Forge — Frontend Engineering Academy",
      },
      {
        property: "og:description",
        content:
          "Explore frontend engineering through discovery, experimentation, creation and investigation.",
      },
    ],
  }),
  component: StandaloneLandingPage,
});

const AUTO_REDIRECT_STORAGE_KEY = "forge:auto_redirect_dashboard";

function StandaloneLandingPage() {
  const navigate = useNavigate();
  const { resolvedTheme, toggle } = useTheme();
  const { completedCount } = useCurriculumResume();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(AUTO_REDIRECT_STORAGE_KEY) === "true";
    if (saved && completedCount > 0) {
      void navigate({ to: "/dashboard" });
    }
  }, [completedCount, navigate]);

  return (
    <div className="atelier-paper-grid min-h-dvh bg-background text-foreground flex flex-col">
      {/* Public navigation */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-18 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Forge identity */}
          <Link to="/" className="group shrink-0 focus-visible:outline-none">
            <ForgeAcademiaLogo size="sm" />
          </Link>

          {/* Primary destinations */}
          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground"
          >
            <Link
              to="/dashboard"
              className="transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/learn/modules"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              Modules
            </Link>
            <Link
              to="/projects"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              Projects
            </Link>
            <Link
              to="/playground"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              Playground
            </Link>
            <Link
              to="/interview"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              Interview Prep
            </Link>
            <Link
              to="/debug-lab"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              Debug Lab
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
            >
              About
            </Link>
          </nav>

          {/* Theme and entry actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setDiagnosticOpen(true)}
              className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/80"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>60s Skill Check</span>
            </button>

            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle color theme"
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            <Link
              to="/dashboard"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2 font-display text-xs sm:text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <LayoutDashboard className="h-3.5 w-3.5 hidden sm:inline" />
              <span>{completedCount > 0 ? "Open Studio" : "Get Started"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Landing experience */}
      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-8">
        <LandingExperience
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
          onSwitchToDashboard={() => void navigate({ to: "/dashboard" })}
        />
      </main>

      <SkillDiagnosticModal
        open={diagnosticOpen}
        onOpenChange={setDiagnosticOpen}
      />
    </div>
  );
}
