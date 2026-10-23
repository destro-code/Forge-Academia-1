import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  Bug,
  Compass,
  Flame,
  FolderKanban,
  Home,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Terminal,
  Trophy,
} from "lucide-react";
import { ForgeAcademiaLogo } from "./forge-buddy-illos";
import { useProgress } from "@/lib/hooks/use-progress";
import { useTheme } from "@/lib/hooks/use-theme";
import { cn } from "@/lib/utils";

interface AtelierTopNavProps {
  onOpenDiagnostic?: () => void;
}

export function AtelierTopNav({ onOpenDiagnostic }: AtelierTopNavProps) {
  const location = useLocation();
  const progress = useProgress();
  const { resolvedTheme, toggle } = useTheme();

  const triggerCommandPalette = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      }),
    );
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/learn/modules", label: "Modules", icon: BookOpen },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/playground", label: "Playground", icon: Terminal },
    { to: "/interview", label: "Interview Prep", icon: Briefcase },
    { to: "/debug-lab", label: "Debug Lab", icon: Bug },
    { to: "/achievements", label: "Achievements", icon: Trophy },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b border-[#E5DFD3]/90 bg-[#FFFDF9]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1226]/92">
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-6 lg:px-8">
        {/* Left: Forge Academia Brand Mark (routes to /dashboard inside Studio) & Unified Nav */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link
            to="/dashboard"
            title="Go to Forge Academia Dashboard"
            className="group shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF]"
          >
            <ForgeAcademiaLogo size="sm" />
          </Link>

          <nav
            aria-label="Creative Atelier navigation"
            className="hidden xl:flex items-center gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#EEF2FF] font-semibold text-[#4F6BFF] shadow-[inset_0_0_0_1px_rgba(79,107,255,0.22)] dark:bg-[#1D294D] dark:text-[#8DA2FF]"
                      : "text-[#4A5578] hover:bg-[#F4EFE6]/80 hover:text-[#0E1B3D] dark:text-[#CBD5F0] dark:hover:bg-white/5 dark:hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-[#4F6BFF] dark:text-[#8DA2FF]" : "text-[#7B86A6]",
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar ("Search lessons, projects...") */}
        <div className="flex min-w-0 flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-2">
          <button
            type="button"
            onClick={triggerCommandPalette}
            className="group flex h-9 sm:h-10 w-full min-w-0 items-center justify-between rounded-full border border-[#E5DFD3] bg-white px-3 sm:px-4 text-xs sm:text-sm text-[#7B86A6] shadow-[0_4px_14px_-4px_rgba(14,27,61,0.06)] transition-all hover:border-[#4F6BFF]/50 hover:shadow-[0_6px_20px_-4px_rgba(79,107,255,0.14)] dark:border-white/15 dark:bg-[#131E3A] dark:text-[#94A3C9]"
            aria-label="Search lessons, projects, and studio tools"
          >
            <span className="inline-flex min-w-0 items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#4F6BFF]" />
              <span className="truncate">Search lessons, projects...</span>
            </span>
            <kbd className="hidden sm:inline-flex shrink-0 items-center rounded-md border border-[#E5DFD3] bg-[#FFFDF9] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#4A5578] dark:border-white/15 dark:bg-[#0B1226] dark:text-[#CBD5F0]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Real Rhythm Indicators, Theme Toggle & Avatar */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {onOpenDiagnostic && (
            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="hidden md:inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#C9BBFF] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#4F6BFF] transition-all hover:bg-[#EDE9FE] dark:border-[#C9BBFF]/30 dark:bg-[#1D294D] dark:text-[#C9BBFF]"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Skill Check</span>
            </button>
          )}

          {/* Honest Streak Counter */}
          <div
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-[#FFE08A] bg-[#FFFBEB] px-3 text-xs font-bold text-[#92400E] dark:border-[#FFE08A]/30 dark:bg-[#FFE08A]/10 dark:text-[#FFE08A]"
            title="Current learning streak"
          >
            <Flame className="h-3.5 w-3.5 fill-[#FF8C7A] text-[#F59E0B]" />
            <span className="font-mono tabular-nums">{progress.streakDays}d</span>
          </div>

          {/* Honest XP Counter */}
          <div
            className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5DFD3] bg-white px-3 text-xs font-bold text-[#0E1B3D] dark:border-white/15 dark:bg-[#131E3A] dark:text-[#F8F6F0]"
            title="Total earned XP"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#4F6BFF]" />
            <span className="font-mono tabular-nums">{(progress.xp || 0).toLocaleString()} XP</span>
          </div>

          {/* Light / Dark Atelier Theme Toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={
              resolvedTheme === "dark" ? "Switch to Light Atelier theme" : "Switch to Dark theme"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DFD3] bg-white text-[#0E1B3D] transition-colors hover:border-[#4F6BFF] hover:text-[#4F6BFF] dark:border-white/15 dark:bg-[#131E3A] dark:text-[#F8F6F0]"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-[#FFE08A]" />
            ) : (
              <Moon className="h-4 w-4 text-[#4A5578]" />
            )}
          </button>

          {/* Settings / Profile Avatar */}
          <Link
            to="/settings"
            aria-label="Studio settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#4F6BFF] to-[#C9BBFF] text-white shadow-[0_4px_12px_rgba(79,107,255,0.3)] transition-transform hover:scale-105"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Compact Mobile & Tablet Horizontal Navigation Strip (<= 15% viewport height, zero horizontal overflow) */}
      <div className="flex xl:hidden w-full max-w-full items-center gap-1.5 overflow-x-auto border-t border-[#E5DFD3]/70 bg-[#FFFDF9] px-3.5 py-1.5 scrollbar-none dark:border-white/10 dark:bg-[#0B1226]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-[#4F6BFF] text-white shadow-xs"
                  : "bg-[#F4EFE6]/80 text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#131E3A] dark:text-[#CBD5F0]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
