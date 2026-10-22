import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type AtelierRouteHeroProps = {
  label: string;
  title: string;
  description: string;
  icon: ReactNode;
  note: string;
};

export function AtelierRouteHero({ label, title, description, icon, note }: AtelierRouteHeroProps) {
  return (
    <section className="atelier-route-hero atelier-paper-grid relative isolate overflow-hidden rounded-3xl border border-border/70 p-5 sm:p-7 lg:p-8">
      <div className="relative z-10 grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_180px] lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="size-3.5" /> {label}
          </div>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
            <span>{note}</span>
          </div>
        </div>
        <div className="relative mx-auto grid size-36 place-items-center sm:size-40 lg:size-48" aria-hidden="true">
          <div className="absolute inset-3 rounded-full border border-dashed border-primary/30" />
          <div className="absolute inset-7 rotate-12 rounded-[1.6rem] border border-border bg-card/80 shadow-lg" />
          <div className="absolute inset-10 -rotate-6 rounded-2xl border border-primary/20 bg-primary/10" />
          <div className="relative grid size-16 place-items-center rounded-2xl border border-border bg-card text-primary shadow-md sm:size-[4.5rem]">
            {icon}
          </div>
          <span className="absolute right-1 top-5 size-3 rounded-full bg-[#FFE08A] ring-4 ring-background" />
          <span className="absolute bottom-4 left-2 size-2.5 rounded-full bg-[#A7E3D1] ring-4 ring-background" />
        </div>
      </div>
    </section>
  );
}
