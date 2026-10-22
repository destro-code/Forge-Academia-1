import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  LineChart,
  TrendingUp,
  Trophy,
  Award,
  Flame,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useLessons } from "@/lib/hooks/use-content";
import { cn } from "@/lib/utils";

const ANALYTICS_HUB_TABS = [
  {
    name: "Progress & Milestones",
    shortName: "Progress",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    name: "Growth Analytics",
    shortName: "Analytics",
    href: "/analytics",
    icon: LineChart,
  },
  {
    name: "Skill Mastery & Recall",
    shortName: "Mastery",
    href: "/mastery",
    icon: Brain,
  },
  {
    name: "Achievements",
    shortName: "Badges",
    href: "/achievements",
    icon: Trophy,
  },
  {
    name: "Certificates",
    shortName: "Certificates",
    href: "/certificates",
    icon: Award,
  },
] as const;

export function AnalyticsSubnav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const progress = useProgress();
  const lessons = useLessons();

  const xp = progress.xp ?? 0;
  const streakDays = progress.streakDays ?? 0;
  const currentLevel = progress.level || Math.max(1, Math.floor(xp / 250) + 1);
  const completedLessons = (progress.lessonsCompleted || []).length;
  const totalLessons = lessons.length || 1;
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="atelier-analytics-rail rounded-xl border border-border/80 bg-card/80 p-2.5 sm:p-3 shadow-xs backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Horizontal Snap-Scroll Sub-Navigation Tabs on Mobile */}
        <nav
          aria-label="Mastery and Analytics Hub Navigation"
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x pb-0.5 lg:flex-wrap lg:pb-0"
        >
          {ANALYTICS_HUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.href;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "snap-start shrink-0 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="sm:hidden">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Telemetry Summary Strip (Horizontal scroll on narrow screens) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-border/60 pt-2 text-xs lg:border-t-0 lg:pt-0">
          <div className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1 font-mono">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Lv.{currentLevel}</span>
            <span className="text-muted-foreground">· {xp.toLocaleString()} XP</span>
          </div>

          <div className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-foreground">
              {completedLessons}/{totalLessons}
            </span>
            <span className="text-muted-foreground">({overallPct}%)</span>
          </div>

          <div className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1 font-mono">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold text-foreground">{streakDays}d</span>
            <span className="text-muted-foreground">streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
