import type { AtelierChapterId } from "@/lib/curriculum/atelier-chapters";

export function ForgeBuddyMascot({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 72 72" className={className} fill="none">
      <ellipse cx="36" cy="63" rx="22" ry="5" fill="#0E1B3D" opacity=".12" />
      <path d="M36 8v7" stroke="#0E1B3D" strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="7" r="4" fill="#FF8C7A" stroke="#0E1B3D" strokeWidth="2" />
      <rect x="12" y="17" width="48" height="39" rx="14" fill="#C9BBFF" stroke="#0E1B3D" strokeWidth="2.5" />
      <rect x="17" y="22" width="38" height="25" rx="9" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2" />
      <circle cx="28" cy="33" r="3.5" fill="#4F6BFF" />
      <circle cx="44" cy="33" r="3.5" fill="#4F6BFF" />
      <path d="M29 40c4 4 10 4 14 0" stroke="#0E1B3D" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 30H7M60 30h5" stroke="#0E1B3D" strokeWidth="3" strokeLinecap="round" />
      <rect x="25" y="52" width="22" height="9" rx="4.5" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2" />
      <path d="M23 58l-5 5M49 58l5 5" stroke="#0E1B3D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const CHAPTER_COLORS: Record<AtelierChapterId, { main: string; light: string; dark: string }> = {
  foundations: { main: "#158062", light: "#A7E3D1", dark: "#0E1B3D" },
  "css-craft": { main: "#4F6BFF", light: "#C9D2FF", dark: "#0E1B3D" },
  javascript: { main: "#9B7700", light: "#FFE08A", dark: "#0E1B3D" },
  "react-architecture": { main: "#7652C7", light: "#C9BBFF", dark: "#0E1B3D" },
};

export function ChapterFolioArtwork({ chapterId, className = "" }: { chapterId: AtelierChapterId; className?: string }) {
  const colors = CHAPTER_COLORS[chapterId];
  return (
    <svg aria-hidden="true" viewBox="0 0 180 112" className={className} fill="none">
      <ellipse cx="91" cy="101" rx="56" ry="6" fill="#0E1B3D" opacity=".1" />
      <g transform="translate(24 16) rotate(-8 50 40)">
        <rect x="12" y="16" width="94" height="66" rx="12" fill={colors.dark} opacity=".12" />
        <rect x="5" y="8" width="94" height="66" rx="12" fill={colors.light} stroke={colors.dark} strokeWidth="2.4" />
        <rect x="12" y="15" width="80" height="9" rx="4.5" fill="#FFFDF9" opacity=".9" />
        <circle cx="19" cy="19.5" r="2" fill="#FF8C7A" />
        <circle cx="26" cy="19.5" r="2" fill="#FFE08A" />
        <circle cx="33" cy="19.5" r="2" fill="#A7E3D1" />
        <rect x="16" y="32" width="32" height="31" rx="5" fill={colors.main} />
        <rect x="54" y="33" width="28" height="5" rx="2.5" fill={colors.dark} opacity=".76" />
        <rect x="54" y="43" width="22" height="4" rx="2" fill={colors.dark} opacity=".35" />
        <rect x="54" y="51" width="26" height="4" rx="2" fill={colors.dark} opacity=".35" />
      </g>
      <g transform="translate(105 10) rotate(10)">
        <rect x="0" y="0" width="43" height="48" rx="11" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="2.4" />
        <path d="M12 15h19M12 23h15M12 31h9" stroke={colors.main} strokeWidth="4" strokeLinecap="round" />
        <circle cx="33" cy="37" r="7" fill={colors.light} stroke="#0E1B3D" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function BlueprintArrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 48" className={className} fill="none">
      <path d="M4 35C32 5 66 5 96 25" stroke="#4F6BFF" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="4 5" />
      <path d="m87 18 10 7-12 3" stroke="#4F6BFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5" cy="35" r="3" fill="#FF8C7A" />
    </svg>
  );
}
