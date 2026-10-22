import { createFileRoute } from "@tanstack/react-router";
import { AtelierTopNav } from "@/components/atelier/atelier-top-nav";
import { LiveBlueprintStage } from "@/components/atelier/live-blueprint-stage";
import { StudioDeskHero } from "@/components/atelier/studio-desk-hero";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creative Studio · Forge Academia" },
      {
        name: "description",
        content: "Your Creative Atelier workbench for learning frontend engineering by building real interfaces.",
      },
    ],
  }),
  component: StudioDashboardPage,
});

export function StudioDashboardPage() {
  return (
    <div className="atelier-paper-grid min-h-dvh overflow-x-clip bg-[#FFFDF9] text-[#0E1B3D]">
      <AtelierTopNav />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-7 sm:py-9 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[.22em] text-[#4F6BFF]">Forge Academia · Creative Atelier</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Your ideas, on the workbench.</h1>
          </div>
          <span className="rounded-full border border-[#0E1B3D]/10 bg-white px-4 py-2 font-mono text-xs text-[#596174]">LEARN · EXPERIMENT · BUILD</span>
        </div>
        <StudioDeskHero />
        <LiveBlueprintStage />
      </main>
      <footer className="border-t border-[#0E1B3D]/10 px-4 py-5 text-center font-mono text-[11px] uppercase tracking-[.18em] text-[#7A8090]">
        Forge Academia · Built by curiosity, refined by practice
      </footer>
    </div>
  );
}
