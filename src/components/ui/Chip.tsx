import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Chip — the core status/label primitive of the Mint Design System.
 *
 * Every tone maps to a background/foreground token pair from globals.css, so
 * chips stay consistent and theme-aware. Pass a lucide icon component via
 * `icon` (we map the handoff's Material Symbol names to lucide in lib/icons).
 */
export type ChipTone =
  | "healthy"
  | "treatment"
  | "watch"
  | "fiv"
  | "felv"
  | "vaccineOk"
  | "vaccineDue"
  | "meta"
  | "planHealth"
  | "planFun"
  | "planOff";

const TONES: Record<ChipTone, string> = {
  healthy: "bg-pink-bg text-pink-fg",
  treatment: "bg-orange-bg text-orange-fg",
  watch: "bg-grape-bg text-grape-fg",
  fiv: "bg-coral-bg text-coral-fg",
  felv: "bg-grape-bg text-grape-fg",
  vaccineOk: "bg-success-bg text-success-fg",
  vaccineDue: "bg-amber-bg text-amber-fg",
  meta: "bg-panel text-muted",
  planHealth: "bg-plan-health-bg text-plan-health-fg",
  planFun: "bg-plan-fun-bg text-plan-fun-fg",
  planOff: "bg-plan-off-bg text-plan-off-fg",
};

interface ChipProps {
  tone: ChipTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function Chip({ tone, icon: Icon, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-chip px-[9px] py-1 text-[11px] font-extrabold",
        TONES[tone],
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
      {children}
    </span>
  );
}
