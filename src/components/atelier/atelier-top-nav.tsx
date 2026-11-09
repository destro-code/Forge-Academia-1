import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  Bug,
  ChevronDown,
  FolderKanban,
  Home,
  Map,
  Moon,
  Search,
  Settings,
  Sun,
  Terminal,
  Trophy,
} from "lucide-react";
import { ForgeAcademiaLogo } from "./forge-buddy-illos";
import { useTheme } from "@/lib/hooks/use-theme";
import { cn } from "@/lib/utils";

interface AtelierTopNavProps {
  onOpenDiagnostic?: () => void;
}

const primaryItems = [
  { to: "/learn/modules", label: "Learn", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/playground", label: "Playground", icon: Terminal },
  { to: "/debug-lab", label: "Debug Lab", icon: Bug },
] as const;

const secondaryItems = [
  { to: "/progress", label: "Capability Map", icon: Map },
  { to: "/interview", label: "Interview Practice", icon: Briefcase },
  { to: "/achievements", label: "Achievements", icon: Trophy },
] as const;

export function AtelierTopNav({ onOpenDiagnostic }: AtelierTopNavProps) {
  const location = useLocation();
  const { resolvedTheme, toggle } = useTheme();

  const triggerCommandPalette = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }));
  };

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-3.5 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          title="Forge home"
          aria-label="Forge home"
          className="group flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ForgeAcademiaLogo size="sm" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center gap-1 xl:flex">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <details className="relative">
            <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
              More <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute left-0 top-full z-50 mt-2 min-w-48 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className={cn(
                    "flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                    isActive(item.to) ? "bg-accent text-accent-foreground" : "text-popover-foreground hover:bg-muted",
                  )}>
                    <Icon className="h-4 w-4" />{item.label}
                  </Link>
                );
              })}
            </div>
          </details>
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={triggerCommandPalette}
            aria-label="Search lessons, projects and tools"
            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:min-w-40 sm:justify-start"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden text-sm sm:inline">Search Forge</span>
            <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">⌘K</kbd>
          </button>



          {onOpenDiagnostic && (
            <button type="button" onClick={onOpenDiagnostic} className="hidden min-h-10 items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted 2xl:inline-flex">
              Take Skill Check
            </button>
          )}

          <button
            type="button"
            onClick={toggle}
            aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <nav aria-label="Mobile navigation" className="flex w-full items-center gap-1 overflow-x-auto border-t border-border/70 px-3.5 py-1.5 scrollbar-none xl:hidden">
        <Link to="/dashboard" aria-current={location.pathname === "/dashboard" ? "page" : undefined} className={cn(
          "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
          location.pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
        )}>
          <Home className="h-3.5 w-3.5" />Home
        </Link>
        {[...primaryItems, ...secondaryItems].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link key={item.to} to={item.to} aria-current={active ? "page" : undefined} className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
            )}>
              <Icon className="h-3.5 w-3.5" />{item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
