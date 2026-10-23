import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AtelierChapterAccent } from "@/lib/curriculum/atelier-chapters";

/**
 * Official Forge Brand Mark from the "Meet Forge" Concept Board:
 * - Signature 4-point rounded violet/indigo Forge Spark + glowing crystal core
 * - Bold deep-navy / cream "Forge" wordmark with "Learn · Build · Grow" subtitle
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
  const iconDimensions =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const titleSize =
    size === "sm"
      ? "text-lg"
      : size === "lg"
        ? "text-2xl"
        : "text-xl";

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className={cn("relative flex shrink-0 items-center justify-center", iconDimensions)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_6px_14px_rgba(110,106,246,0.38)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="forgeSparkGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#6E6AF6" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="forgeSparkInner" x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5D0FE" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
          </defs>
          {/* 4-Point Rounded Forge Spark from the Concept Board */}
          <path
            d="M24 3C26.4 13.8 34.2 21.6 45 24C34.2 26.4 26.4 34.2 24 45C21.6 34.2 13.8 26.4 3 24C13.8 21.6 21.6 13.8 24 3Z"
            fill="url(#forgeSparkGrad)"
          />
          {/* Inner Crystal Facet Highlight */}
          <polygon
            points="24,14 31,24 24,34 17,24"
            fill="url(#forgeSparkInner)"
            fillOpacity="0.55"
          />
          <circle cx="37" cy="11" r="2" fill="#FBBF24" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-[#1E1B4B] dark:text-[#FAF8F5]",
            titleSize,
          )}
        >
          Forge
        </span>
        <span
          className={cn(
            "font-sans font-semibold tracking-wider text-[#6E6AF6] dark:text-[#C4B5FD]",
            size === "lg" ? "text-xs mt-0.5" : "text-[10px] mt-0.5",
          )}
        >
          Learn · Build · Grow
        </span>
        {showSubtitle && (
          <span className="mt-0.5 font-mono text-[10px] text-[#7B86A6]">
            Interactive Studio
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone Glowing Forge Crystal ("The crystal represents knowledge, progress and the power to build your future")
 */
export function ForgeCrystal3D({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_12px_28px_rgba(168,85,247,0.45)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="crystalAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E879F9" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#818CF8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="crystalTopLeft" x1="30" y1="20" x2="60" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAE8FF" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <linearGradient id="crystalTopRight" x1="60" y1="20" x2="90" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E879F9" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id="crystalBottomLeft" x1="30" y1="62" x2="60" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#6E6AF6" />
          </linearGradient>
          <linearGradient id="crystalBottomRight" x1="60" y1="62" x2="90" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#crystalAmbientGlow)" />
        {/* Orbit Ring */}
        <ellipse
          cx="60"
          cy="62"
          rx="44"
          ry="14"
          transform="rotate(-22 60 62)"
          stroke="#C4B5FD"
          strokeOpacity="0.55"
          strokeWidth="1.8"
        />
        {/* 4 Octahedron Crystal Facets */}
        <polygon points="60,16 28,62 60,62" fill="url(#crystalTopLeft)" />
        <polygon points="60,16 92,62 60,62" fill="url(#crystalTopRight)" />
        <polygon points="28,62 60,104 60,62" fill="url(#crystalBottomLeft)" />
        <polygon points="92,62 60,104 60,62" fill="url(#crystalBottomRight)" />
        {/* Facet Ridge Highlights */}
        <path
          d="M60 16L60 104M28 62L92 62M60 16L28 62L60 104L92 62Z"
          stroke="#FAF8F5"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Sparkles */}
        <circle cx="24" cy="30" r="2.5" fill="#FBBF24" />
        <circle cx="96" cy="36" r="2" fill="#FAE8FF" />
        <circle cx="88" cy="92" r="2.5" fill="#C4B5FD" />
      </svg>
    </div>
  );
}

/**
 * Hand-drawn curved arrows
 */
export function CurvedDoodleArrow({
  variant = "coral-up-right",
  className,
}: {
  variant?: "coral-up-right" | "cobalt-loop" | "mint-down-left";
  className?: string;
}) {
  if (variant === "cobalt-loop") {
    return (
      <svg
        viewBox="0 0 84 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-16 shrink-0", className)}
        aria-hidden="true"
      >
        <path
          d="M6 38C18 14 44 8 74 22"
          stroke="#6E6AF6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M65 14L75.5 22.5L63.5 28"
          stroke="#6E6AF6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "mint-down-left") {
    return (
      <svg
        viewBox="0 0 72 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-10 w-14 shrink-0", className)}
        aria-hidden="true"
      >
        <path
          d="M64 8C48 28 32 38 10 42"
          stroke="#0F7656"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <path
          d="M19 34L8.5 42.5L20 48"
          stroke="#0F7656"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 76 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-14 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M8 42C22 38 42 28 62 10"
        stroke="#6E6AF6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M49 9H63.5V23"
        stroke="#6E6AF6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Handwritten annotation callout ("A little spark of curiosity... with a big mission.")
 */
export function HandwrittenCallout({
  children,
  rotation = "-rotate-6",
  className,
}: {
  children: ReactNode;
  rotation?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 select-none font-[family-name:var(--font-handwritten)] text-xl font-bold leading-tight text-[#1E1B4B] dark:text-[#C4B5FD]",
        rotation,
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Official Forge Mascot Moods & Expressions from the Concept Board:
 * - "happy" (or "cheerful" / "talking"): Holding the glowing Forge Crystal with warm ^ ^ eyes
 * - "thinking" (or "curious"): Hand on chin, oval eyes looking up, floating '?'
 * - "excited" (or "celebrating"): Jumping mid-air with arms up and sparkles
 * - "coding": Typing on a laptop with the 4-point Forge Star emblem on the lid
 * - "cheering" (or "smiling"): Joyful > < eyes with both hands raised
 * - "winking" (or "encouraging"): Playful wink pointing toward a glowing gold star
 */
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

export type CanonicalForgePose =
  | "happy"
  | "thinking"
  | "excited"
  | "coding"
  | "cheering"
  | "winking";

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
 * The New Hooded Forge Spirit Mascot ("Meet Forge")
 * Faithful 3D-shaded SVG rendering of the hooded violet-and-navy forge spirit with:
 * - Glowing violet-magenta flame tuft on its hood
 * - Pointed indigo/violet wizard-artisan hood & cloak with warm gold trim
 * - Adventurer backpack with the 4-point Forge Star badge
 * - Deep midnight face with expressive glowing eyes
 * - The glowing violet Forge Crystal / Laptop / Celebration poses
 */
export function ForgeBuddyMascot3D({
  className,
  mood = "happy",
  blink = true,
  speechBubble,
}: {
  className?: string;
  mood?: ForgeBuddyMood;
  blink?: boolean;
  speechBubble?: string;
}) {
  const pose = normalizeForgePose(mood);
  const isTalking = mood === "talking";

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      {speechBubble && (
        <div className="absolute -top-7 -right-3 z-10 whitespace-nowrap rounded-2xl border-2 border-[#6E6AF6]/40 bg-[#FFFBEB] px-3 py-1 font-[family-name:var(--font-handwritten)] text-base font-bold text-[#1E1B4B] shadow-[0_8px_20px_-4px_rgba(110,106,246,0.28)] dark:bg-[#1E1B4B] dark:text-[#FBBF24]">
          {speechBubble}
        </div>
      )}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_14px_26px_rgba(30,27,75,0.26)]"
        aria-label={`Forge Spirit Mascot (${pose})`}
      >
        <defs>
          {/* Violet-Indigo Hood & Cloak 3D Gradient */}
          <radialGradient id="forgeHood3D" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#938DFB" />
            <stop offset="48%" stopColor="#6E6AF6" />
            <stop offset="82%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#231F54" />
          </radialGradient>

          {/* Inner Hood Rim Shadow */}
          <linearGradient id="forgeHoodInner" x1="50" y1="55" x2="150" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Deep Midnight Spirit Face */}
          <radialGradient id="forgeSpiritFace" cx="50%" cy="45%" r="58%">
            <stop offset="0%" stopColor="#1F1B4D" />
            <stop offset="70%" stopColor="#110E2E" />
            <stop offset="100%" stopColor="#09071A" />
          </radialGradient>

          {/* Glowing Violet-Magenta Flame Tuft on Head */}
          <linearGradient id="forgeFlameTuft" x1="100" y1="6" x2="100" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAE8FF" />
            <stop offset="35%" stopColor="#E879F9" />
            <stop offset="75%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Warm Gold Trim & Star Accent */}
          <linearGradient id="forgeGoldTrim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Glowing Forge Crystal Gradient */}
          <linearGradient id="forgeCrystalGlow" x1="75" y1="120" x2="125" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAE8FF" />
            <stop offset="45%" stopColor="#D8B4FE" />
            <stop offset="80%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6E6AF6" />
          </linearGradient>

          {/* Adventurer Backpack Leather */}
          <linearGradient id="forgePackLeather" x1="30" y1="105" x2="65" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* Ground Shadow (smaller when jumping in 'excited' pose) */}
        <ellipse
          cx="100"
          cy="186"
          rx={pose === "excited" ? "36" : "50"}
          ry={pose === "excited" ? "6" : "8"}
          fill="#1E1B4B"
          fillOpacity="0.18"
        />

        {/* Pose-Specific Background Aura & Floating Accents */}
        {(pose === "happy" || pose === "excited" || pose === "cheering") && (
          <circle
            cx="100"
            cy="118"
            r="68"
            fill="#C4B5FD"
            fillOpacity={pose === "excited" ? "0.22" : "0.14"}
          />
        )}

        {/* Celebration / Excitement Rays */}
        {(pose === "excited" || pose === "cheering" || pose === "happy") && (
          <g stroke="url(#forgeGoldTrim)" strokeWidth="3.2" strokeLinecap="round">
            <line x1="26" y1="74" x2="16" y2="68" />
            <line x1="22" y1="92" x2="11" y2="92" />
            <line x1="174" y1="74" x2="184" y2="68" />
            <line x1="178" y1="92" x2="189" y2="92" />
          </g>
        )}

        {/* Thinking Question Mark '?' */}
        {pose === "thinking" && (
          <g transform="translate(152, 34)">
            <path
              d="M8 10C8 5.5 11.8 2 16.5 2C21.2 2 25 5.5 25 10C25 13.8 21.8 15.8 18.5 17.8C16.8 18.8 16 20.2 16 22.5"
              stroke="#6E6AF6"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="30" r="3" fill="#FBBF24" />
          </g>
        )}

        {/* Winking Floating Gold Star */}
        {pose === "winking" && (
          <path
            d="M174 78L177.2 85.2L185 86.2L179.2 91.5L180.8 99.2L174 95.3L167.2 99.2L168.8 91.5L163 86.2L170.8 85.2L174 78Z"
            fill="url(#forgeGoldTrim)"
          />
        )}

        {/* Main Character Group (ifted slightly when jumping in 'excited' pose) */}
        <g transform={pose === "excited" ? "translate(0, -10)" : undefined}>
          {/* Adventurer Backpack peeking from behind left shoulder */}
          <g>
            <rect
              x="32"
              y="112"
              width="34"
              height="46"
              rx="11"
              transform="rotate(-8 32 112)"
              fill="url(#forgePackLeather)"
              stroke="#1E1B4B"
              strokeWidth="2"
            />
            {/* Backpack Flap */}
            <rect
              x="33"
              y="112"
              width="32"
              height="16"
              rx="7"
              transform="rotate(-8 33 112)"
              fill="#B45309"
            />
            {/* 4-Point Forge Star Badge on Backpack Side */}
            <path
              d="M44 132L46 137L51 139L46 141L44 146L42 141L37 139L42 137L44 132Z"
              fill="#6E6AF6"
              stroke="#C4B5FD"
              strokeWidth="1"
            />
          </g>

          {/* Little Dark-Navy Boots */}
          <ellipse
            cx={pose === "excited" ? "78" : "82"}
            cy={pose === "excited" ? "174" : "178"}
            rx="15"
            ry="9"
            transform={pose === "excited" ? "rotate(-18 78 174)" : undefined}
            fill="#1E1B4B"
            stroke="#312E81"
            strokeWidth="2"
          />
          <ellipse
            cx={pose === "excited" ? "122" : "118"}
            cy={pose === "excited" ? "172" : "178"}
            rx="15"
            ry="9"
            transform={pose === "excited" ? "rotate(18 122 172)" : undefined}
            fill="#1E1B4B"
            stroke="#312E81"
            strokeWidth="2"
          />

          {/* Violet Cloak Body / Robe */}
          <path
            d="M64 118C58 136 56 156 60 170C68 175 132 175 140 170C144 156 142 136 136 118Z"
            fill="url(#forgeHood3D)"
            stroke="#FBBF24"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Gold Belt & Cloak Center Trim */}
          <rect x="64" y="148" width="72" height="7" rx="3.5" fill="#312E81" />
          <rect x="92" y="146" width="16" height="11" rx="3" fill="url(#forgeGoldTrim)" />
          <path d="M95 124L100 146L105 124" fill="url(#forgeGoldTrim)" />

          {/* Glowing Flame Tuft on Top of the Hood */}
          <g>
            <path
              d="M98 10C89 20 84 31 89 41C92 47 109 47 112 41C118 30 112 18 98 10Z"
              fill="url(#forgeFlameTuft)"
            >
              <animate
                attributeName="d"
                values="M98 10C89 20 84 31 89 41C92 47 109 47 112 41C118 30 112 18 98 10Z;M101 8C87 19 85 32 89 41C92 47 109 47 112 41C117 29 114 17 101 8Z;M98 10C89 20 84 31 89 41C92 47 109 47 112 41C118 30 112 18 98 10Z"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </path>
            {/* Inner Flame Core */}
            <path
              d="M100 20C95 27 93 33 96 39C98 42 104 42 106 39C109 33 106 26 100 20Z"
              fill="#FAE8FF"
              fillOpacity="0.8"
            />
          </g>

          {/* Main Pointed Violet Artisan Hood */}
          <path
            d="M100 32C64 36 42 66 44 104C45 121 62 130 100 130C138 130 155 121 156 104C158 66 136 36 100 32Z"
            fill="url(#forgeHood3D)"
            stroke="url(#forgeGoldTrim)"
            strokeWidth="2.5"
          />

          {/* Subtle Hood Seam Line */}
          <path
            d="M100 34V52"
            stroke="#C4B5FD"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Inner Hood Shadow Frame */}
          <path
            d="M100 50C70 52 54 74 55 102C56 116 70 124 100 124C130 124 144 116 145 102C146 74 130 52 100 50Z"
            fill="url(#forgeHoodInner)"
          />

          {/* Deep Midnight Spirit Face Inside the Hood */}
          <ellipse cx="100" cy="91" rx="40" ry="31" fill="url(#forgeSpiritFace)" />

          {/* Soft Violet Crystal Upward Face Glow */}
          <ellipse cx="100" cy="108" rx="28" ry="12" fill="#A855F7" fillOpacity="0.22" />

          {/* ==============================================================
              FACIAL EXPRESSIONS (EYES & MOUTH) BY POSE
             ============================================================== */}
          {pose === "happy" && (
            <>
              {/* Happy Curved Crescent Eyes ^ ^ */}
              <path
                d="M72 90C75 81 86 81 89 90"
                stroke="#EEF2FF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M111 90C114 81 125 81 128 90"
                stroke="#EEF2FF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Subtle Happy Smile */}
              <path
                d="M95 102C97.5 105.5 102.5 105.5 105 102"
                stroke="#C4B5FD"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </>
          )}

          {pose === "thinking" && (
            <>
              {/* Curious Glowing Oval Eyes Looking Up-Right */}
              <ellipse cx="81" cy="89" rx="7.5" ry="9.5" fill="#EEF2FF">
                {blink && (
                  <animate
                    attributeName="ry"
                    values="9.5;9.5;1;9.5"
                    keyTimes="0;0.9;0.95;1"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <ellipse cx="119" cy="89" rx="7.5" ry="9.5" fill="#EEF2FF">
                {blink && (
                  <animate
                    attributeName="ry"
                    values="9.5;9.5;1;9.5"
                    keyTimes="0;0.9;0.95;1"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <circle cx="83" cy="85" r="2.5" fill="#FFFFFF" />
              <circle cx="121" cy="85" r="2.5" fill="#FFFFFF" />
            </>
          )}

          {pose === "excited" && (
            <>
              {/* Joyful Arc Eyes + Open Happy Smile */}
              <path
                d="M72 88C75 80 86 80 89 88"
                stroke="#EEF2FF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M111 88C114 80 125 80 128 88"
                stroke="#EEF2FF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M93 99C95 106 105 106 107 99Z"
                fill="#F472B6"
                stroke="#EEF2FF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </>
          )}

          {pose === "coding" && (
            <>
              {/* Focused Coding Oval Eyes Looking Down at Laptop */}
              <ellipse cx="81" cy="92" rx="7.5" ry="8.5" fill="#EEF2FF">
                {blink && (
                  <animate
                    attributeName="ry"
                    values="8.5;8.5;1;8.5"
                    keyTimes="0;0.92;0.96;1"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <ellipse cx="119" cy="92" rx="7.5" ry="8.5" fill="#EEF2FF">
                {blink && (
                  <animate
                    attributeName="ry"
                    values="8.5;8.5;1;8.5"
                    keyTimes="0;0.92;0.96;1"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              {/* Laptop screen reflection in eyes */}
              <circle cx="81" cy="94" r="2.5" fill="#C084FC" />
              <circle cx="119" cy="94" r="2.5" fill="#C084FC" />
            </>
          )}

          {pose === "cheering" && (
            <>
              {/* Expressive > < Cheering Eyes from Concept Board */}
              <path
                d="M73 83L86 89L73 95"
                stroke="#EEF2FF"
                strokeWidth="4.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M127 83L114 89L127 95"
                stroke="#EEF2FF"
                strokeWidth="4.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M94 100C96 106 104 106 106 100"
                stroke="#EEF2FF"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}

          {pose === "winking" && (
            <>
              {/* Left Eye Open Oval, Right Eye Winking Arc */}
              <ellipse cx="81" cy="89" rx="7.5" ry="9.5" fill="#EEF2FF" />
              <circle cx="79" cy="86" r="2.5" fill="#FFFFFF" />
              <path
                d="M111 90C114 83 124 83 127 90"
                stroke="#EEF2FF"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              <path
                d="M95 101C98 104 103 104 106 100"
                stroke="#EEF2FF"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </>
          )}

          {/* ==============================================================
              ARMS, HANDS & PROPS BY POSE (Crystal, Laptop, Waving)
             ============================================================== */}
          {pose === "happy" && (
            <g>
              {/* Sleeves reaching toward center to hold the glowing Forge Crystal */}
              <path
                d="M58 124C52 136 62 148 76 146"
                stroke="url(#forgeHood3D)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M142 124C148 136 138 148 124 146"
                stroke="url(#forgeHood3D)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Glowing Forge Crystal held in front */}
              <g>
                {isTalking && (
                  <circle cx="100" cy="144" r="26" fill="#E879F9" fillOpacity="0.28">
                    <animate
                      attributeName="r"
                      values="22;29;22"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <polygon
                  points="100,118 78,144 100,168 122,144"
                  fill="url(#forgeCrystalGlow)"
                  stroke="#FAE8FF"
                  strokeWidth="2"
                />
                <path
                  d="M100 118V168M78 144H122"
                  stroke="#FFFFFF"
                  strokeOpacity="0.75"
                  strokeWidth="1.5"
                />
              </g>
              {/* Little Dark Hands holding crystal */}
              <circle cx="79" cy="145" r="7" fill="#1E1B4B" />
              <circle cx="121" cy="145" r="7" fill="#1E1B4B" />
            </g>
          )}

          {pose === "thinking" && (
            <g>
              {/* Left arm relaxed, Right hand raised to chin in thought */}
              <path
                d="M60 126C52 138 54 150 62 154"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="62" cy="155" r="7" fill="#1E1B4B" />
              <path
                d="M138 130C144 122 130 110 112 108"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="108" cy="107" r="7.5" fill="#1E1B4B" />
            </g>
          )}

          {(pose === "excited" || pose === "cheering") && (
            <g>
              {/* Both arms raised high in celebration */}
              <path
                d="M60 126C44 114 38 98 44 88"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="44" cy="86" r="7.5" fill="#1E1B4B" />
              <path
                d="M140 126C156 114 162 98 156 88"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="156" cy="86" r="7.5" fill="#1E1B4B" />
            </g>
          )}

          {pose === "winking" && (
            <g>
              {/* Left arm on hip, Right arm pointing toward the gold star */}
              <path
                d="M60 126C52 138 56 148 64 152"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="64" cy="152" r="7" fill="#1E1B4B" />
              <path
                d="M138 126C152 120 162 110 168 104"
                stroke="url(#forgeHood3D)"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <circle cx="170" cy="102" r="7.5" fill="#1E1B4B" />
            </g>
          )}

          {pose === "coding" && (
            <g>
              {/* Arms typing forward */}
              <path
                d="M60 128C56 140 66 150 78 152"
                stroke="url(#forgeHood3D)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M140 128C144 140 134 150 122 152"
                stroke="url(#forgeHood3D)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Sleek Laptop with 4-Point Forge Star on the Lid */}
              <rect
                x="68"
                y="162"
                width="74"
                height="8"
                rx="4"
                fill="#475569"
              />
              <path
                d="M78 128H146L138 164H70L78 128Z"
                fill="#64748B"
                stroke="#C4B5FD"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* 4-Point Forge Star on Laptop Lid */}
              <path
                d="M108 138L110.2 143.8L116 146L110.2 148.2L108 154L105.8 148.2L100 146L105.8 143.8L108 138Z"
                fill="#FAE8FF"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * 3D Golden Trophy & Forge Crystal Sculpture on Pastel Pedestal Blocks
 */
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
        className="h-full w-full drop-shadow-[0_12px_22px_rgba(245,158,11,0.22)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="trophyGold3D" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
          <linearGradient id="pedestalLilac3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="50%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#6E6AF6" />
          </linearGradient>
          <linearGradient id="pedestalCobalt3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="50%" stopColor="#6E6AF6" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="pedestalMint3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="55%" stopColor="#A7E3D1" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse cx="80" cy="138" rx="58" ry="8" fill="#1E1B4B" fillOpacity="0.12" />

        {/* 3D Pastel Geometric Blocks Base */}
        <rect x="24" y="102" width="34" height="30" rx="8" fill="url(#pedestalMint3D)" />
        <rect x="102" y="98" width="34" height="34" rx="8" fill="url(#pedestalCobalt3D)" />
        <rect x="48" y="94" width="64" height="38" rx="10" fill="url(#pedestalLilac3D)" />

        {/* Trophy Handles */}
        <path
          d="M50 38H38C31.37 38 26 43.37 26 50C26 58.84 33.16 66 42 66H52"
          stroke="url(#trophyGold3D)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M110 38H122C128.63 38 134 43.37 134 50C134 58.84 126.84 66 118 66H108"
          stroke="url(#trophyGold3D)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Trophy Cup Body */}
        <path
          d="M46 26C46 22.69 48.69 20 52 20H108C111.31 20 114 22.69 114 26V52C114 70.78 98.78 86 80 86C61.22 86 46 70.78 46 52V26Z"
          fill="url(#trophyGold3D)"
        />
        {/* Specular Shine on Trophy */}
        <path
          d="M58 28V50C58 58 62 65 68 69"
          stroke="#FFFFFF"
          strokeOpacity="0.7"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Trophy Stem & Pedestal Collar */}
        <rect x="73" y="82" width="14" height="16" rx="4" fill="url(#trophyGold3D)" />
        <rect x="58" y="94" width="44" height="10" rx="5" fill="url(#trophyGold3D)" />

        {/* Center 4-Point Forge Crystal Emblem on Cup */}
        <polygon
          points="80,32 90,46 80,60 70,46"
          fill="#A855F7"
          stroke="#FAF8F5"
          strokeWidth="1.5"
        />

        {/* Floating Sparkles */}
        <circle cx="24" cy="24" r="4" fill="#FBBF24" />
        <circle cx="136" cy="22" r="5" fill="#C4B5FD" />
        <circle cx="142" cy="82" r="4" fill="#A7E3D1" />

        {showRibbon && (
          <g transform="translate(26, 112)">
            <rect
              x="0"
              y="0"
              width="108"
              height="28"
              rx="10"
              transform="rotate(-4 54 14)"
              fill="#C4B5FD"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * 3D Course Card Illustrations
 */
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
        <rect
          x="18"
          y="14"
          width="94"
          height="64"
          rx="12"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />
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
        <path
          d="M95 45L83 62H93L90 75L104 57H94L95 45Z"
          fill="#1E1B4B"
        />
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
      <rect
        x="20"
        y="18"
        width="92"
        height="64"
        rx="14"
        fill="#1E1B4B"
      />
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
      className={cn("h-full w-full select-none drop-shadow-[0_14px_24px_rgba(110,106,246,0.2)]", className)}
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
      <rect
        x="76"
        y="80"
        width="58"
        height="52"
        rx="14"
        fill="url(#clusterLilac)"
      />

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
      <circle
        cx="132"
        cy="74"
        r="28"
        fill="url(#lensGlass3D)"
        stroke="#6E6AF6"
        strokeWidth="6"
      />
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

      <rect
        x="74"
        y="42"
        width="102"
        height="72"
        rx="16"
        fill="url(#projCardGrad)"
      />
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
