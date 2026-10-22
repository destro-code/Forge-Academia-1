import { Link } from "@tanstack/react-router";
import { Command, Flame, Moon, Sun } from "lucide-react";
import { ForgeIcon, ForgeMark, type ForgeIconName } from "@/components/atelier/forge-signature-assets";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";
import { useTheme } from "@/lib/hooks/use-theme";

const navItems = [
  { label: "Studio", to: "/dashboard" as const, icon: "studio" as ForgeIconName },
  { label: "Learning Path", to: "/learn/" as const, icon: "learn" as ForgeIconName },
  { label: "Playground", to: "/playground" as const, icon: "playground" as ForgeIconName },
  { label: "Projects", to: "/projects" as const, icon: "projects" as ForgeIconName },
  { label: "Achievements", to: "/achievements" as const, icon: "awards" as ForgeIconName },
  { label: "Mastery", to: "/mastery" as const, icon: "progress" as ForgeIconName },
  { label: "Progress", to: "/progress" as const, icon: "progress" as ForgeIconName },
  { label: "Mentor", to: "/mentor" as const, icon: "mentor" as ForgeIconName },
  { label: "Settings", to: "/settings" as const, icon: "settings" as ForgeIconName },
];

const primaryNavItems = navItems.slice(0, 5);
const utilityNavItems = navItems.slice(5);

export function AtelierTopNav() {
  const progress = useProgress();
  const palette = useCommandPalette();
  const { resolvedTheme, toggle } = useTheme();
  return <header className="sticky top-0 z-40 border-b border-[#0E1B3D]/10 bg-[#FFFDF9]/90 dark:bg-[#101A32]/90 px-4 py-3 backdrop-blur-xl sm:px-7">
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
      <Link to="/dashboard" className="flex items-center gap-2.5 text-[#0E1B3D] no-underline dark:text-[#F4F0E8]">
        <span className="grid size-10 place-items-center rounded-2xl border border-[#0E1B3D]/10 bg-[#E9E4FF] shadow-[0_4px_0_#0E1B3D]"><ForgeMark size={31} /></span>
        <span className="text-lg font-extrabold tracking-tight">FORGE <span className="font-medium text-[#6D7180]">ACADEMIA</span></span>
      </Link>
      <nav aria-label="Atelier navigation" className="hidden items-center gap-1 xl:flex">
        {primaryNavItems.map((item) => <Link key={item.label} to={item.to} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#4E5568] transition hover:bg-[#F2EDE5] hover:text-[#0E1B3D] dark:text-[#C4CAD8] dark:hover:bg-white/10 dark:hover:text-white"><ForgeIcon name={item.icon} className="size-4" />{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <nav aria-label="More Forge destinations" className="hidden 2xl:flex items-center gap-1 border-r border-[#0E1B3D]/10 pr-2">
          {utilityNavItems.map((item) => <Link key={item.label} to={item.to} aria-label={item.label} title={item.label} className="grid size-9 place-items-center rounded-full text-[#4E5568] transition hover:bg-[#F2EDE5] hover:text-[#0E1B3D] dark:text-[#C4CAD8] dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF]"><ForgeIcon name={item.icon} className="size-4" /><span className="sr-only">{item.label}</span></Link>)}
        </nav>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE08A]/60 px-3 py-2 text-sm font-bold text-[#0E1B3D]"><Flame size={16}/>{progress.streakDays} <span className="hidden sm:inline">day streak</span></span>
        <span className="rounded-full bg-[#C9BBFF]/60 px-3 py-2 text-sm font-bold text-[#0E1B3D]">{progress.xp} XP</span>
        <button type="button" aria-label="Search lessons and projects" onClick={() => palette.setOpen(true)} className="grid size-10 place-items-center rounded-full border border-[#0E1B3D]/15 bg-white text-[#0E1B3D] hover:bg-[#F2EDE5] dark:border-white/15 dark:bg-[#182544] dark:text-[#F4F0E8] dark:hover:bg-white/10"><Command size={17}/><span className="sr-only">Search</span></button>
        <button type="button" aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggle} className="grid size-10 place-items-center rounded-full border border-[#0E1B3D]/15 bg-white text-[#0E1B3D] hover:bg-[#F2EDE5] dark:border-white/15 dark:bg-[#182544] dark:text-[#F4F0E8] dark:hover:bg-white/10">{resolvedTheme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}</button>
      </div>
    </div>
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 2xl:hidden" aria-label="All Forge destinations">{navItems.map((item) => <Link key={item.label} to={item.to} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#0E1B3D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#0E1B3D] transition hover:bg-[#F2EDE5] dark:border-white/15 dark:bg-[#182544] dark:text-[#F4F0E8] dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BFF]"><ForgeIcon name={item.icon} className="size-3.5" />{item.label}</Link>)}</div>
  </header>;
}
