import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AtelierChapterAccent } from "@/lib/curriculum/atelier-chapters";

/**
 * Forge's discovery identity: four folded planes opening around a central point.
 * The mark and companion share the same visual language across light and dark themes.
 */
export function ForgeAcademiaLogo({
  className,
  size = "md",
  showSubtitle = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}) {
  const iconDimensions = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const titleSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className={cn("relative flex shrink-0 items-center justify-center", iconDimensions)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* Four folded planes open around a central point: discovery through revelation. */}
          <path d="M7 7H21V18L16 23H7V7Z" fill="var(--primary)" />
          <path d="M41 7H27V18L32 23H41V7Z" fill="var(--info)" />
          <path d="M7 41H21V30L16 25H7V41Z" fill="var(--info)" />
          <path d="M41 41H27V30L32 25H41V41Z" fill="var(--primary)" />
          <path d="M24 18L30 24L24 30L18 24L24 18Z" fill="var(--foreground)" />
          <circle cx="24" cy="24" r="2" fill="var(--background)" />
        </svg>
      </div>
      <div className="flex min-w-0 flex-col leading-none">
        <span
          className={cn("font-display font-extrabold tracking-tight text-foreground", titleSize)}
        >
          Forge
        </span>
        <span className="mt-1 font-sans text-[9px] font-semibold tracking-[0.12em] text-muted-foreground">
          Discover · Build · Understand
        </span>
        {showSubtitle && (
          <span className="mt-1 font-mono text-[9px] tracking-wide text-muted-foreground">
            Frontend Engineering Academy
          </span>
        )}
      </div>
    </div>
  );
}

/** Discovery artifact: a dimensional study of four planes opening around a hidden centre.
 * The legacy export name is retained so existing feature imports remain compatible.
 */
export function ForgeCrystal3D({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <ellipse cx="60" cy="105" rx="34" ry="6" fill="var(--foreground)" fillOpacity="0.12" />
        <path d="M60 10L100 40L78 58L60 44L42 58L20 40L60 10Z" fill="var(--primary)" />
        <path d="M110 60L80 100L62 78L76 60L62 42L80 20L110 60Z" fill="var(--info)" />
        <path
          d="M60 110L20 80L42 62L60 76L78 62L100 80L60 110Z"
          fill="var(--primary)"
          fillOpacity="0.82"
        />
        <path
          d="M10 60L40 20L58 42L44 60L58 78L40 100L10 60Z"
          fill="var(--info)"
          fillOpacity="0.82"
        />
        <path
          d="M60 39L81 60L60 81L39 60L60 39Z"
          fill="var(--background)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle cx="60" cy="60" r="6" fill="var(--foreground)" />
        <circle cx="60" cy="60" r="2" fill="var(--primary)" />
      </svg>
    </div>
  );
}

export function CurvedDoodleArrow({
  variant = "coral-up-right",
  className,
}: {
  variant?: "coral-up-right" | "cobalt-loop" | "mint-down-left";
  className?: string;
}) {
  const stroke =
    variant === "mint-down-left"
      ? "var(--success)"
      : variant === "cobalt-loop"
        ? "var(--info)"
        : "var(--primary)";

  const path =
    variant === "cobalt-loop"
      ? "M6 38C18 14 44 8 74 22"
      : variant === "mint-down-left"
        ? "M64 8C48 28 32 38 10 42"
        : "M8 42C22 38 42 28 62 10";
  const head =
    variant === "cobalt-loop"
      ? "M65 14L75.5 22.5L63.5 28"
      : variant === "mint-down-left"
        ? "M19 34L8.5 42.5L20 48"
        : "M49 9H63.5V23";

  return (
    <svg
      viewBox="0 0 84 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-16 shrink-0", className)}
      aria-hidden="true"
    >
      <path d={path} stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d={head} stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HandwrittenCallout({
  children,
  rotation = "-rotate-2",
  className,
}: {
  children: ReactNode;
  rotation?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 select-none font-[family-name:var(--font-handwritten)] text-xl font-bold leading-tight text-foreground",
        rotation,
        className,
      )}
    >
      {children}
    </div>
  );
}

export type ForgeBuddyMood =
  | "happy"
  | "thinking"
  | "excited"
  | "coding"
  | "cheering"
  | "winking"
  | "cheerful"
  | "talking"
  | "curious"
  | "encouraging"
  | "smiling"
  | "celebrating";

