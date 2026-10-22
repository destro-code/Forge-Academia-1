import { canonicalManifest } from "@/lib/curriculum/manifest";

export const ATELIER_CHAPTERS = [
  { id: "01", title: "HTML & Web Foundations", subtitle: "Structure and meaning", color: "mint", moduleIds: ["module-0-1", "module-0-2", "module-1-1"] },
  { id: "02", title: "CSS Magic & Layout Craft", subtitle: "Style, layout and access", color: "cobalt", moduleIds: ["module-1-2", "module-1-3", "module-1-4"] },
  { id: "03", title: "JavaScript & TypeScript", subtitle: "Behavior, data and tools", color: "butter", moduleIds: ["module-2-1", "module-2-2", "module-2-3", "module-2-4", "module-2-5"] },
  { id: "04", title: "React & Application Architecture", subtitle: "Build complete interfaces", color: "lilac", moduleIds: ["module-3-1", "module-3-2", "module-3-3", "module-3-4", "module-4-1", "module-4-2"] },
] as const;

export function getAtelierModules() {
  const active = canonicalManifest.getModules().filter((module) => module.lessonIds.length > 0);
  return ATELIER_CHAPTERS.map((chapter) => ({
    ...chapter,
    modules: chapter.moduleIds.map((id) => active.find((module) => module.moduleId === id)).filter((module) => module !== undefined),
  }));
}

export function getAuthoredModuleLessons(moduleId: string) {
  return canonicalManifest.getAuthoredLessonsForModule(moduleId);
}

export function getUtcWeekActiveDays(activityDates: string[] = [], now = new Date()): number {
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekday = monday.getUTCDay();
  monday.setUTCDate(monday.getUTCDate() - ((weekday + 6) % 7));
  const start = monday.toISOString().slice(0, 10);
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const end = sunday.toISOString().slice(0, 10);
  const uniqueDates = new Set<string>();
  for (const date of activityDates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const timestamp = Date.parse(date + "T00:00:00.000Z");
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) continue;
    if (date >= start && date <= end) uniqueDates.add(date);
  }
  return uniqueDates.size;
}
