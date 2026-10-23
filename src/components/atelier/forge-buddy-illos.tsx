import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AtelierChapterAccent } from "@/lib/curriculum/atelier-chapters";

/**
 * Exact "Forge Academia" Lightbulb + Spark Brand Mark from the reference moodboard (Panels 1, 2, 4, 5, 10)
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
      ? "text-base"
      : size === "lg"
        ? "text-2xl"
        : "text-lg";

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className={cn("relative flex shrink-0 items-center justify-center", iconDimensions)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_6px_12px_rgba(79,107,255,0.25)]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="forgeBulbGlow" cx="50%" cy="38%" r="55%">
              <stop offset="0%" stopColor="#FFF5B8" />
              <stop offset="55%" stopColor="#FFE08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id="forgeCobaltStroke" x1="8" y1="6" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F6BFF" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          {/* Floating Sparkles around bulb */}
          <circle cx="9" cy="12" r="2" fill="#FFE08A" />
          <path
            d="M39 8L40.2 11.3L43.5 12.5L40.2 13.7L39 17L37.8 13.7L34.5 12.5L37.8 11.3L39 8Z"
            fill="#4F6BFF"
          />
          {/* Warm Inner Bulb Glow */}
          <path
            d="M24 9C16.82 9 11 14.82 11 22C11 26.8 13.6 30.98 17.5 33.22V36C17.5 37.66 18.84 39 20.5 39H27.5C29.16 39 30.5 37.66 30.5 36V33.22C34.4 30.98 37 26.8 37 22C37 14.82 31.18 9 24 9Z"
            fill="url(#forgeBulbGlow)"
          />
          {/* Specular 3D Highlight on Bulb */}
          <ellipse
            cx="19.5"
            cy="17.5"
            rx="4.2"
            ry="6"
            transform="rotate(-22 19.5 17.5)"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />
          {/* Deep Cobalt Outline & Filament */}
          <path
            d="M24 9C16.82 9 11 14.82 11 22C11 26.8 13.6 30.98 17.5 33.22V36.5C17.5 38.43 19.07 40 21 40H27C28.93 40 30.5 38.43 30.5 36.5V33.22C34.4 30.98 37 26.8 37 22C37 14.82 31.18 9 24 9Z"
            stroke="url(#forgeCobaltStroke)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Code Bracket Filament inside Bulb */}
          <path
            d="M20.5 21L18 23.5L20.5 26M27.5 21L30 23.5L27.5 26M25 19.5L23 27.5"
            stroke="#0E1B3D"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bulb Base Rings */}
          <path
            d="M20 43.5H28"
            stroke="#0E1B3D"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-display font-extrabold tracking-tight text-[#0E1B3D] dark:text-[#F8F6F0]", titleSize)}>
          Forge
        </span>
        <span
          className={cn(
            "font-sans font-medium tracking-tight text-[#4A5578] dark:text-[#CBD5F0]",
            size === "lg" ? "text-base -mt-0.5" : "text-xs -mt-0.5",
          )}
        >
          Academia
        </span>
        {showSubtitle && (
          <span className="mt-0.5 font-mono text-[10px] text-[#7B86A6]">
            Creative Atelier
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Hand-drawn curved arrows matching Panel 1, Panel 2 ("Curved Arrows & Doodles"), Panel 5, and Panel 10
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
          stroke="#4F6BFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 0"
        />
        <path
          d="M65 14L75.5 22.5L63.5 28"
          stroke="#4F6BFF"
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
        stroke="#FF8C7A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M49 9H63.5V23"
        stroke="#FF8C7A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Handwritten annotation callout ("Small steps. Big dreams.", "You're building something amazing!")
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
        "inline-flex items-center gap-1.5 select-none font-[family-name:var(--font-handwritten)] text-xl font-bold leading-tight text-[#1E3A8A] dark:text-[#C9BBFF]",
        rotation,
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * 3D-Shaded Robot Mascot ("Forge Buddy") matching Panels 1, 2, 4, 7 & 8
 * Built with multi-stop 3D radial/linear specular gradients so it looks like a glossy 3D toy sculpture.
 */
export function ForgeBuddyMascot3D({
  className,
  mood = "cheerful",
  speechBubble,
}: {
  className?: string;
  mood?: "cheerful" | "thinking" | "celebrating";
  speechBubble?: string;
}) {
  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      {speechBubble && (
        <div className=" -top-8 -right-4 z-10 whitespace-nowrap rounded-2xl border border-[#C9BBFF] bg-white px-3 py-1.5 font-[family-name:var(--font-handwritten)] text-base font-bold text-[#1E3A8A] shadow-[0_8px_20px_-4px_rgba(79,107,255,0.22)] dark:bg-[#19274A] dark:text-[#F8F6F0]">
          {speechBubble}
        </div>
      )}
      <svg
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_14px_24px_rgba(14,27,61,0.16)]"
        aria-label="Forge Buddy 3D Robot Mascot"
      >
        <defs>
          {/* Glossy 3D Pearl White Head & Body */}
          <radialGradient id="buddyHead3D" cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="58%" stopColor="#EEF2FF" />
            <stop offset="88%" stopColor="#C7D2FE" />
            <stop offset="100%" stopColor="#93A8F4" />
          </radialGradient>
          {/* Glossy 3D Cobalt Blue Armor/Headphones */}
          <radialGradient id="buddyCobalt3D" cx="32%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#8CA0FF" />
            <stop offset="45%" stopColor="#4F6BFF" />
            <stop offset="100%" stopColor="#1E329E" />
          </radialGradient>
          {/* Glossy 3D Butter Yellow Star/Antenna */}
          <radialGradient id="buddyGold3D" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="45%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          {/* Glossy 3D Mint Cube */}
          <linearGradient id="buddyMint3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="50%" stopColor="#A7E3D1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          {/* Deep Navy Glass Visor */}
          <linearGradient id="buddyVisor3D" x1="40" y1="50" x2="140" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="100%" stopColor="#080E24" />
          </linearGradient>
        </defs>

        {/* Soft Ground Shadow */}
        <ellipse cx="90" cy="166" rx="46" ry="8" fill="#0E1B3D" fillOpacity="0.12" />

        {/* Floating 3D Sparkles & Mini Shapes */}
        <g>
          {/* Top-left floating 3D Star */}
          <path
            d="M26 30L29.5 38L38 39.5L31.5 45.5L33 54L26 49.5L19 54L20.5 45.5L14 39.5L22.5 38L26 30Z"
            fill="url(#buddyGold3D)"
          />
          {/* Top-right floating 3D Mint Sphere */}
          <circle cx="154" cy="40" r="9" fill="url(#buddyMint3D)" />
          <circle cx="151" cy="37" r="3" fill="#FFFFFF" fillOpacity="0.7" />
        </g>

        {/* Antenna Stem & Glowing Bulb */}
        <rect x="86" y="18" width="8" height="18" rx="4" fill="url(#buddyCobalt3D)" />
        <circle cx="90" cy="15" r="9" fill="url(#buddyGold3D)" />
        <circle cx="87" cy="12" r="3" fill="#FFFFFF" fillOpacity="0.85" />

        {/* Robot Body / Torso */}
        <rect x="52" y="114" width="76" height="44" rx="22" fill="url(#buddyHead3D)" />
        {/* Chest Cobalt Core Badge */}
        <rect x="70" y="125" width="40" height="22" rx="11" fill="url(#buddyCobalt3D)" />
        <path
          d="M84 133L80 136L84 139M96 133L100 136L96 139M91.5 131.5L88.5 140.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Waving Left & Right 3D Arms */}
        <rect
          x="24"
          y="102"
          width="24"
          height="36"
          rx="12"
          transform="rotate(-28 24 102)"
          fill="url(#buddyHead3D)"
        />
        <circle cx="25" cy="98" r="9" fill="url(#buddyCobalt3D)" />
        <rect
          x="134"
          y="110"
          width="24"
          height="36"
          rx="12"
          transform="rotate(22 134 110)"
          fill="url(#buddyHead3D)"
        />
        <circle cx="154" cy="108" r="9" fill="url(#buddyCobalt3D)" />

        {/* Cobalt Blue 3D Headphone Ears */}
        <rect x="26" y="58" width="18" height="36" rx="9" fill="url(#buddyCobalt3D)" />
        <rect x="136" y="58" width="18" height="36" rx="9" fill="url(#buddyCobalt3D)" />

        {/* Main 3D Rounded Robot Head */}
        <rect x="36" y="32" width="108" height="86" rx="42" fill="url(#buddyHead3D)" />
        {/* Top Cobalt Crown Cap */}
        <path
          d="M64 33C72 31 108 31 116 33C112 41 102 45 90 45C78 45 68 41 64 33Z"
          fill="url(#buddyCobalt3D)"
        />
        {/* Specular Head Highlight */}
        <ellipse
          cx="66"
          cy="48"
          rx="20"
          ry="8"
          transform="rotate(-12 66 48)"
          fill="#FFFFFF"
          fillOpacity="0.8"
        />

        {/* Deep Navy Glossy Visor Screen */}
        <rect x="48" y="52" width="84" height="50" rx="25" fill="url(#buddyVisor3D)" />
        {/* Glass reflection on visor */}
        <path
          d="M58 58C72 54 96 54 116 58"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Glowing Cyan Robot Eyes & Expression */}
        {mood === "celebrating" ? (
          <>
            <path
              d="M64 76C67 70 75 70 78 76"
              stroke="#67E8F9"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M102 76C105 70 113 70 116 76"
              stroke="#67E8F9"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="71" cy="74" r="7.5" fill="#67E8F9" />
            <circle cx="69" cy="71.5" r="2.8" fill="#FFFFFF" />
            <circle cx="109" cy="74" r="7.5" fill="#67E8F9" />
            <circle cx="107" cy="71.5" r="2.8" fill="#FFFFFF" />
          </>
        )}

        {/* Warm Coral Blush Cheeks */}
        <ellipse cx="59" cy="84" rx="5" ry="3" fill="#FF8C7A" fillOpacity="0.75" />
        <ellipse cx="121" cy="84" rx="5" ry="3" fill="#FF8C7A" fillOpacity="0.75" />

        {/* Friendly Glowing Smile */}
        <path
          d={
            mood === "thinking"
              ? "M83 86H97"
              : "M81 84C84 90 96 90 99 84"
          }
          stroke="#67E8F9"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * 3D Golden Trophy & Flame Sculpture on Pastel Blocks (matching Panel 5 "Your Progress" & Panel 10 "You got this!")
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
            <stop offset="50%" stopColor="#C9BBFF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="pedestalCobalt3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="50%" stopColor="#4F6BFF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="pedestalMint3D" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D1FAE5" />
            <stop offset="55%" stopColor="#A7E3D1" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse cx="80" cy="138" rx="58" ry="8" fill="#0E1B3D" fillOpacity="0.12" />

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

        {/* Center Star Emblem on Cup */}
        <path
          d="M80 34L83.5 42L92 43L85.8 48.8L87.5 57L80 52.8L72.5 57L74.2 48.8L68 43L76.5 42L80 34Z"
          fill="#FFFBEB"
        />

        {/* Floating Sparkles */}
        <circle cx="24" cy="24" r="4" fill="#FFE08A" />
        <circle cx="136" cy="22" r="5" fill="#C9BBFF" />
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
              fill="#C9BBFF"
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
 * 3D Course Card Illustrations matching Panel 5 ("Your Learning Path") and Panel 8 ("Course Cards")
 */
export function ChapterFolio3DArt({
  accent,
  className,
}: {
  accent: AtelierChapterAccent;
  className?: string;
}) {
  if (accent === "mint") {
    // HTML Basics: 3D Mint & Emerald interlocking blocks + mini browser window
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
        {/* Mini Floating Browser Card */}
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
        <circle cx="40" cy="25" r="3" fill="#FFE08A" />
        <circle cx="50" cy="25" r="3" fill="#34D399" />
        <rect x="28" y="36" width="46" height="8" rx="4" fill="#A7E3D1" />
        <rect x="28" y="50" width="70" height="6" rx="3" fill="#D1FAE5" />
        <rect x="28" y="61" width="54" height="6" rx="3" fill="#D1FAE5" />
        {/* 3D Mint Cube & Tag Badge */}
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
    // CSS Magic: Glowing 3D cubes, spheres, magic wand & sparkles (Panels 5 & 8)
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
            <stop offset="50%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </radialGradient>
        </defs>
        {/* Translucent Glass Frame */}
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
        <rect x="26" y="28" width="42" height="10" rx="5" fill="#FFE08A" />
        <rect x="26" y="44" width="64" height="7" rx="3.5" fill="#FFFFFF" fillOpacity="0.55" />
        <rect x="26" y="56" width="48" height="7" rx="3.5" fill="#A7E3D1" fillOpacity="0.85" />

        {/* 3D Tilted Cube */}
        <rect
          x="96"
          y="22"
          width="54"
          height="54"
          rx="14"
          transform="rotate(-14 96 22)"
          fill="url(#cssCube3D)"
        />
        {/* 3D Glossy Sphere */}
        <circle cx="144" cy="74" r="18" fill="url(#cssSphere3D)" />
        {/* Sparkle Stars */}
        <path
          d="M84 12L86.5 18.5L93 21L86.5 23.5L84 30L81.5 23.5L75 21L81.5 18.5L84 12Z"
          fill="#FFE08A"
        />
        <circle cx="156" cy="24" r="4" fill="#FFE08A" />
      </svg>
    );
  }

  if (accent === "butter") {
    // JavaScript Adventure: 3D Gold/Butter logic blocks & interactive lightning
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
        {/* Stacked 3D Logic Blocks */}
        <rect x="22" y="24" width="52" height="52" rx="14" fill="#FFFFFF" fillOpacity="0.9" />
        <text
          x="35"
          y="58"
          fill="#0E1B3D"
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
          fill="#0E1B3D"
        />
        <circle cx="144" cy="46" r="18" fill="#C9BBFF" />
        <circle cx="139" cy="41" r="5" fill="#FFFFFF" fillOpacity="0.65" />
      </svg>
    );
  }

  // React & Build Real Projects: 3D Atom + Multi-layer App Showcase
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
          <stop offset="50%" stopColor="#C9BBFF" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
      <rect
        x="20"
        y="18"
        width="92"
        height="64"
        rx="14"
        fill="#0E1B3D"
      />
      <circle cx="33" cy="30" r="3" fill="#FF8C7A" />
      <circle cx="43" cy="30" r="3" fill="#FFE08A" />
      <circle cx="53" cy="30" r="3" fill="#A7E3D1" />
      <rect x="30" y="42" width="44" height="8" rx="4" fill="#4F6BFF" />
      <rect x="30" y="56" width="68" height="14" rx="6" fill="#1E293B" />

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
      <circle cx="132" cy="54" r="4.5" fill="#FFE08A" />
    </svg>
  );
}

