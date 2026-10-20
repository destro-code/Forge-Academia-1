import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LandingExperience } from "@/components/home/landing-experience";
import { SkillDiagnosticModal } from "@/components/home/skill-diagnostic-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Sparkles, Blocks, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Academy Overview · Forge" },
      {
        name: "description",
        content:
          "About Forge Frontend Academy — interactive web design & frontend engineering studios, 17 modules, and deliberate practice.",
      },
      { property: "og:title", content: "Academy Overview · Forge" },
      { property: "og:description", content: "Why Forge exists and how our interactive studios work." },
    ],
  }),
  component: About,
});

function About() {
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  return (
    <div className="space-y-12 pb-16">
      <LandingExperience onOpenDiagnostic={() => setDiagnosticOpen(true)} />

      <section className="space-y-4 border-t border-border pt-10">
        <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">
          03 · Engineering Philosophy
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Why Forge replaces passive video tutorials with active systems
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Flame className="h-5 w-5 text-primary" />,
              title: "Deliberate practice",
              body: "Every module is engineered for spaced repetition, prediction commitment, and progressive difficulty.",
            },
            {
              icon: <Sparkles className="h-5 w-5 text-primary" />,
              title: "Socratic AI Mentor",
              body: "The mentor coaches your mental model instead of spoiling answers so you think like a staff engineer.",
            },
            {
              icon: <Blocks className="h-5 w-5 text-primary" />,
              title: "Visual & system studios",
              body: "Manipulate CSS Box Model, Flexbox, Grid, WCAG contrast, and HTTP pipelines interactively.",
            },
            {
              icon: <MessagesSquare className="h-5 w-5 text-primary" />,
              title: "Interview & portfolio ready",
              body: "Timed mock interviews, rubrics, and guided builds ensure you can prove your craft under pressure.",
            },
          ].map((c) => (
            <Card key={c.title} className="border-border/70">
              <CardContent className="p-5">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10">
                  {c.icon}
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <SkillDiagnosticModal open={diagnosticOpen} onOpenChange={setDiagnosticOpen} />
    </div>
  );
}
