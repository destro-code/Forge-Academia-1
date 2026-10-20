import { useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCanonicalLesson } from "@/lib/hooks/use-content";
import { useProgress } from "@/lib/hooks/use-progress";
import { CanonicalLessonPlayer } from "@/components/lesson/canonical/canonical-lesson-player";
import { LessonExperience } from "@/components/lesson/v2/lesson-experience";
import { loadV1Lesson } from "@/lib/curriculum/v1/loader";
import { canonicalManifestProvider } from "@/lib/curriculum/manifest";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, AlertTriangle } from "lucide-react";

type LessonSearch = {
  mode?: "module" | "curriculum";
  player?: boolean;
  classic?: boolean;
};

export const Route = createFileRoute("/lesson/$lessonId")({
  validateSearch: (search: Record<string, unknown>): LessonSearch => ({
    mode: search.mode === "curriculum" ? "curriculum" : "module",
    player: search.player === true || search.player === "true",
    classic: search.classic === true || search.classic === "true",
  }),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const { completeLesson, setLastActiveLesson } = useProgress();

  // Check V1 directory first before falling back to Layer 1
  const v1Result = loadV1Lesson(lessonId);
  const canonicalLesson = useCanonicalLesson(lessonId);

  const manifestEntry = canonicalManifestProvider.getLessonById(lessonId);
  const nextLessonId = canonicalManifestProvider.getNextLessonId(lessonId);
  const nextLessonEntry = nextLessonId
    ? canonicalManifestProvider.getLessonById(nextLessonId)
    : undefined;
  const moduleId =
    (v1Result.ok ? v1Result.lesson.curriculum.moduleId : undefined) ??
    manifestEntry?.moduleId;

  const handleReturnToModule = useCallback(() => {
    if (moduleId) {
      void navigate({ to: "/learn/modules/$moduleId", params: { moduleId } });
    } else {
      void navigate({ to: "/learn" });
    }
  }, [moduleId, navigate]);

  const handleContinueToNext = useCallback(() => {
    if (nextLessonId) {
      void navigate({ to: "/lesson/$lessonId", params: { lessonId: nextLessonId } });
    } else {
      handleReturnToModule();
    }
  }, [nextLessonId, navigate, handleReturnToModule]);

  const handleLessonComplete = useCallback(() => {
    setLastActiveLesson(lessonId);
    completeLesson(lessonId);
  }, [lessonId, completeLesson, setLastActiveLesson]);

  if (!v1Result.ok && v1Result.reason === "invalid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4 max-w-2xl mx-auto">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">[Forge V1 Schema Error] Failed to Load {lessonId}</h1>
        <p className="text-sm text-muted-foreground">{v1Result.filePath}</p>
        <div className="w-full rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-left text-xs font-mono space-y-1">
          {v1Result.errors.map((err, i) => (
            <div key={i} className="text-destructive">
              • {err}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReturnToModule}>
            Leave
          </Button>
          <Button onClick={() => window.location.reload()}>Retry Validation</Button>
        </div>
      </div>
    );
  }

  if (v1Result.ok) {
    return (
      <LessonExperience
        key={v1Result.lesson.id}
        lesson={v1Result.lesson}
        onBack={handleReturnToModule}
        nextLessonLabel={nextLessonEntry?.title}
        onContinueToNext={nextLessonId ? handleContinueToNext : undefined}
        onReturnToModule={handleReturnToModule}
        onLessonComplete={handleLessonComplete}
      />
    );
  }

  if (canonicalLesson) {
    return (
      <CanonicalLessonPlayer
        key={canonicalLesson.id}
        lesson={canonicalLesson}
        onBack={handleReturnToModule}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4">
      <BookOpen className="w-12 h-12 text-muted-foreground opacity-50" />
      <h1 className="text-2xl font-bold">Lesson Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find a lesson matching ID &ldquo;{lessonId}&rdquo;. It may have been moved
        or doesn&apos;t exist yet.
      </p>
      <Link to="/learn">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Curriculum
        </Button>
      </Link>
    </div>
  );
}
