import type { HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"
import type { ProfileThemeCards } from "../theme"
import { cardChromeStyle } from "./styleTokens"

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  cards: ProfileThemeCards
  radius?: string
  children: ReactNode
}

/** Shared surface wrapper — every section renders its card/panel/bubble chrome through this instead of re-deriving glass/elevated/outlined/flat styling per file. */
export function Panel({ cards, radius, className, style, children, ...props }: PanelProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ ...cardChromeStyle(cards, glow, radius), ...style }} {...props}>
      {cards.variant === "glass" && <GlassMaterial preset={glassPreset} />}
      {children}
    </div>
  )
}
