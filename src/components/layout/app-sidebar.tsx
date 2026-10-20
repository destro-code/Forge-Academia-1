import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Layers,
  FolderKanban,
  Bug,
  MessagesSquare,
  Sparkles,
  Terminal,
  ListChecks,
  Zap,
  Bookmark,
  Library,
  FileText,
  LineChart,
  Trophy,
  Award,
  Settings,
  Flame,
  Blocks,
  BookOpenText,
  PenTool,
  Brain,
  Compass,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCurriculumResume } from "@/lib/utils/curriculum-order";
import { cn } from "@/lib/utils";

type Tier = "core" | "secondary" | "utility";

type Item = {
  id?: string;
  title: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  icon: React.ComponentType<{ className?: string }>;
  tier: Tier;
  customActive?: (pathname: string, search: Record<string, unknown>) => boolean;
};

const commandCenterItems: Item[] = [
  { title: "Command Center", to: "/", icon: LayoutDashboard, tier: "core" },
  { title: "Landing & Overview", to: "/about", icon: Compass, tier: "secondary" },
];

const practiceItems: Item[] = [
  { title: "Practice Arena Hub", to: "/practice", icon: Zap, tier: "core" },
  { title: "Code Playground", to: "/playground", icon: Terminal, tier: "core" },
  { title: "Debug Lab", to: "/debug-lab", icon: Bug, tier: "core" },
  { title: "Guided Projects", to: "/projects", icon: FolderKanban, tier: "core" },
  { title: "Interview Academy", to: "/interview", icon: MessagesSquare, tier: "core" },
  { title: "Quizzes", to: "/quizzes", icon: ListChecks, tier: "secondary" },
];

const masteryAndAnalyticsItems: Item[] = [
  {
    title: "Skill Mastery & Recall",
    to: "/mastery",
    icon: Brain,
    tier: "core",
  },
  {
    title: "Growth Analytics",
    to: "/analytics",
    icon: LineChart,
    tier: "core",
  },
  {
    title: "Progress & Milestones",
    to: "/progress",
    icon: TrendingUp,
    tier: "secondary",
  },
  {
    title: "Achievements & Certs",
    to: "/achievements",
    icon: Trophy,
    tier: "secondary",
    customActive: (p) =>
      p.startsWith("/achievements") ||
      p.startsWith("/certificates") ||
      p.startsWith("/certificate/"),
  },
];

const studioToolsPrimary: Item[] = [
  { title: "AI Mentor", to: "/mentor", icon: Sparkles, tier: "core" },
  { title: "Flashcards", to: "/flashcards", icon: Blocks, tier: "secondary" },
  { title: "Daily Challenges", to: "/challenges", icon: Award, tier: "secondary" },
];

const studioToolsMore: Item[] = [
  { title: "Whiteboard Mode", to: "/whiteboard", icon: PenTool, tier: "utility" },
  { title: "Journal", to: "/journal", icon: BookOpenText, tier: "utility" },
  { title: "Bookmarks", to: "/bookmarks", icon: Bookmark, tier: "utility" },
  { title: "Resources", to: "/resources", icon: Library, tier: "utility" },
  { title: "Docs", to: "/docs", icon: FileText, tier: "utility" },
  { title: "Settings", to: "/settings", icon: Settings, tier: "utility" },
];

