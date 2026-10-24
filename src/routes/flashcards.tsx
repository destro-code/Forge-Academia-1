import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFlashcards } from "@/lib/hooks/use-content";
import { useState, useMemo } from "react";
import { RotateCw, Brain, CalendarClock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/lib/hooks/use-progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards · Forge" },
      { name: "description", content: "Spaced repetition flashcards for rapid recall." },
      { property: "og:title", content: "Flashcards · Forge" },
      { property: "og:description", content: "Study smarter with spaced repetition." },
    ],
  }),
  component: Flashcards,
});

function Flashcards() {
  const cards = useFlashcards();
  const { flashcardReviews, rateFlashcard } = useProgress();
  const [selectedDeck, setSelectedDeck] = useState<string>("All");
  const [flipped, setFlipped] = useState(false);

  const decks = useMemo(() => {
    return ["All", ...Array.from(new Set(cards.map((c) => c.deck)))];
  }, [cards]);

  const dueCards = useMemo(() => {
    const now = new Date();
    return cards
      .filter((c) => selectedDeck === "All" || c.deck === selectedDeck)
      .filter((c) => {
        const review = (flashcardReviews || {})[c.id];
        if (!review) return true; // New card, due now
        return new Date(review.dueAt) <= now;
      })
      .sort((a, b) => {
        const aRev = (flashcardReviews || {})[a.id];
        const bRev = (flashcardReviews || {})[b.id];
        const aDue = aRev ? new Date(aRev.dueAt).getTime() : 0;
        const bDue = bRev ? new Date(bRev.dueAt).getTime() : 0;
        return aDue - bDue;
      });
  }, [cards, selectedDeck, flashcardReviews]);

  const card = dueCards[0];

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    if (!card) return;
    rateFlashcard(card.id, card.deck, rating);
    setFlipped(false);
  };

  const currentReview = card ? (flashcardReviews || {})[card.id] : undefined;

  const nextScheduledReview = useMemo(() => {
    const deckCards = cards.filter((c) => selectedDeck === "All" || c.deck === selectedDeck);
    const futureDates = deckCards
      .map((c) => (flashcardReviews || {})[c.id]?.dueAt)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d))
      .filter((d) => d > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    return futureDates[0] || null;
  }, [cards, selectedDeck, flashcardReviews]);

  const previewIntervals = useMemo(() => {
    const prevReps = currentReview?.repetitions ?? 0;
    const prevInterval = currentReview?.intervalDays ?? 0;
    const prevEase = currentReview?.easeFactor ?? 2.5;
    const calcDays = (q: number) => {
      if (q < 3) return 1;
      if (prevReps === 0) return 1;
      if (prevReps === 1) return 3;
      return Math.max(1, Math.round(prevInterval * prevEase));
    };
    return {
      again: "1d (reset)",
      hard: `${calcDays(2)}d`,
      good: `${calcDays(4)}d`,
      easy: `${calcDays(5)}d`,
    };
  }, [currentReview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader
          eyebrow="Flashcards · SM-2 Spaced Repetition"
          title="Recall over recognition"
          description={
            dueCards.length > 0
              ? `${dueCards.length} card${dueCards.length === 1 ? "" : "s"} due for review now`
              : "All caught up for now!"
          }
        />
        <div className="w-full sm:w-[200px]">
          <Select value={selectedDeck} onValueChange={setSelectedDeck}>
            <SelectTrigger>
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => (
                <SelectItem key={deck} value={deck}>
                  {deck} {deck !== "All" && "Deck"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {dueCards.length === 0 ? (
          <Card className="min-h-[240px] border-border/60 shadow-elegant flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mb-4 text-primary/40" />
            <h3 className="text-xl font-semibold text-foreground mb-2">You're all caught up!</h3>
            <p className="max-w-xs">
              No cards are due for review in this deck. Check back later or try another deck.
            </p>
            {nextScheduledReview && (
              <Badge variant="outline" className="mt-4 gap-1.5 text-xs">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                Next review scheduled:{" "}
                {nextScheduledReview.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            )}
          </Card>
        ) : (
          <>
            <button
              className="w-full text-left"
              onClick={() => setFlipped((f) => !f)}
              aria-label="Flip"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={String(flipped) + card.id}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="min-h-[240px] border-border/60 shadow-elegant">
                    <CardContent className="flex flex-col min-h-[240px] p-8">
                      <div className="flex justify-between items-start mb-6">
                        <Badge variant="secondary" className="font-medium">
                          {card.deck}
                        </Badge>
                        {currentReview && (
                          <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-1" title="Ease Factor">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {currentReview.easeFactor.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-1" title="Interval Days">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {currentReview.intervalDays}d
                            </div>
                            <div className="flex items-center gap-1" title="Repetitions">
                              <RotateCw className="h-3.5 w-3.5" />
                              {currentReview.repetitions}
                            </div>
                          </div>
                        )}
                        {!currentReview && (
                          <Badge
                            variant="outline"
                            className="font-medium text-blue-500 border-blue-500/30"
                          >
                            New Card
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-primary">
                          {flipped ? "Answer" : "Question"}
                        </div>
                        <div className="text-xl font-semibold">
                          {flipped ? card.back : card.front}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="mt-4 flex items-center justify-center">
              <Button
                variant="ghost"
                onClick={() => setFlipped((f) => !f)}
                className="text-muted-foreground"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Click card or here to flip
              </Button>
            </div>

            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <Button
                  variant="outline"
                  className="h-14 min-h-[48px] flex-col gap-0.5 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRate("again")}
                >
                  <span className="font-semibold">Again</span>
                  <span className="text-[10px] text-muted-foreground">
                    Next: {previewIntervals.again}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 min-h-[48px] flex-col gap-0.5 hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-500"
                  onClick={() => handleRate("hard")}
                >
                  <span className="font-semibold">Hard</span>
                  <span className="text-[10px] text-muted-foreground">
                    Next: {previewIntervals.hard}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 min-h-[48px] flex-col gap-0.5 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
                  onClick={() => handleRate("good")}
                >
                  <span className="font-semibold">Good</span>
                  <span className="text-[10px] text-muted-foreground">
                    Next: {previewIntervals.good}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-14 min-h-[48px] flex-col gap-0.5 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500"
                  onClick={() => handleRate("easy")}
                >
                  <span className="font-semibold">Easy</span>
                  <span className="text-[10px] text-muted-foreground">
                    Next: {previewIntervals.easy}
                  </span>
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