/**
 * 3D Creative Desk Cluster from Panel 2 ("The Living Blueprint") & Panel 5 (Top-right of Next Up card)
 */
export function StudioDesk3DCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full select-none drop-shadow-[0_14px_24px_rgba(79,107,255,0.16)]", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="clusterCobalt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B91FF" />
          <stop offset="100%" stopColor="#3B53D9" />
        </linearGradient>
        <linearGradient id="clusterLilac" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="clusterMint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <radialGradient id="clusterStarGold" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="50%" stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* Soft Pastel Pedestal Base */}
      <ellipse cx="112" cy="142" rx="84" ry="12" fill="#C9BBFF" fillOpacity="0.35" />

      {/* Back Floating Browser Frame */}
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
      <circle cx="62" cy="31" r="3.5" fill="#FFE08A" />
      <circle cx="74" cy="31" r="3.5" fill="#A7E3D1" />
      <rect x="48" y="44" width="54" height="9" rx="4.5" fill="#4F6BFF" fillOpacity="0.2" />
      <rect x="48" y="59" width="84" height="7" rx="3.5" fill="#F4EFE6" />
      <rect x="48" y="72" width="66" height="7" rx="3.5" fill="#F4EFE6" />

      {/* 3D Cobalt Block */}
      <rect
        x="24"
        y="70"
        width="56"
        height="56"
        rx="16"
        transform="rotate(-8 24 70)"
        fill="url(#clusterCobalt)"
      />
      {/* 3D Mint Block */}
      <rect
        x="128"
        y="56"
        width="56"
        height="56"
        rx="16"
        transform="rotate(10 128 56)"
        fill="url(#clusterMint)"
      />
      {/* 3D Lilac Block */}
      <rect
        x="76"
        y="80"
        width="58"
        height="52"
        rx="14"
        fill="url(#clusterLilac)"
      />

      {/* Glossy 3D Gold Star */}
      <path
        d="M84 44L89.5 56.5L103 58.5L93 68L95.5 81.5L84 75L72.5 81.5L75 68L65 58.5L78.5 56.5L84 44Z"
        fill="url(#clusterStarGold)"
      />

      {/* Floating Cobalt Code Tag Badge </> */}
      <g transform="translate(146, 12)">
        <rect width="54" height="38" rx="12" fill="#4F6BFF" />
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
 * 3D Bug Hunter Sculpture for Debug Lab Hub (Magnifying Glass + 3D Ladybug/Beetle + Code Diagnostic Frame)
 */