export function AppSidebar() {
  const { location } = useRouterState();
  const path = location.pathname;
  const search = (location.search || {}) as Record<string, unknown>;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const progress = useProgress();
  const { currentLesson, orderedLessons } = useCurriculumResume();

  const isMoreToolActive = studioToolsMore.some(
    (item) => path === item.to || path.startsWith(item.to + "/"),
  );
  const [showMoreTools, setShowMoreTools] = useState<boolean>(isMoreToolActive);

  const targetCurriculumLessonId = currentLesson?.id || orderedLessons[0]?.id || "lesson-0-1-1";

  const learnItems: Item[] = [
    {
      id: "full-curriculum",
      title: "Interactive Curriculum",
      to: "/lesson/$lessonId",
      params: { lessonId: targetCurriculumLessonId },
      search: { mode: "curriculum" },
      icon: GraduationCap,
      tier: "core",
      customActive: (p, s) => p.startsWith("/lesson/") && s.mode === "curriculum",
    },
    {
      id: "modules",
      title: "Modules (17)",
      to: "/learn/modules",
      icon: Layers,
      tier: "core",
      customActive: (p, s) =>
        p === "/learn" ||
        p === "/learn/modules" ||
        p.startsWith("/learn/modules/") ||
        (p.startsWith("/lesson/") && s.mode === "module"),
    },
    {
      id: "lessons",
      title: "Lesson Catalog",
      to: "/learn/lessons",
      icon: BookOpen,
      tier: "secondary",
      customActive: (p) =>
        p === "/learn/lessons" ||
        p.startsWith("/learn/lessons/") ||
        p === "/learn/topics" ||
        p.startsWith("/learn/topics/") ||
        p === "/learn/paths",
    },
  ];

  const isItemActive = (item: Item) => {
    if (item.customActive) {
      return item.customActive(path, search);
    }
    return item.to === "/" ? path === "/" : path === item.to || path.startsWith(item.to + "/");
  };

  const renderItem = (item: Item) => {
    const active = isItemActive(item);
    const Icon = item.icon;

    let textStyle = "text-xs font-medium text-foreground/90";
    let iconStyle = "h-4 w-4 shrink-0 text-primary/80 group-hover/link:text-primary";
    let buttonClass = "";

    if (item.tier === "core") {
      textStyle = active
        ? "text-xs font-semibold text-primary"
        : "text-xs font-medium text-foreground/90 group-hover/link:text-foreground";
      iconStyle = active
        ? "h-4 w-4 shrink-0 text-primary"
        : "h-4 w-4 shrink-0 text-primary/80 group-hover/link:text-primary";
      buttonClass = active
        ? collapsed
          ? "bg-primary/15 text-primary font-semibold rounded-md"
          : "bg-primary/10 text-primary font-semibold rounded-md"
        : "";
    } else if (item.tier === "secondary") {
      textStyle = active
        ? "text-xs font-medium text-foreground"
        : "text-xs font-normal text-muted-foreground group-hover/link:text-foreground";
      iconStyle = active
        ? "h-4 w-4 shrink-0 text-foreground"
        : "h-4 w-4 shrink-0 text-muted-foreground/70 group-hover/link:text-foreground/80";
      buttonClass = active ? "bg-sidebar-accent/80 text-foreground rounded-md" : "";
    } else {
      textStyle = active
        ? "text-xs font-medium text-foreground"
        : "text-xs font-normal text-muted-foreground/80 group-hover/link:text-foreground/90";
      iconStyle = active
        ? "h-3.5 w-3.5 shrink-0 text-foreground"
        : "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover/link:text-foreground/70";
      buttonClass = active ? "bg-sidebar-accent/60 text-foreground rounded-md" : "";
    }

    return (
      <SidebarMenuItem key={item.id || item.to + item.title}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={collapsed ? item.title : undefined}
          className={buttonClass}
        >
          {item.params ? (
            <Link
              to={item.to}
              params={item.params}
              search={item.search}
              className="group/link flex items-center gap-2.5 min-h-[38px] sm:min-h-[32px]"
            >
              <Icon className={iconStyle} />
              {!collapsed && <span className={cn("truncate", textStyle)}>{item.title}</span>}
            </Link>
          ) : (
            <Link
              to={item.to}
              search={item.search}
              className="group/link flex items-center gap-2.5 min-h-[38px] sm:min-h-[32px]"
            >
              <Icon className={iconStyle} />
              {!collapsed && <span className={cn("truncate", textStyle)}>{item.title}</span>}
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (label: string, items: Item[]) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/65 px-2 py-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <Link
          to="/"
          aria-label="Forge Frontend Academy Home"
          className={cn(
            "group flex items-center rounded-xl border border-transparent py-2 transition hover:border-sidebar-border hover:bg-sidebar-accent/60",
            collapsed ? "justify-center px-0" : "gap-2.5 px-2",
          )}
        >
          <img
            src="/forge-logo.png"
            alt="Forge"
            width={38}
            height={38}
            className="h-9 w-9 shrink-0 rounded-lg object-contain shadow-xs transition-transform duration-200 group-hover:scale-105"
          />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold leading-tight tracking-tight text-foreground">
                Forge
              </div>
              <div className="truncate text-xs font-medium text-muted-foreground/80">
                Frontend Academy
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin space-y-0.5">
        {renderGroup("01 · Workspace", commandCenterItems)}
        {renderGroup("02 · Learn", learnItems)}
        {renderGroup("03 · Practice Arena", practiceItems)}
        {renderGroup("04 · Mastery & Analytics", masteryAndAnalyticsItems)}

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/65 px-2 py-1">
              05 · Studio Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {studioToolsPrimary.map(renderItem)}
              {!collapsed ? (
                <>
                  <SidebarMenuItem>
                    <button
                      type="button"
                      onClick={() => setShowMoreTools((v) => !v)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
                    >
                      <span className="font-mono text-[11px]">
                        {showMoreTools ? "Hide Utility Tools" : "More Tools (6)"}
                      </span>
                      {showMoreTools ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </SidebarMenuItem>
                  {showMoreTools && studioToolsMore.map(renderItem)}
                </>
              ) : (
                studioToolsMore.slice(0, 2).map(renderItem)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        {!collapsed ? (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="h-3.5 w-3.5 text-primary" />
                Learning Streak
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                {progress.streakDays}d
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-sidebar-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(6, (progress.streakDays / 7) * 100))}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-accent/40">
            <Flame className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
