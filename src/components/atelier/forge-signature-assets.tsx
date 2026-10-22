import type { SVGProps } from "react";

export type ForgeIconName =
  | "studio" | "learn" | "playground" | "projects" | "awards"
  | "progress" | "mentor" | "settings" | "search" | "lesson"
  | "blueprint" | "toolbox" | "bug" | "idea" | "streak"
  | "check" | "sparkle" | "chat";

type IconProps = SVGProps<SVGSVGElement> & { name: ForgeIconName };

/** Forge's own faceted crystal mark. Designed to work from favicon size to hero artwork. */
export function ForgeMark({ size = 40, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden="true" focusable="false" className={`forge-mark ${className ?? ""}`} {...props}>
    <defs>
      <linearGradient id="forge-mark-top" x1="11" y1="7" x2="34" y2="25" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF6D7"/><stop offset="1" stopColor="#C9BBFF"/></linearGradient>
      <linearGradient id="forge-mark-left" x1="8" y1="19" x2="24" y2="43" gradientUnits="userSpaceOnUse"><stop stopColor="#8DA2FF"/><stop offset="1" stopColor="#4F6BFF"/></linearGradient>
      <linearGradient id="forge-mark-right" x1="25" y1="20" x2="42" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#A7E3D1"/><stop offset="1" stopColor="#4D9C92"/></linearGradient>
    </defs>
    <path d="M24 3 39 12 44 23 24 45 4 23 9 12 24 3Z" fill="#0E1B3D" fillOpacity=".1" transform="translate(0 2)"/>
    <path d="M24 3 39 12 24 22 9 12 24 3Z" fill="url(#forge-mark-top)" stroke="#0E1B3D" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9 12 24 22 24 44 4 23 9 12Z" fill="url(#forge-mark-left)" stroke="#0E1B3D" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M39 12 24 22 24 44 44 23 39 12Z" fill="url(#forge-mark-right)" stroke="#0E1B3D" strokeOpacity=".55" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M24 3V22M9 12 24 34 39 12" stroke="#FFFDF9" strokeOpacity=".85" strokeWidth="1.2"/>
    <path d="m39 3 1.5 3.5L44 8l-3.5 1.5L39 13l-1.5-3.5L34 8l3.5-1.5L39 3Z" fill="#FF8C7A"/>
  </svg>;
}

/** Branded loader. The CSS animation respects prefers-reduced-motion. */
export function ForgeLoader({ label = "Loading Forge", size = 44, className = "" }: { label?: string; size?: number; className?: string }) {
  return <span className={`forge-loader ${className}`} role="status" aria-label={label}>
    <ForgeMark size={size} className="forge-loader__mark" />
    <span className="forge-loader__orbit" aria-hidden="true"><i /><i /><i /></span>
    <span className="sr-only">{label}</span>
  </span>;
}

/** Small, consistent line icons for high-frequency product navigation and actions. */
export function ForgeIcon({ name, ...props }: IconProps) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const, focusable: false as const, ...props };
  switch (name) {
    case "studio": return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></svg>;
    case "learn": case "lesson": return <svg {...common}><path d="M3 5.5c3.2-1.7 6.2-1.4 9 1v13c-2.8-2.4-5.8-2.7-9-1z"/><path d="M21 5.5c-3.2-1.7-6.2-1.4-9 1v13c2.8-2.4 5.8-2.7 9-1z"/><path d="M6 9h2M6 12h2M16 9h2M16 12h2"/></svg>;
    case "playground": return <svg {...common}><path d="m8 5-5 7 5 7M16 5l5 7-5 7M14 3l-4 18"/></svg>;
    case "projects": return <svg {...common}><path d="M3 7.5h7l2 2H21v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7.5V5a2 2 0 0 1 2-2h4l2 2h4"/></svg>;
    case "awards": return <svg {...common}><circle cx="12" cy="8" r="5"/><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9M10 8l1.3 1.3L14 6.5"/></svg>;
    case "progress": return <svg {...common}><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><circle cx="20" cy="6" r="1.5"/></svg>;
    case "mentor": return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.8L4 20l1.2-4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.9h-3l-.3-1.9a8 8 0 0 1-1.7-1l-1.7.7-1.5-2.6 1.5-1.1a7 7 0 0 1 0-2l-1.5-1.1L7 8.8l1.7.7a8 8 0 0 1 1.7-1l.3-1.9h3l.3 1.9a8 8 0 0 1 1.7 1l1.7-.7 1.5 2.6-1.5 1.1a7 7 0 0 1 0 2Z"/></svg>;
    case "search": return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>;
    case "blueprint": return <svg {...common}><path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5M7 12h10M7 16h7M7 8h3"/></svg>;
    case "toolbox": return <svg {...common}><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V5h8v3M3 13h18M10 12v3h4v-3"/></svg>;
    case "bug": return <svg {...common}><path d="M9 9h6a4 4 0 0 1 4 4v3a7 7 0 0 1-14 0v-3a4 4 0 0 1 4-4Z"/><path d="M9 9 7 6M15 9l2-3M3 12h3M18 12h3M4 18h3M17 18h3M12 9V5"/></svg>;
    case "idea": return <svg {...common}><path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-.8.7-1 1.5-1 2h-6c0-.5-.2-1.3-1-2Z"/><path d="M12 1v2M4 4l1.5 1.5M20 4l-1.5 1.5"/></svg>;
    case "streak": return <svg {...common}><path d="M13 2c1 4-2 5-1 8 1-1 2-2 2-4 4 3 6 7 4 11a7 7 0 0 1-13-2c-.5-3 1-5 4-8 0 3 1 4 2 5 0-4 1-7 2-10Z"/></svg>;
    case "check": return <svg {...common}><path d="m5 12 4.2 4.2L19 6.5"/></svg>;
    case "sparkle": return <svg {...common}><path d="m12 2 2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z"/><path d="m19 15 1.1 2.9L23 19l-2.9 1.1L19 23l-1.1-2.9L15 19l2.9-1.1Z"/></svg>;
    case "chat": return <svg {...common}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.8L4 20l1.2-4A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M8 11h8M8 14h5"/></svg>;
  }
}
