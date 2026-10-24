import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/hooks/use-progress";
import { useLessons } from "@/lib/hooks/use-content";
import {
  getLessonStepResumeInfo,
  useLearnerEvidenceVersion,
} from "@/lib/learning-engine/evidence-store";
import { Bookmark, ArrowRight, CheckCircle2, FileText, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks & Saved Notes · Forge" },
      { name: "description", content: "Your saved lessons and study notes, ready to revisit." },
      { property: "og:title", content: "Bookmarks · Forge" },
      { property: "og:description", content: "Everything you saved for later." },
    ],
  }),
  component: Bookmarks,
});

function Bookmarks() {
  const { bookmarks, lessonsCompleted = [], notes = {} } = useProgress();
  useLearnerEvidenceVersion();
  const allLessons = useLessons();
  const bookmarkedLessons = allLessons.filter((l) => bookmarks.includes(l.id));
  const notedLessons = allLessons.filter(
    (l) => !bookmarks.includes(l.id) && Boolean(notes[l.id]?.trim()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Saved Work"
        title="Bookmarks & Lesson Notes"
        description="Everything you flagged or annotated to revisit — with exact step resume."
      />
      {bookmarkedLessons.length === 0 && notedLessons.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-5 w-5" />}
          title="No bookmarks or saved notes yet"
          description="Tap the bookmark or notes button inside any lesson to save your place and annotations here."
        />
      ) : (
        <div className="space-y-6">
          {bookmarkedLessons.length > 0 && (
            <div className="grid gap-3">
              {bookmarkedLessons.map((l) => {
                const resume = getLessonStepResumeInfo(l.id, lessonsCompleted);
                const noteText = notes[l.id]?.trim();
                return (
                  <Link key={l.id} to="/lesson/$lessonId" params={{ lessonId: l.id }}>
                    <Card className="border-border/60 transition hover:border-primary/40">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{l.difficulty}</Badge>
                            {resume.status === "completed" ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Completed
                              </Badge>
                            ) : resume.status === "in-progress" && resume.totalSteps > 0 ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-primary/10 text-primary border-primary/20 text-[11px]"
                              >
                                <PlayCircle className="h-3 w-3" /> Resume Step{" "}
                                {resume.currentStepIndex + 1} of {resume.totalSteps}
                              </Badge>
                            ) : null}
                          </div>
                          <h3 className="font-semibold text-foreground">{l.title}</h3>
                          <p className="text-sm text-muted-foreground">{l.description}</p>
                          {noteText && (
                            <div className="mt-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
                              <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{noteText}</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className="text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {notedLessons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lessons with Saved Notes ({notedLessons.length})
              </h2>
              <div className="grid gap-3">
                {notedLessons.map((l) => {
                  const resume = getLessonStepResumeInfo(l.id, lessonsCompleted);
                  const noteText = notes[l.id]?.trim();
                  return (
                    <Link key={l.id} to="/lesson/$lessonId" params={{ lessonId: l.id }}>
                      <Card className="border-border/60 transition hover:border-primary/40">
                        <CardContent className="flex items-center justify-between gap-4 p-5">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{l.difficulty}</Badge>
                              {resume.status === "completed" ? (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]"
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Completed
                                </Badge>
                              ) : resume.status === "in-progress" && resume.totalSteps > 0 ? (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 bg-primary/10 text-primary border-primary/20 text-[11px]"
                                >
                                  <PlayCircle className="h-3 w-3" /> Resume Step{" "}
                                  {resume.currentStepIndex + 1} of {resume.totalSteps}
                                </Badge>
                              ) : null}
                            </div>
                            <h3 className="font-semibold text-foreground">{l.title}</h3>
                            {noteText && (
                              <div className="mt-1 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{noteText}</span>
                              </div>
                            )}
                          </div>
                          <ArrowRight className="text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
