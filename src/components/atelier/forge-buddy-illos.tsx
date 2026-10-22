import type { SVGProps } from "react";

export function ForgeBuddyMark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 96 96" fill="none" role="img" aria-label="Forge Buddy mascot" {...props}>
    <path d="M48 5 57 19 74 16 72 33 88 43 76 56 80 73 62 74 48 90 35 75 17 78 20 60 7 48 20 36 17 19 36 21Z" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="3" strokeLinejoin="round"/>
    <rect x="25" y="31" width="46" height="35" rx="12" fill="#FFFDF9" stroke="#0E1B3D" strokeWidth="3"/>
    <circle cx="39" cy="46" r="4" fill="#0E1B3D"/><circle cx="57" cy="46" r="4" fill="#0E1B3D"/>
    <path d="M39 56Q48 64 58 55" stroke="#4F6BFF" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M48 8v11M83 47h-8M13 47h8" stroke="#FF8C7A" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}

export function BlueprintSpark(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 120 90" fill="none" aria-hidden="true" {...props}>
    <path d="M12 66 40 17 68 66Z" fill="#A7E3D1" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M48 66 76 17 104 66Z" fill="#C9BBFF" stroke="#0E1B3D" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M40 17 48 66M76 17 68 66M12 66h92" stroke="#0E1B3D" strokeWidth="1.5" strokeDasharray="4 4"/>
    <circle cx="76" cy="17" r="5" fill="#FFE08A" stroke="#0E1B3D" strokeWidth="2"/>
  </svg>;
}
