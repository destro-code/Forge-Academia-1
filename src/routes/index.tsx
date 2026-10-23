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
      { title: "Forge Academia · The Next Generation Coding Academy for Curious Minds" },
      {
        name: "description",
        content:
          "Turn your curiosity into real skills. Learn HTML, CSS, JavaScript, and React through hands-on projects, interactive 3D-inspired studios, and friendly mentorship.",
      },
      {
        property: "og:title",
        content: "Forge Academia · The Next Generation Coding Academy for Curious Minds",
      },
      {
        property: "og:description",
        content:
          "Not just lessons. Real skills. A brighter future. Explore the Creative Atelier for frontend engineering.",
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
    <div className="atelier-paper-grid min-h-dvh bg-[#FFFDF9] text-[#0E1B3D] flex flex-col dark:bg-[#0B1226] dark:text-[#F8F6F0]">
      {/* Top Navbar matching Panel 1 & Panel 4 ("Forge Academia · Home · Courses · Projects · About · Get Started") */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b border-[#E5DFD3]/80 bg-[#FFFDF9]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1226]/90">
        <div className="mx-auto flex h-16 sm:h-18 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand Emblem: Lightbulb + Forge Academia */}
          <Link to="/" className="group shrink-0 focus-visible:outline-none">
            <ForgeAcademiaLogo size="sm" />
          </Link>

          {/* Unified Center Navigation Links ("Dashboard · Modules · Projects · Playground · Debug Lab") */}
          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#4A5578] dark:text-[#CBD5F0]"
          >
            <Link
              to="/dashboard"
              className="transition-colors hover:text-[#4F6BFF] dark:hover:text-white"
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

          {/* Right Actions: Skill Check, Theme Toggle & Open Studio */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setDiagnosticOpen(true)}
              className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#C9BBFF] bg-[#F5F3FF] px-3.5 py-1.5 text-xs font-bold text-[#4F6BFF] transition-all hover:bg-[#EDE9FE] dark:border-white/15 dark:bg-[#1D294D] dark:text-[#C9BBFF]"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>60s Skill Check</span>
            </button>

            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle color theme"
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#E5DFD3] bg-white text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] dark:border-white/15 dark:bg-[#131E3A] dark:text-white"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-[#FFE08A]" />
              ) : (
                <Moon className="h-4 w-4 text-[#4A5578]" />
              )}
            </button>

            <Link
              to="/dashboard"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#4F6BFF] px-4 sm:px-5 py-2 font-display text-xs sm:text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(79,107,255,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#3B53D9]"
            >
              <LayoutDashboard className="h-3.5 w-3.5 hidden sm:inline" />
              <span>{completedCount > 0 ? "Open Studio" : "Get Started"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Landing Content matching Panels 1, 2, 4, 6, 7 & 8 */}
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
