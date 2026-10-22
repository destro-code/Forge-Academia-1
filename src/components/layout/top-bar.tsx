import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Command, Flame, Moon, Search, Sun } from "lucide-react";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";
import { useTheme } from "@/lib/hooks/use-theme";
import { useProgress } from "@/lib/hooks/use-progress";
import { useAchievements, useLessons } from "@/lib/hooks/use-content";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { evaluateAchievements } from "@/lib/utils/achievements";
import { contentProvider } from "@/lib/providers/content-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const LABELS: Record<string, string> = {
  "": "Command Center",
  learn: "Learning Paths",
  modules: "Modules",
  topics: "Topics",
  lessons: "Lessons",
  lesson: "Lesson",
  practice: "Practice Arena",
  projects: "Projects",
  "debug-lab": "Debug Lab",
  interview: "Mock Interviews",
  session: "Session",
  mentor: "AI Mentor",
  playground: "Code Playground",
  quizzes: "Quizzes",
  flashcards: "Flashcards",
  bookmarks: "Bookmarks",
  resources: "Resources",
  docs: "Docs",
  progress: "Progress & Milestones",
  mastery: "Skill Mastery",
  achievements: "Achievements",
  certificates: "Certificates",
  analytics: "Growth Analytics",
  statistics: "Statistics",
  challenges: "Daily Challenges",
  whiteboard: "Whiteboard",
  journal: "Journal",
  settings: "Settings",
  about: "Academy Overview",
};

function useCrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return [];
  const crumbs = [{ label: "Workspace", to: "/" as const }];
  let acc = "";
  parts.forEach((p) => {
    acc += "/" + p;
    let label = LABELS[p];
    if (!label) {
      const lesson = contentProvider.getLesson(p);
      if (lesson) label = lesson.title;
      else {
        const topic = contentProvider.getTopic(p);
        if (topic) label = topic.title;
        else {
          const project = contentProvider.getProject(p);
          if (project) label = project.title;
          else {
            const moduleItem = contentProvider.getModule(p);
            if (moduleItem) label = moduleItem.title;
            else {
              const quiz = contentProvider.getQuiz(p);
              if (quiz) label = quiz.title;
              else {
                const bug = contentProvider.getBug(p);
                if (bug) label = bug.title;
                else label = p;
              }
            }
          }
        }
      }
    }
    crumbs.push({ label, to: acc as "/" });
  });
  return crumbs;
}

interface DynamicNotification {
  id: string;
  title: string;
  body: string;
  tag: string;
  to: string;
}

