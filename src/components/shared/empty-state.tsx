import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ForgeBuddyMascot3D } from "@/components/atelier/forge-buddy-illos";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#6E6AF6]/30 bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 flex flex-col items-center">
        <ForgeBuddyMascot3D mood="thinking" className="h-24 w-24" />
        {icon && (
          <div className="-mt-3 grid h-9 w-9 place-items-center rounded-xl bg-[#1E1B4B] text-[#FBBF24] shadow-sm border border-[#6E6AF6]/40">
            {icon}
          </div>
        )}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
