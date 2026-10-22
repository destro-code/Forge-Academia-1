import type { SVGProps } from "react";

export function ForgeBuddyMark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 96 96" fill="none" role="img" aria-label="Forge Buddy mascot" {...props} className={`forge-buddy-illustration forge-buddy-character ${props.className ?? ""}`}>
    <defs>
      <linearGradient id="buddy-crystal" x1="34" y1="9" x2="57" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF6D7"/><stop offset="1" stopColor="#C9BBFF"/></linearGradient>
      <linearGradient id="buddy-shell" x1="20" y1="31" x2="74" y2="75" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFDF9"/><stop offset="1" stopColor="#E8E2FF"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="85" rx="25" ry="5" fill="#0E1B3D" fillOpacity=".12"/>
    <g className="forge-buddy-character__float">
      <path d="M48 5 58 20 48 28 38 20 48 5Z" fill="url(#buddy-crystal)" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M48 5v23M38 20h20" stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="1.4"/>
      <path d="M32 24 48 31 64 24" stroke="#4F6BFF" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M27 34Q27 28 34 28H62Q69 28 69 35L75 58Q77 72 63 76H33Q19 72 21 58L27 34Z" fill="url(#buddy-shell)" stroke="#0E1B3D" strokeWidth="2.7" strokeLinejoin="round"/>
      <path d="M28 36Q48 43 68 36" stroke="#C9BBFF" strokeWidth="2"/>
      <rect x="29" y="39" width="38" height="23" rx="10" fill="#0E1B3D"/>
      <g className="forge-buddy-character__eyes">
        <ellipse cx="40" cy="49" rx="3.2" ry="4" fill="#A7E3D1"/>
        <ellipse cx="56" cy="49" rx="3.2" ry="4" fill="#A7E3D1"/>
      </g>
      <path d="M42 56Q48 61 54 56" stroke="#FFE08A" strokeWidth="2.3" strokeLinecap="round"/>
      <path d="M22 47 14 52 18 63 25 60M74 47 82 52 78 63 71 60" fill="#FF8C7A" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M36 76 34 82M60 76 62 82" stroke="#0E1B3D" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="m17 29 2 4 4 .7-3 2.5.8 4.1-3.8-2-3.6 2 .7-4.1-3-2.5 4.1-.7 1.8-4Z" fill="#FFE08A"/>
      <path d="m78 24 1.6 3.2 3.4.5-2.5 2.4.6 3.4-3.1-1.6-3.1 1.6.6-3.4-2.5-2.4 3.4-.5L78 24Z" fill="#A7E3D1"/>
    </g>
  </svg>;
}

export function BlueprintSpark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 120 90" fill="none" aria-hidden="true" {...props} className={`blueprint-spark-illustration ${props.className ?? ""}`}>
    <path d="M12 66 40 17 68 66Z" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M48 66 76 17 104 66Z" fill="#C9BBFF" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M40 17 48 66M76 17 68 66M12 66h92" stroke="#0E1B3D" strokeWidth="1.5" strokeDasharray="4 4"/>
    <circle cx="76" cy="17" r="5" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="2"/>
  </svg>;
}