export function TopBar() {
  const { setOpen } = useCommandPalette();
  const { theme, toggle } = useTheme();
  const progress = useProgress();
  const lessons = useLessons();
  const achievements = useAchievements();
  const { currentLesson, completedCount, totalLessons } = useCurriculumResume();
  const crumbs = useCrumbs();
  const isDashboard =
    crumbs.length === 0 || (crumbs.length === 1 && crumbs[0]?.to === "/dashboard");
  const [readIds, setReadIds] = useState<string[]>([]);

  const notifications = useMemo<DynamicNotification[]>(() => {
    const items: DynamicNotification[] = [];

    // 1. Current curriculum step
    if (currentLesson) {
      items.push({
        id: `lesson-${currentLesson.id}`,
        title: completedCount === 0 ? "Ready to start your path" : "Continue your active lesson",
        body: `${currentLesson.title} (${completedCount}/${totalLessons} verified)`,
        tag: "Curriculum",
        to: `/lesson/${currentLesson.id}`,
      });
    }

    // 2. Spaced-repetition topics due
    const dueTopics = Object.values(progress.topicMasteryRecords || {}).filter(
      (r) => r.state === "Needs Review" || r.confidence < 60,
    );
    if (dueTopics.length > 0) {
      items.push({
        id: `due-${dueTopics.length}`,
        title: `${dueTopics.length} topic${dueTopics.length === 1 ? "" : "s"} due for recall`,
        body: `Review ${dueTopics[0].topicTitle} in Skill Mastery to lock in retention.`,
        tag: "Recall",
        to: "/mastery",
      });
    }

    // 3. Real unlocked achievement
    const unlocked = evaluateAchievements(achievements as never, progress, lessons).filter(
      (a) => a.unlocked,
    );
    if (unlocked.length > 0) {
      const latest = unlocked[unlocked.length - 1];
      items.push({
        id: `ach-${latest.id}`,
        title: `Badge unlocked: ${latest.title}`,
        body: `${latest.tier.toUpperCase()} tier · ${unlocked.length} total badges earned`,
        tag: "Earned",
        to: "/achievements",
      });
    } else {
      items.push({
        id: "diagnostic-prompt",
        title: "Calibrate your starting module",
        body: "Take the 60-second skill diagnostic on the Studio Dashboard to find your ideal track.",
        tag: "Setup",
        to: "/dashboard",
      });
    }

    return items;
  }, [currentLesson, completedCount, totalLessons, progress, achievements, lessons]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const activeMobileLabel = isDashboard
    ? "Studio"
    : crumbs[crumbs.length - 1]?.label || "Workspace";

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b px-3 sm:h-15 sm:px-6">
      <div className="flex min-w-0 shrink items-center gap-2">
        <SidebarTrigger className="hidden h-9 w-9 shrink-0 text-muted-foreground md:inline-flex" />

        {/* Mobile Brand Header (< md): Forge Ember Emblem + Wordmark + Active Section */}
        <div className="flex min-w-0 items-center gap-2 md:hidden">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-lg py-1 pr-1 transition-transform active:scale-95"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 border border-primary/40 text-primary shadow-[0_0_14px_-2px_var(--primary)]">
              <Flame className="h-4 w-4 fill-primary/25" />
            </span>
            <span className="font-heading text-sm font-extrabold tracking-tight text-foreground">
              FORGE
            </span>
          </Link>
          <span className="h-3.5 w-px shrink-0 bg-border/80" aria-hidden="true" />
          <span className="max-w-[135px] truncate rounded-md bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:max-w-[200px]">
            {activeMobileLabel}
          </span>
        </div>

        {/* Desktop Breadcrumbs (md+) */}
        {isDashboard ? (
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] md:flex"
          >
            <span className="shrink-0 text-muted-foreground">Workspace</span>
            <span className="shrink-0 text-border" aria-hidden="true">
              /
            </span>
            <span className="truncate font-semibold text-foreground">Command Center</span>
          </nav>
        ) : (
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 max-w-md items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] md:flex lg:max-w-xl"
          >
            {crumbs.map((c, i) => (
              <div key={c.to + i} className="flex min-w-0 shrink items-center gap-1.5">
                {i > 0 && (
                  <span className="shrink-0 text-border" aria-hidden="true">
                    /
                  </span>
                )}
                <Link
                  to={c.to}
                  className={
                    i === crumbs.length - 1
                      ? "min-w-0 truncate font-semibold text-foreground"
                      : "min-w-0 truncate text-muted-foreground transition hover:text-foreground"
                  }
                >
                  {c.label}
                </Link>
              </div>
            ))}
          </nav>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden h-9 items-center gap-2 rounded-md border border-border bg-muted/20 px-2.5 text-xs text-muted-foreground transition hover:bg-muted/40 md:flex md:w-56 lg:w-64"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <span className="flex-1 text-left">Search lessons, labs, tools…</span>
          <kbd className="ml-2 inline-flex items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          aria-label="Search"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Streak chip */}
        <Link
          to="/progress"
          aria-label={`Learning streak: ${progress.streakDays} days`}
          className="inline-flex h-8 sm:h-9 items-center gap-1 rounded-full sm:rounded-md border border-primary/30 bg-primary/10 px-2.5 font-mono text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/15"
        >
          <Flame className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="tabular-nums">{progress.streakDays}</span>
        </Link>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <span className="text-xs font-semibold">Activity &amp; Updates</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setReadIds(notifications.map((n) => n.id))}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-72 divide-y overflow-auto text-sm">
              {notifications.map((n) => {
                const isUnread = !readIds.includes(n.id);
                return (
                  <li key={n.id} className="p-3 transition-colors hover:bg-muted/40">
                    <Link
                      to={n.to as "/"}
                      onClick={() =>
                        setReadIds((prev) => (prev.includes(n.id) ? prev : [...prev, n.id]))
                      }
                      className="block space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{n.title}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                          {isUnread ? n.tag : "Read"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="hidden text-muted-foreground hover:text-foreground sm:flex"
          aria-label="Keyboard Shortcuts (?)"
          title="Keyboard Shortcuts (?)"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
          }}
        >
          <kbd className="grid h-6 w-6 place-items-center rounded border border-border bg-muted/40 font-mono text-[11px] font-bold">
            ?
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Profile menu">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary font-mono text-[11px] font-bold text-foreground">
                LR
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in as Learner</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/mastery">Skill Mastery &amp; Recall</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/analytics">Growth Analytics</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/progress">Progress &amp; Milestones</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/achievements">Achievements</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/about">Academy Overview</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
