import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, LineChart, TrendingUp, Trophy, Award, Flame, Zap, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useLessons } from "@/lib/hooks/use-content";
import { cn } from "@/lib/utils";

const HUB_ITEMS = [
  {
    to: "/mastery",
    label: "Skill Mastery & Recall",
    shortLabel: "Skill Mastery",
    icon: Brain,
  },
  {
    to: "/analytics",
    label: "Growth & Readiness Analytics",
    shortLabel: "Deep Analytics",
    icon: LineChart,
  },
  {
    to: "/progress",
    label: "Progress & Milestones",
    shortLabel: "Progress",
    icon: TrendingUp,
  },
  {
    to: "/achievements",
    label: "Achievements",
    shortLabel: "Badges",
    icon: Trophy,
  },
  {
    to: "/certificates",
    label: "Certificates",
    shortLabel: "Certificates",
    icon: Award,
  },
] as const;

export function AnalyticsSubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const progress = useProgress();
  const lessons = useLessons();

  const xp = progress.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const completedCount = progress.lessonsCompleted?.length || 0;
  const totalLessons = lessons.length || 155;
  const percent = Math.round((completedCount / Math.max(totalLessons, 1)) * 100);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <nav aria-label="Mastery and Analytics Hub navigation" className="flex flex-wrap items-center gap-1">
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-2 font-mono text-xs text-muted-foreground sm:border-t-0 sm:pt-0">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <strong className="font-semibold text-foreground">Lvl {level}</strong> · {xp} XP
        </span>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <strong className="font-semibold text-foreground">{completedCount}</strong>/{totalLessons} ({percent}%)
        </span>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <strong className="font-semibold text-foreground">{progress.streakDays || 0}d</strong> streak
        </span>
      </div>
    </div>
  );
}
