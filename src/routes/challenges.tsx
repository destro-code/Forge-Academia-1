import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";
import { useProgress } from "@/lib/hooks/use-progress";
import { recordCapabilityEvidence } from "@/lib/learning-engine/evidence-store";
import challengesData from "@/data/challenges.json";
import type { DailyChallenge } from "@/lib/types";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Daily Challenges · Forge" },
      {
        name: "description",
        content: "One sharp problem, every day — keep your engineering edge.",
      },
      { property: "og:title", content: "Daily Challenges · Forge" },
      { property: "og:description", content: "A daily rep for your brain." },
    ],
  }),
  component: Challenges,
});

function getChallengeHref(challenge: DailyChallenge): string {
  if (challenge.linkType === "debug-lab" && challenge.linkId) {
    return `/debug-lab/${challenge.linkId}`;
  }
  if (challenge.linkType === "quiz") {
    return "/quizzes";
  }
  return "/playground";
}

function Challenges() {
  const {
    challengesCompleted = [],
    solvedBugs = [],
    challengeStreakDays = 0,
    completeChallenge,
  } = useProgress();
  const challenges: DailyChallenge[] = challengesData as DailyChallenge[];

  const todayIso = new Date().toISOString().split("T")[0];

  const todayChallenge = challenges.find((c) => c.date === todayIso) || challenges[0];
  const historyChallenges = challenges.filter((c) => c.id !== todayChallenge?.id);

  const isChallengeActivityVerified = (c: DailyChallenge): boolean => {
    if (c.linkType === "debug-lab" && c.linkId) {
      return solvedBugs.includes(c.linkId);
    }
    return false;
  };

  const isTodayVerified = todayChallenge ? isChallengeActivityVerified(todayChallenge) : false;
  const isTodayCompleted = todayChallenge
    ? challengesCompleted.includes(todayChallenge.id) || isTodayVerified
    : false;

  const handleSelfReportChallenge = (challenge: DailyChallenge) => {
    completeChallenge(challenge.id);
    recordCapabilityEvidence({
      id: `challenge:${challenge.id}`,
      title: `Daily Challenge: ${challenge.title}`,
      sourceType: challenge.linkType === "debug-lab" ? "debug-lab" : "project",
      sourceId: challenge.id,
      status: isChallengeActivityVerified(challenge) ? "demonstrated" : "in-progress",
      evidenceStatus: isChallengeActivityVerified(challenge) ? "verified" : "self-reported",
      summary: isChallengeActivityVerified(challenge)
        ? `Completed and verified '${challenge.title}' via ${challenge.linkType}.`
        : `Self-reported completion of daily challenge '${challenge.title}'.`,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Daily"
        title="One sharp problem, every day"
        description="Small, focused reps that keep your engineering edge."
        actions={
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {challengeStreakDays}-day streak
          </Badge>
        }
      />

      {todayChallenge && (
        <Card
          className={`relative overflow-hidden border-border/60 ${isTodayCompleted ? "bg-muted/30" : ""}`}
        >
          {!isTodayCompleted && <div className="ember-glow absolute inset-0" />}
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Today · {todayChallenge.difficulty}
              </div>
              {isTodayVerified ? (
                <Badge
                  variant="default"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Verified via Activity
                </Badge>
              ) : isTodayCompleted ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Self-Reported Complete
                </Badge>
              ) : null}
            </div>

            <h2
              className={`mt-1 text-2xl font-bold ${isTodayCompleted ? "text-muted-foreground" : ""}`}
            >
              {todayChallenge.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {todayChallenge.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant={isTodayCompleted ? "outline" : "default"}>
                <Link to={getChallengeHref(todayChallenge) as any}>
                  <Zap className="mr-2 h-4 w-4" />
                  {isTodayCompleted ? "Review challenge activity" : "Launch challenge activity"}
                </Link>
              </Button>
              {!isTodayCompleted && (
                <Button
                  variant="outline"
                  onClick={() => handleSelfReportChallenge(todayChallenge)}
                >
                  Mark as self-reported
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">History</h3>
        <div className="grid gap-2">
          {historyChallenges.map((c) => {
            const isVerified = isChallengeActivityVerified(c);
            const isCompleted = challengesCompleted.includes(c.id) || isVerified;
            return (
              <Link key={c.id} to={getChallengeHref(c) as any}>
                <Card
                  className={`border-border/60 transition hover:border-primary/40 ${isCompleted ? "opacity-80" : ""}`}
                >
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">{c.date}</div>
                        {isVerified ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 py-0 h-4 gap-1"
                          >
                            <ShieldCheck className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        ) : isCompleted ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 py-0 h-4 gap-1"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" /> Self-Reported
                          </Badge>
                        ) : null}
                      </div>
                      <div className={`font-medium ${isCompleted ? "text-muted-foreground" : ""}`}>
                        {c.title}
                      </div>
                      <div className="text-sm text-muted-foreground">{c.description}</div>
                    </div>
                    <Badge variant="outline">{c.difficulty}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
