import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { OmbreMode } from "../derivePalette"

const OMBRE_OPTIONS: { value: OmbreMode; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "soft", label: "Soft" },
  { value: "premium", label: "Premium" },
  { value: "sunset", label: "Sunset" },
  { value: "ocean", label: "Ocean" },
  { value: "custom", label: "Custom" },
]

export interface OmbreSectionProps {
  value: OmbreMode
  onChange: (mode: OmbreMode) => void
  secondColor: string
  onSecondColorChange: (color: string) => void
  /** The live-derived gradient (gradientFrom → gradientMid → gradientTo) as a CSS `linear-gradient(...)` string, rendered as a preview bar. */
  previewGradient: string
}

/** Custom reveals exactly one extra picker — no gradient editor, no angle sliders, no stop controls, per spec. */
export function OmbreSection({
  value,
  onChange,
  secondColor,
  onSecondColorChange,
  previewGradient,
}: OmbreSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {OMBRE_OPTIONS.map((option) => (
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

      <div
        className="h-8 w-full rounded-md border border-[var(--border)] transition-[background] duration-300 ease-out"
        style={{ background: value === "off" ? "var(--muted)" : previewGradient }}
      />

      {value === "custom" && (
        <div className="flex flex-col gap-1.5">
          <Label>Second Color</Label>
          <Input
            type="color"
            value={secondColor}
            onChange={(e) => onSecondColorChange(e.target.value)}
            className="h-10 w-14 shrink-0 p-1"
          />
        </div>
      )}
    </div>
  )
}
