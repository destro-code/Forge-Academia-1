import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, Flame, LayoutGrid, Terminal } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const PRIMARY_TABS = [
  {
    id: "studio",
    label: "Studio",
    href: "/dashboard",
    icon: Flame,
    matches: (path: string) => path === "/dashboard" || path === "/" || path === "/about",
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learn",
    icon: BookOpen,
    matches: (path: string) =>
      path.startsWith("/learn") || path.startsWith("/projects") || path.startsWith("/docs"),
  },
  {
    id: "practice",
    label: "Practice",
    href: "/practice",
    icon: Terminal,
    matches: (path: string) =>
      path.startsWith("/practice") ||
      path.startsWith("/playground") ||
      path.startsWith("/debug-lab") ||
      path.startsWith("/challenges") ||
      path.startsWith("/interview"),
  },
  {
    id: "mastery",
    label: "Mastery",
    href: "/progress",
    icon: Compass,
    matches: (path: string) =>
      path.startsWith("/progress") ||
      path.startsWith("/analytics") ||
      path.startsWith("/mastery") ||
      path.startsWith("/achievements") ||
      path.startsWith("/certificates") ||
      path.startsWith("/statistics"),
  },
] as const;

export function MobileBottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { openMobile, setOpenMobile } = useSidebar();

  const isSecondaryRoute = !PRIMARY_TABS.some((tab) => tab.matches(currentPath));

  return (
    <nav
      aria-label="Mobile primary navigation"
      data-testid="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/92 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.35)] lg:hidden pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1.5">
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = !openMobile && tab.matches(currentPath);

          return (
            <Link
              key={tab.id}
              to={tab.href}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "group relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 h-0.5 w-6 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
                />
              )}
              <div
                className={cn(
                  "flex h-7 w-11 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-primary/15 text-primary" : "group-hover:bg-muted/50",
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform", isActive && "scale-105")} />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none tracking-tight",
                  isActive ? "font-bold text-foreground" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: More / Studio Drawer Trigger */}
        <button
          type="button"
          onClick={() => setOpenMobile(!openMobile)}
          aria-label="Open Studio tools and navigation drawer"
          aria-expanded={openMobile}
          className={cn(
            "group relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            openMobile || isSecondaryRoute
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {(openMobile || isSecondaryRoute) && (
            <span
              aria-hidden="true"
              className="absolute top-0.5 h-0.5 w-6 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
            />
          )}
          <div
            className={cn(
              "flex h-7 w-11 items-center justify-center rounded-full transition-colors",
              openMobile || isSecondaryRoute
                ? "bg-primary/15 text-primary"
                : "group-hover:bg-muted/50",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span
            className={cn(
              "text-[10px] leading-none tracking-tight",
              openMobile || isSecondaryRoute ? "font-bold text-foreground" : "font-medium",
            )}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