export type CanonicalForgePose = "happy" | "thinking" | "excited" | "coding" | "cheering" | "winking";

export function normalizeForgePose(mood: ForgeBuddyMood): CanonicalForgePose {
  switch (mood) {
    case "happy":
    case "cheerful":
    case "talking":
      return "happy";
    case "thinking":
    case "curious":
      return "thinking";
    case "excited":
    case "celebrating":
      return "excited";
    case "coding":
      return "coding";
    case "cheering":
    case "smiling":
      return "cheering";
    case "winking":
    case "encouraging":
      return "winking";
    default:
      return "happy";
  }
}

/**
 * Forge Buddy is a floating modular companion built from four folded planes around an expressive centre.
 * Its visual language is shared with the discovery mark and adapts to the active theme.
 */
export function ForgeBuddyMascot3D({
  className,
  mood = "happy",
  blink = true,
  animate = true,
  speechBubble,
}: {
  className?: string;
  mood?: ForgeBuddyMood;
  blink?: boolean;
  animate?: boolean;
  speechBubble?: string;
}) {
  const pose = normalizeForgePose(mood);
  const isWinking = pose === "winking";
  const isExcited = pose === "excited" || pose === "cheering";

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      {speechBubble && (
        <div className="absolute -top-7 right-0 z-10 max-w-48 rounded-xl border border-border bg-card px-3 py-1.5 text-center text-xs font-semibold text-foreground shadow-sm">
          {speechBubble}
        </div>
      )}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-full w-full", animate && isExcited && "forge-buddy-motion")}
        data-buddy-pose={pose}
        data-buddy-animate={animate ? "true" : "false"}
        data-buddy-blink={blink ? "true" : "false"}
        role="img"
        aria-label={`Forge Buddy (${pose})`}
      >
        <ellipse
          cx="100"
          cy="184"
          rx={isExcited ? "34" : "43"}
          ry="6"
          fill="var(--foreground)"
          fillOpacity="0.12"
        />

        {/* Four modular planes frame an expressive centre. */}
        <g>
          <path
            d="M100 22C120 22 139 31 151 47L166 76C174 94 172 116 161 134L143 158C131 172 116 179 100 179C84 179 69 172 57 158L39 134C28 116 26 94 34 76L49 47C61 31 80 22 100 22Z"
            fill="var(--foreground)"
            fillOpacity="0.08"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <path d="M100 25L142 48L128 76L100 66L72 76L58 48L100 25Z" fill="var(--primary)" />
          <path d="M30 92L61 54L78 78L67 104L42 118L30 92Z" fill="var(--info)" />
          <path d="M170 92L139 54L122 78L133 104L158 118L170 92Z" fill="var(--info)" />
          <path
            d="M42 133L72 111L88 136L78 164L57 155L42 133Z"
            fill="var(--primary)"
            fillOpacity="0.86"
          />
          <path
            d="M158 133L128 111L112 136L122 164L143 155L158 133Z"
            fill="var(--primary)"
            fillOpacity="0.86"
          />
          <path
            d="M72 157L100 139L128 157L115 174H85L72 157Z"
            fill="var(--info)"
            fillOpacity="0.9"
          />

          {/* Face panel */}
          <rect x="62" y="65" width="76" height="76" rx="28" fill="var(--foreground)" />
          <rect x="68" y="71" width="64" height="64" rx="23" fill="var(--background)" />
          <g className="forge-buddy-eyes">
            {isWinking ? (
              <>
                <circle cx="88" cy="98" r="5.5" fill="var(--foreground)" />
                <path
                  d="M108 99C112 95 117 95 121 99"
                  stroke="var(--foreground)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle
                  cx="88"
                  cy="98"
                  r={pose === "excited" ? "6.5" : "5"}
                  fill="var(--foreground)"
                />
                <circle
                  cx="112"
                  cy="98"
                  r={pose === "excited" ? "6.5" : "5"}
                  fill="var(--foreground)"
                />
              </>
            )}
          </g>
          {pose === "thinking" ? (
            <path
              d="M91 119C96 113 104 113 109 119"
              stroke="var(--foreground)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : pose === "excited" || pose === "cheering" ? (
            <ellipse cx="100" cy="119" rx="7" ry="8" fill="var(--foreground)" />
          ) : (
            <path
              d="M90 116C95 124 105 124 110 116"
              stroke="var(--foreground)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
        </g>

        {pose === "thinking" && (
          <g transform="translate(145 20)">
            <circle
              cx="17"
              cy="17"
              r="15"
              fill="var(--card)"
              stroke="var(--info)"
              strokeWidth="2"
            />
            <path
              d="M13 12C13 8 16 6 19 7C23 8 23 12 20 15L17 18"
              stroke="var(--foreground)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="17" cy="23" r="1.7" fill="var(--primary)" />
          </g>
        )}

        {pose === "coding" && (
          <g transform="translate(131 129)">
            <rect x="0" y="0" width="48" height="32" rx="8" fill="var(--foreground)" />
            <rect x="4" y="4" width="40" height="24" rx="5" fill="var(--background)" />
            <path
              d="M15 12L10 16L15 20M33 12L38 16L33 20M26 10L22 22"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {isExcited && (
          <g stroke="var(--primary)" strokeWidth="3" strokeLinecap="round">
            <path d="M35 44L28 37M165 44L172 37M25 76H15M175 76H185" />
          </g>
        )}

        {pose === "cheering" && (
          <g stroke="var(--info)" strokeWidth="8" strokeLinecap="round">
            <path d="M47 111L25 88M153 111L175 88" />
          </g>
        )}

        {pose === "happy" && (
          <g fill="var(--info)">
            <circle cx="42" cy="37" r="3" />
            <circle cx="158" cy="37" r="3" />
          </g>
        )}
      </svg>
    </div>
  );
}

/** Achievement artifact. The legacy export name is retained for existing route imports. */
export function TrophyFlame3D({
  className,
  showRibbon = false,
}: {
  className?: string;
  showRibbon?: boolean;
}) {
  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 160 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <ellipse cx="80" cy="137" rx="52" ry="7" fill="var(--foreground)" fillOpacity="0.1" />
        <path d="M80 10L132 48L106 72L80 55L54 72L28 48L80 10Z" fill="var(--primary)" />
        <path d="M143 76L106 125L87 100L104 76L87 52L106 27L143 76Z" fill="var(--info)" />
        <path
          d="M80 140L28 102L54 78L80 95L106 78L132 102L80 140Z"
          fill="var(--primary)"
          fillOpacity="0.82"
        />
        <path
          d="M17 76L54 27L73 52L56 76L73 100L54 125L17 76Z"
          fill="var(--info)"
          fillOpacity="0.82"
        />
        <path
          d="M80 49L107 76L80 103L53 76L80 49Z"
          fill="var(--background)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <path d="M80 61L95 76L80 91L65 76L80 61Z" fill="var(--foreground)" />
        {showRibbon && (
          <g transform="translate(30 112)">
            <path
              d="M0 0H100L94 25H6L0 0Z"
              fill="var(--primary)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export function ChapterFolio3DArt({
  accent,
  className,
}: {
  accent: AtelierChapterAccent;
  className?: string;
}) {
  if (accent === "mint") {
    return (
      <svg
        viewBox="0 0 180 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-24 w-full select-none", className)}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mintCardBlock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect x="18" y="14" width="94" height="64" rx="12" fill="#FFFFFF" fillOpacity="0.92" />
        <circle cx="30" cy="25" r="3" fill="#FF8C7A" />
        <circle cx="40" cy="25" r="3" fill="#FBBF24" />
        <circle cx="50" cy="25" r="3" fill="#34D399" />
        <rect x="28" y="36" width="46" height="8" rx="4" fill="#A7E3D1" />
        <rect x="28" y="50" width="70" height="6" rx="3" fill="#D1FAE5" />
        <rect x="28" y="61" width="54" height="6" rx="3" fill="#D1FAE5" />
        <rect
          x="98"
          y="30"
          width="58"
          height="58"
          rx="16"
          transform="rotate(8 98 30)"
          fill="url(#mintCardBlock)"
        />
        <path
          d="M118 52L111 59L118 66M136 52L143 59L136 66M130 49L124 69"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (accent === "cobalt") {
    return (
      <svg
        viewBox="0 0 180 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-24 w-full select-none", className)}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="cssCube3D" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
          <radialGradient id="cssSphere3D" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#4338CA" />
          </radialGradient>
        </defs>
        <rect
          x="16"
          y="16"
          width="88"
          height="58"
          rx="12"
          fill="#FFFFFF"
          fillOpacity="0.18"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        <rect x="26" y="28" width="42" height="10" rx="5" fill="#FBBF24" />
        <rect x="26" y="44" width="64" height="7" rx="3.5" fill="#FFFFFF" fillOpacity="0.55" />
        <rect x="26" y="56" width="48" height="7" rx="3.5" fill="#A7E3D1" fillOpacity="0.85" />
        <rect
          x="96"
          y="22"
          width="54"
          height="54"
          rx="14"
          transform="rotate(-14 96 22)"
          fill="url(#cssCube3D)"
        />
        <circle cx="144" cy="74" r="18" fill="url(#cssSphere3D)" />
        <path
          d="M84 12L86.5 18.5L93 21L86.5 23.5L84 30L81.5 23.5L75 21L81.5 18.5L84 12Z"
          fill="#FBBF24"
        />
        <circle cx="156" cy="24" r="4" fill="#FBBF24" />
      </svg>
    );
  }

  if (accent === "butter") {
    return (
      <svg
        viewBox="0 0 180 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-24 w-full select-none", className)}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="jsBlock3D" cx="30%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>
        <rect x="22" y="24" width="52" height="52" rx="14" fill="#FFFFFF" fillOpacity="0.9" />
        <text
          x="35"
          y="58"
          fill="#1E1B4B"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="800"
          fontSize="22"
        >
          JS
        </text>
        <rect
          x="66"
          y="34"
          width="52"
          height="52"
          rx="14"
          transform="rotate(-8 66 34)"
          fill="url(#jsBlock3D)"
        />
        <path d="M95 45L83 62H93L90 75L104 57H94L95 45Z" fill="#1E1B4B" />
        <circle cx="144" cy="46" r="18" fill="#C4B5FD" />
        <circle cx="139" cy="41" r="5" fill="#FFFFFF" fillOpacity="0.65" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 180 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-24 w-full select-none", className)}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="reactOrb3D" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
      <rect x="20" y="18" width="92" height="64" rx="14" fill="#1E1B4B" />
      <circle cx="33" cy="30" r="3" fill="#FF8C7A" />
      <circle cx="43" cy="30" r="3" fill="#FBBF24" />
      <circle cx="53" cy="30" r="3" fill="#A7E3D1" />
      <rect x="30" y="42" width="44" height="8" rx="4" fill="#6E6AF6" />
      <rect x="30" y="56" width="68" height="14" rx="6" fill="#312E81" />

      <circle cx="132" cy="54" r="26" fill="url(#reactOrb3D)" />
      <ellipse
        cx="132"
        cy="54"
        rx="22"
        ry="8"
        transform="rotate(30 132 54)"
        stroke="#FFFFFF"
        strokeWidth="2.2"
      />
      <ellipse
        cx="132"
        cy="54"
        rx="22"
        ry="8"
        transform="rotate(-30 132 54)"
        stroke="#FFFFFF"
        strokeWidth="2.2"
      />
      <circle cx="132" cy="54" r="4.5" fill="#FBBF24" />
    </svg>
  );
}

/**
 * 3D Creative Desk Cluster with Forge Crystal & Mascot Theme
 */
export function StudioDesk3DCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "h-full w-full select-none drop-shadow-[0_14px_24px_rgba(110,106,246,0.2)]",
        className,
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="clusterCobalt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="clusterLilac" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="clusterMint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <radialGradient id="clusterStarGold" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      <ellipse cx="112" cy="142" rx="84" ry="12" fill="#C4B5FD" fillOpacity="0.35" />

      <rect
        x="36"
        y="18"
        width="116"
        height="78"
        rx="14"
        fill="#FFFFFF"
        stroke="#E5DFD3"
        strokeWidth="2"
      />
      <circle cx="50" cy="31" r="3.5" fill="#FF8C7A" />
      <circle cx="62" cy="31" r="3.5" fill="#FBBF24" />
      <circle cx="74" cy="31" r="3.5" fill="#A7E3D1" />
      <rect x="48" y="44" width="54" height="9" rx="4.5" fill="#6E6AF6" fillOpacity="0.25" />
      <rect x="48" y="59" width="84" height="7" rx="3.5" fill="#F4EFE6" />
      <rect x="48" y="72" width="66" height="7" rx="3.5" fill="#F4EFE6" />

      <rect
        x="24"
        y="70"
        width="56"
        height="56"
        rx="16"
        transform="rotate(-8 24 70)"
        fill="url(#clusterCobalt)"
      />
      <rect
        x="128"
        y="56"
        width="56"
        height="56"
        rx="16"
        transform="rotate(10 128 56)"
        fill="url(#clusterMint)"
      />
      <rect x="76" y="80" width="58" height="52" rx="14" fill="url(#clusterLilac)" />

      {/* Glowing Forge Crystal Centerpiece */}
      <polygon
        points="88,42 104,64 88,86 72,64"
        fill="url(#clusterLilac)"
        stroke="#FAF8F5"
        strokeWidth="2"
      />

      <g transform="translate(146, 12)">
        <rect width="54" height="38" rx="12" fill="#6E6AF6" />
        <path
          d="M19 14L13 19L19 24M35 14L41 19L35 24M29 12L25 26"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * 3D Bug Hunter Sculpture for Debug Lab Hub
 */
export function DebugLabBugHunter3D({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "h-full w-full select-none drop-shadow-[0_14px_24px_rgba(110,106,246,0.22)]",
        className,
      )}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bugShell3D" cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFB4A8" />
          <stop offset="48%" stopColor="#FF8C7A" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <radialGradient id="lensGlass3D" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#C4B5FD" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6E6AF6" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="136" rx="68" ry="10" fill="#1E1B4B" fillOpacity="0.12" />

      <rect x="20" y="18" width="118" height="82" rx="16" fill="#1E1B4B" />
      <circle cx="34" cy="31" r="3.5" fill="#FF8C7A" />
      <circle cx="45" cy="31" r="3.5" fill="#FBBF24" />
      <circle cx="56" cy="31" r="3.5" fill="#A7E3D1" />
      <rect x="32" y="45" width="64" height="7" rx="3.5" fill="#FF8C7A" fillOpacity="0.85" />
      <rect x="32" y="59" width="88" height="7" rx="3.5" fill="#A7E3D1" />
      <rect x="32" y="73" width="52" height="7" rx="3.5" fill="#C4B5FD" />

      <circle cx="118" cy="84" r="24" fill="url(#bugShell3D)" />
      <path d="M118 60V108" stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="109" cy="78" r="3.5" fill="#1E1B4B" />
      <circle cx="127" cy="78" r="3.5" fill="#1E1B4B" />
      <circle cx="111" cy="92" r="3" fill="#FBBF24" />
      <circle cx="125" cy="92" r="3" fill="#FBBF24" />

      <rect
        x="146"
        y="88"
        width="12"
        height="40"
        rx="6"
        transform="rotate(-42 146 88)"
        fill="#6E6AF6"
      />
      <circle cx="132" cy="74" r="28" fill="url(#lensGlass3D)" stroke="#6E6AF6" strokeWidth="6" />
      <path
        d="M118 58C124 53 136 53 142 58"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 3D Project Workbench Sculpture for Project Academy Hub
 */
export function ProjectWorkbench3D({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "h-full w-full select-none drop-shadow-[0_14px_24px_rgba(110,106,246,0.2)]",
        className,
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="projCardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6E6AF6" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="136" rx="72" ry="10" fill="#1E1B4B" fillOpacity="0.12" />

      <rect
        x="22"
        y="22"
        width="112"
        height="76"
        rx="14"
        fill="#FFFFFF"
        stroke="#C4B5FD"
        strokeWidth="2.5"
      />
      <rect x="34" y="36" width="46" height="10" rx="5" fill="#A7E3D1" />
      <rect x="34" y="52" width="84" height="8" rx="4" fill="#EEF2FF" />
      <rect x="34" y="66" width="64" height="8" rx="4" fill="#EEF2FF" />

      <rect x="74" y="42" width="102" height="72" rx="16" fill="url(#projCardGrad)" />
      <circle cx="88" cy="55" r="3" fill="#FF8C7A" />
      <circle cx="98" cy="55" r="3" fill="#FBBF24" />
      <circle cx="108" cy="55" r="3" fill="#A7E3D1" />
      <rect x="88" y="68" width="52" height="10" rx="5" fill="#FBBF24" />
      <rect x="88" y="84" width="72" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.22" />

      <circle cx="46" cy="104" r="18" fill="#FBBF24" />
      <path
        d="M46 93L49 101L57 102L51 107L52.5 115L46 111L39.5 115L41 107L35 102L43 101L46 93Z"
        fill="#1E1B4B"
      />
    </svg>
  );
}
