import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

type AtelierInteractiveEmblemProps = {
  icon: ReactNode;
  label: string;
};

export function AtelierInteractiveEmblem({ icon, label }: AtelierInteractiveEmblemProps) {
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={`Animate ${label} emblem`}
      aria-pressed={revealed}
      title="Tap to animate"
      onClick={() => setRevealed((value) => !value)}
      whileHover={reduceMotion ? undefined : { scale: 1.035, y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      className="group relative grid size-36 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:size-40 lg:size-48"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-3 rounded-full border border-dashed border-primary/40"
        animate={reduceMotion ? undefined : { rotate: revealed ? 180 : 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-7 rounded-[1.6rem] border border-border bg-card/80 shadow-lg"
        animate={reduceMotion ? undefined : { rotate: revealed ? -18 : 12, scale: revealed ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-10 rounded-2xl border border-primary/20 bg-primary/10"
        animate={reduceMotion ? undefined : { rotate: revealed ? 22 : -6 }}
        transition={{ type: "spring", stiffness: 160, damping: 12 }}
      />
      <motion.span
        className="relative grid size-16 place-items-center rounded-2xl border border-border bg-card text-primary shadow-md sm:size-[4.5rem]"
        animate={reduceMotion ? undefined : { rotate: revealed ? 8 : 0, y: revealed ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 13 }}
      >
        {icon}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute right-1 top-5 grid size-7 place-items-center rounded-full border border-border bg-card text-primary shadow-sm"
        animate={reduceMotion ? undefined : { y: revealed ? -7 : 0, x: revealed ? 4 : 0, rotate: revealed ? 20 : 0 }}
      >
        <Sparkles className="size-3.5" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute bottom-4 left-2 size-2.5 rounded-full bg-[#A7E3D1] ring-4 ring-background"
        animate={reduceMotion ? undefined : { scale: revealed ? 1.6 : 1 }}
        transition={{ repeat: revealed && !reduceMotion ? Infinity : 0, repeatType: "reverse", duration: 0.65 }}
      />
    </motion.button>
  );
}
