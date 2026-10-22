import { Link } from "@tanstack/react-router";
import { Command, Flame, LayoutGrid, Moon, Sun } from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { useCommandPalette } from "@/lib/hooks/use-command-palette";
import { useTheme } from "@/lib/hooks/use-theme";

const navItems = [
  { label: "Studio", to: "/dashboard" as const },
  { label: "Learning Path", to: "/learn/" as const },
  { label: "Playground", to: "/playground" as const },
  { label: "Projects", to: "/projects" as const },
  { label: "Achievements", to: "/achievements" as const },
];

export function AtelierTopNav() {
  const progress = useProgress();
  const palette = useCommandPalette();
  const { resolvedTheme, toggle } = useTheme();
  return <header className="sticky top-0 z-40 border-b border-[#0E1B3D]/10 bg-[#FFFDF9]/90 px-4 py-3 backdrop-blur-xl sm:px-7">
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
      <Link to="/dashboard" className="flex items-center gap-2.5 text-[#0E1B3D] no-underline">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#A7E3D1] text-lg font-black shadow-[0_4px_0_#0E1B3D]">F.</span>
        <span className="text-lg font-extrabold tracking-tight">FORGE <span className="font-medium text-[#6D7180]">ACADEMIA</span></span>
      </Link>
      <nav aria-label="Atelier navigation" className="hidden items-center gap-1 xl:flex">
        {navItems.map((item) => <Link key={item.label} to={item.to} className="rounded-full px-3 py-2 text-sm font-semibold text-[#4E5568] transition hover:bg-[#F2EDE5] hover:text-[#0E1B3D]">{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE08A]/60 px-3 py-2 text-sm font-bold text-[#0E1B3D]"><Flame size={16}/>{progress.streakDays} <span className="hidden sm:inline">day streak</span></span>
        <span className="rounded-full bg-[#C9BBFF]/60 px-3 py-2 text-sm font-bold text-[#0E1B3D]">{progress.xp} XP</span>
        <button type="button" aria-label="Search lessons and projects" onClick={() => palette.setOpen(true)} className="grid size-10 place-items-center rounded-full border border-[#0E1B3D]/15 bg-white text-[#0E1B3D] hover:bg-[#F2EDE5]"><Command size={17}/><span className="sr-only">Search</span></button>
        <button type="button" aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggle} className="grid size-10 place-items-center rounded-full border border-[#0E1B3D]/15 bg-white text-[#0E1B3D] hover:bg-[#F2EDE5]">{resolvedTheme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}</button>
      </div>
    </div>
    <div className="mt-3 flex gap-2 overflow-x-auto xl:hidden">{navItems.map((item) => <Link key={item.label} to={item.to} className="shrink-0 rounded-full border border-[#0E1B3D]/10 bg-white px-3 py-2 text-xs font-semibold text-[#0E1B3D]">{item.label}</Link>)}</div>
  </header>;
}
