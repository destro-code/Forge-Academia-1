import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import {
  DebugLabBugHunter3D,
  HandwrittenCallout,
} from "@/components/atelier/forge-buddy-illos";
import { useBugs } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { Bug, Clock, ArrowRight, Search, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { BugCategory } from "@/lib/types";

export const Route = createFileRoute("/debug-lab/")({
  head: () => ({
    meta: [
      { title: "Debug Lab · Forge Academia" },
      {
        name: "description",
        content: "Real bugs. Real diagnostics. Master defensive engineering.",
      },
      { property: "og:title", content: "Debug Lab · Forge Academia" },
      {
        property: "og:description",
        content: "Learn defensive engineering by fixing broken things.",
      },
    ],
  }),
  component: DebugLab,
});

const CATEGORIES: { id: BugCategory | "all"; label: string }[] = [
  { id: "all", label: "All Quests" },
  { id: "react_app", label: "React Apps" },
  { id: "console_error", label: "Console Errors" },
  { id: "network", label: "Network" },
  { id: "css", label: "CSS & Layout" },
  { id: "a11y", label: "Accessibility" },
  { id: "performance", label: "Performance" },
  { id: "memory_leak", label: "Memory Leaks" },
  { id: "hooks", label: "Hooks" },
];

function getCategoryLabel(category: BugCategory) {
  switch (category) {
    case "react_app":
      return "Broken React App";
    case "console_error":
      return "Console Error";
    case "network":
      return "Network Bug";
    case "css":
      return "CSS / Layout";
    case "a11y":
      return "Accessibility";
    case "performance":
      return "Performance";
    case "memory_leak":
      return "Memory Leak";
    case "hooks":
      return "React Hooks";
  }
}

function DebugLab() {
  const bugs = useBugs();
  const { solvedBugs = [] } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState<BugCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBugs = bugs.filter((b) => {
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.brief.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const solvedCount = bugs.filter((b) => solvedBugs.includes(b.id)).length;
  const completionPercent = Math.round((solvedCount / Math.max(bugs.length, 1)) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* Creative Atelier Debug Lab Hero */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[28px] sm:rounded-[34px] border border-[#E5DFD3] bg-gradient-to-br from-[#FFFDF9] via-[#FFF0ED] to-[#EEF2FF] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-18px_rgba(14,27,61,0.09)] dark:border-white/10 dark:from-[#0F1830] dark:via-[#131E3A] dark:to-[#1D294D]"
      >
        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#D9483B] dark:text-[#FF8C7A]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bug Hunter Studio · Defensive Engineering</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0E1B3D] sm:text-4xl dark:text-white">
              Inspect, Diagnose &amp;{" "}
              <span className="text-[#4F6BFF] dark:text-[#8DA2FF]">Squash Real Frontend Bugs.</span>
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
              Mistakes are how great engineers grow. Investigate broken React lifecycles, CSS layout
              shifts, network race conditions, and memory leaks in a safe interactive lab.
            </p>

            {/* Progress Strip inside Hero */}
            <div className="max-w-xl rounded-2xl border border-[#FF8C7A]/50 bg-white/90 p-4 shadow-xs dark:border-white/10 dark:bg-[#0B1226]/80">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#0E1B3D] dark:text-white">
                <span>
                  {solvedCount} of {bugs.length} Bug Quests Solved
                </span>
                <span className="font-mono text-[#0F7656] tabular-nums dark:text-[#A7E3D1]">
                  {completionPercent}% Complete
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#E5DFD3]/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF8C7A] via-[#FFE08A] to-[#A7E3D1] transition-all duration-500"
                  style={{ width: `${Math.max(completionPercent, solvedCount > 0 ? 6 : 3)}%` }}
                />
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center lg:col-span-4"
          >
            <DebugLabBugHunter3D className="h-36 sm:h-44 w-full max-w-[230px]" />
            <HandwrittenCallout rotation="-rotate-3" className="mt-1 text-xl text-[#1E3A8A] dark:text-[#FFE08A]">
              Every bug is a clue! 🔍
            </HandwrittenCallout>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-2xl border border-[#E5DFD3] bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#131E3A]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4F6BFF]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bug name, tag, or symptom..."
              className="h-10 rounded-full border-[#E5DFD3] bg-[#FFFDF9] pl-10 text-sm dark:border-white/15 dark:bg-[#0B1226]"
            />
          </div>

          {/* Horizontal Scrollable Category Pills on Mobile, Wrap on Desktop */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[38px] shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#4F6BFF] text-white shadow-xs"
                      : "bg-[#F4EFE6] text-[#4A5578] hover:text-[#0E1B3D] dark:bg-[#0B1226] dark:text-[#CBD5F0]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bug Quests Grid */}
      {filteredBugs.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-[#C9BBFF] bg-white/80 p-10 text-center dark:border-white/15 dark:bg-[#131E3A]">
          <Bug className="mx-auto mb-3 h-10 w-10 text-[#4F6BFF]" />
          <h2 className="font-display text-lg font-extrabold text-[#0E1B3D] dark:text-white">
            No debugging challenges match your filters
          </h2>
          <p className="mt-1 text-xs text-[#4A5578] dark:text-[#CBD5F0]">
            Try clearing your category filter or search terms.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-full"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredBugs.map((b, idx) => {
            const isSolved = solvedBugs.includes(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.32 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to="/debug-lab/$bugId"
                  params={{ bugId: b.id }}
                  className="group flex h-full flex-col justify-between rounded-[24px] border border-[#E5DFD3] bg-white p-5 shadow-[0_12px_28px_-10px_rgba(14,27,61,0.06)] transition-all hover:border-[#4F6BFF]/60 hover:shadow-[0_18px_36px_-12px_rgba(79,107,255,0.16)] dark:border-white/10 dark:bg-[#131E3A]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5578] dark:text-[#CBD5F0]">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                            isSolved
                              ? "border-[#A7E3D1] bg-[#E8F8F2] text-[#0F7656] dark:bg-[#064E3B] dark:text-[#A7E3D1]"
                              : "border-[#FF8C7A] bg-[#FFF0ED] text-[#D9483B] dark:bg-[#7F1D1D]/40 dark:text-[#FF8C7A]"
                          }`}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Bug className="h-4 w-4" />
                          )}
                        </div>
                        <DifficultyBadge difficulty={b.difficulty} />
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-semibold text-[#4F6BFF] dark:text-[#8DA2FF]">
                          {getCategoryLabel(b.category)}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 font-mono text-xs text-[#7B86A6] tabular-nums dark:text-[#94A3C9]">
                        <Clock className="h-3.5 w-3.5 text-[#D97706]" />
                        {b.estimatedMinutes}m
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-lg font-extrabold text-[#0E1B3D] group-hover:text-[#4F6BFF] transition-colors dark:text-white dark:group-hover:text-[#8DA2FF]">
                        {b.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs sm:text-sm leading-relaxed text-[#4A5578] dark:text-[#CBD5F0]">
                        {b.brief}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E5DFD3]/70 pt-3 text-xs dark:border-white/10">
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-[#7B86A6] dark:text-[#94A3C9]">
                      {(b.tags || []).slice(0, 3).map((t, i) => (
                        <span key={t}>
                          {i > 0 && <span className="mr-1">·</span>}#{t}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 font-display font-extrabold text-[#4F6BFF] group-hover:translate-x-0.5 transition-transform dark:text-[#8DA2FF]">
                      <span>{isSolved ? "Review Fix" : "Investigate Bug"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

