import { cn } from "@/lib/utils"
import type { MotionStyle } from "../deriveMotionTokens"

export interface MotionSectionProps {
  value: MotionStyle
  onChange: (value: MotionStyle) => void
}

const MOTION_OPTIONS: { value: MotionStyle; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "standard", label: "Standard" },
  { value: "expressive", label: "Expressive" },
]

const MOTION_DESCRIPTIONS: Record<MotionStyle, string> = {
  minimal: "Quick, quiet transitions — reduced movement throughout.",
  standard: "The theme's own default motion character, unchanged.",
  expressive: "Richer stagger and movement across every section.",
}

/** Scales each theme's own base timing/distance/stagger up or down — see deriveMotionTokens.ts. Doesn't replace a theme's motion character, just dials it. */
export function MotionSection({ value, onChange }: MotionSectionProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {MOTION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === option.value
                ? "border-[var(--primary)] bg-accent"
                : "border-[var(--border)] hover:bg-accent",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{MOTION_DESCRIPTIONS[value]}</p>
    </div>
  )
}
