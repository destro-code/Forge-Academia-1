import { Link } from "@tanstack/react-router";
import { BookOpen, Command, Flame, FolderKanban, GraduationCap, LayoutDashboard, Moon, Search, Sun, Trophy } from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useTheme } from "@/lib/hooks/use-theme";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";

const links = [
  { to: "/dashboard", label: "Studio", icon: LayoutDashboard },
  { to: "/learn", label: "Learning Path", icon: GraduationCap },
  { to: "/playground", label: "Playground", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/achievements", label: "Achievements", icon: Trophy },
];

export function AtelierTopNav() {
  const progress = useProgress();
  const { resolvedTheme, toggle } = useTheme();
  const { setOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[color-mix(in_oklab,var(--background)_90%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--atelier-coral)] text-[var(--atelier-navy)] shadow-sm">
            <span className="text-xl font-black">F</span>
          </span>
          <span className="hidden text-lg font-extrabold tracking-[-.04em] sm:block">FORGE <span className="font-medium text-muted-foreground">ACADEMIA</span></span>
          <span className="text-lg font-extrabold tracking-[-.04em] sm:hidden">FORGE</span>
        </Link>

        <nav aria-label="Atelier navigation" className="hidden items-center gap-1 xl:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" activeProps={{ className: "inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary" }}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} aria-label="Search lessons and projects" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Search className="h-4 w-4" /><span className="hidden md:inline">Search lessons, projects...</span><kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] md:inline"><Command className="inline h-3 w-3" /> K</kbd>
          </button>
          <span title="Current streak" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[var(--atelier-butter)]/55 px-2.5 text-sm font-bold text-[var(--atelier-navy)]"><Flame className="h-4 w-4" />{progress.streakDays}</span>
          <span title="Experience points" className="hidden h-10 items-center rounded-xl border border-border bg-card px-3 font-mono text-xs font-bold sm:inline-flex">{(progress.xp || 0).toLocaleString()} XP</span>
          <button type="button" onClick={toggle} aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"} className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card hover:bg-muted">
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <nav aria-label="Mobile atelier navigation" className="flex gap-2 overflow-x-auto border-t border-border/60 px-4 py-2 xl:hidden">
        {links.map(({ to, label }) => <Link key={to} to={to} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">{label}</Link>)}
      </nav>
    </header>
  );
}
