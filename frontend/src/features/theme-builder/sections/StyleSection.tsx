import { cn } from "@/lib/utils"
import type { ButtonStyle, CompanyStyle, CornerStyle, GlassStyle } from "../deriveStyleTokens"

export interface StyleSectionProps {
  value: CompanyStyle
  onChange: (style: CompanyStyle) => void
}

const GLASS_OPTIONS: { value: GlassStyle; label: string }[] = [
  { value: "soft", label: "Soft" },
  { value: "premium", label: "Premium" },
  { value: "frosted", label: "Frosted" },
  { value: "crystal", label: "Crystal" },
]

const BUTTON_OPTIONS: { value: ButtonStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "glass", label: "Glass" },
  { value: "outline", label: "Outline" },
]

const CORNER_OPTIONS: { value: CornerStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "soft", label: "Soft" },
  { value: "pill", label: "Pill" },
  { value: "sharp", label: "Sharp" },
]

const GLASS_DESCRIPTIONS: Record<GlassStyle, string> = {
  soft: "Low blur, matte finish, minimal border, subtle shadow.",
  premium: "Richer blur, brighter borders, layered glass, and a soft glow.",
  frosted: "High blur, white tint, a fine noise texture, and diffuse light.",
  crystal: "High transparency, a gradient border, and an animated shine.",
}

const BUTTON_DESCRIPTIONS: Record<ButtonStyle, string> = {
  solid: "A clean, flat filled button.",
  gradient: "Animated gradient with glow and light sweeps.",
  glass: "Glassmorphism with blur and a soft reflection.",
  outline: "Transparent with an animated border that fills on tap.",
}

const CORNER_DESCRIPTIONS: Record<CornerStyle, string> = {
  rounded: "Smooth and modern rounded corners.",
  soft: "Gently rounded, understated edges.",
  pill: "Fully rounded, pill-shaped edges.",
  sharp: "Crisp, precise right angles.",
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
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
  )
}

/** Four presets per group, each remapping several design tokens (and, for Glass/Buttons, real layered visual treatments — see GlassMaterial/CtaButtonExtras) at once — not thirty sliders. */
export function StyleSection({ value, onChange }: StyleSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Glass</p>
        <PillGroup
          options={GLASS_OPTIONS}
          value={value.glass}
          onChange={(glass) => onChange({ ...value, glass })}
        />
        <p className="text-xs text-muted-foreground">{GLASS_DESCRIPTIONS[value.glass]}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Buttons</p>
        <PillGroup
          options={BUTTON_OPTIONS}
          value={value.buttons}
          onChange={(buttons) => onChange({ ...value, buttons })}
        />
        <p className="text-xs text-muted-foreground">{BUTTON_DESCRIPTIONS[value.buttons]}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Corners</p>
        <PillGroup
          options={CORNER_OPTIONS}
          value={value.corners}
          onChange={(corners) => onChange({ ...value, corners })}
        />
        <p className="text-xs text-muted-foreground">{CORNER_DESCRIPTIONS[value.corners]}</p>
      </div>
    </div>
  )
}