export function DebugLabBugHunter3D({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "h-full w-full select-none drop-shadow-[0_14px_24px_rgba(255,140,122,0.22)]",
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
          <stop offset="65%" stopColor="#A7E3D1" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="136" rx="68" ry="10" fill="#0E1B3D" fillOpacity="0.12" />

      {/* Deep Navy Diagnostic Terminal Card */}
      <rect x="20" y="18" width="118" height="82" rx="16" fill="#0E1B3D" />
      <circle cx="34" cy="31" r="3.5" fill="#FF8C7A" />
      <circle cx="45" cy="31" r="3.5" fill="#FFE08A" />
      <circle cx="56" cy="31" r="3.5" fill="#A7E3D1" />
      <rect x="32" y="45" width="64" height="7" rx="3.5" fill="#FF8C7A" fillOpacity="0.85" />
      <rect x="32" y="59" width="88" height="7" rx="3.5" fill="#A7E3D1" />
      <rect x="32" y="73" width="52" height="7" rx="3.5" fill="#C9BBFF" />

      {/* 3D Cute Mechanical Code Bug */}
      <circle cx="118" cy="84" r="24" fill="url(#bugShell3D)" />
      <path d="M118 60V108" stroke="#0E1B3D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="109" cy="78" r="3.5" fill="#0E1B3D" />
      <circle cx="127" cy="78" r="3.5" fill="#0E1B3D" />
      <circle cx="111" cy="92" r="3" fill="#FFE08A" />
      <circle cx="125" cy="92" r="3" fill="#FFE08A" />

      {/* 3D Magnifying Glass Inspecting the Bug */}
      <rect
        x="146"
        y="88"
        width="12"
        height="40"
        rx="6"
        transform="rotate(-42 146 88)"
        fill="#4F6BFF"
      />
      <circle
        cx="132"
        cy="74"
        r="28"
        fill="url(#lensGlass3D)"
        stroke="#4F6BFF"
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
        "h-full w-full select-none drop-shadow-[0_14px_24px_rgba(79,107,255,0.2)]",
        className,
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="projCardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F6BFF" />
          <stop offset="100%" stopColor="#6930C3" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="136" rx="72" ry="10" fill="#0E1B3D" fillOpacity="0.12" />

      {/* Back Blueprint Frame */}
      <rect
        x="22"
        y="22"
        width="112"
        height="76"
        rx="14"
        fill="#FFFFFF"
        stroke="#C9BBFF"
        strokeWidth="2.5"
      />
      <rect x="34" y="36" width="46" height="10" rx="5" fill="#A7E3D1" />
      <rect x="34" y="52" width="84" height="8" rx="4" fill="#EEF2FF" />
      <rect x="34" y="66" width="64" height="8" rx="4" fill="#EEF2FF" />

      {/* Foreground 3D App Window */}
      <rect
        x="74"
        y="42"
        width="102"
        height="72"
        rx="16"
        fill="url(#projCardGrad)"
      />
      <circle cx="88" cy="55" r="3" fill="#FF8C7A" />
      <circle cx="98" cy="55" r="3" fill="#FFE08A" />
      <circle cx="108" cy="55" r="3" fill="#A7E3D1" />
      <rect x="88" y="68" width="52" height="10" rx="5" fill="#FFE08A" />
      <rect x="88" y="84" width="72" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.22" />

      {/* Floating Rocket / Launch Star */}
      <circle cx="46" cy="104" r="18" fill="#FFE08A" />
      <path
        d="M46 93L49 101L57 102L51 107L52.5 115L46 111L39.5 115L41 107L35 102L43 101L46 93Z"
        fill="#0E1B3D"
      />
    </svg>
  );
}

