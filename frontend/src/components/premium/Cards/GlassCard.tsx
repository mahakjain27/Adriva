import type { HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Frosted-glass surface built entirely from tokens (`--card`, `--border`,
 * `--shadow-md`, `--radius-xl`) — never hardcoded colors. Looks like neutral
 * glass in the default theme and gold-tinted glass under `.theme-luxury`
 * automatically, because those tokens change per-theme, not this file.
 * Blur/opacity/border strength read from `--glass-*` (Theme Builder's Glass
 * preset) with fallbacks matching the original hardcoded look, so nothing
 * changes for companies that haven't customized it.
 *
 * The caller's `className` lands on this same root element (not a nested
 * wrapper) — callers like the Products carousel rely on it for their own
 * flex-item sizing (`w-40 shrink-0 snap-center`), which only works if it's
 * on the actual element the parent's flex layout sees. `GlassMaterial`'s
 * overlay layers stay visually behind the real content via a negative
 * z-index (see that component), not via DOM nesting.
 */
export function GlassCard({ children, className, style, ...props }: GlassCardProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  return (
    <div
      className={cn("relative overflow-hidden border", className)}
      style={{
        borderRadius: "var(--corner-radius, 0.75rem)",
        backgroundColor:
          "color-mix(in oklch, color-mix(in oklch, var(--card) 92%, var(--brand-glow, var(--card)) 8%) var(--glass-opacity, 60%), transparent)",
        borderColor: "color-mix(in oklch, var(--border) var(--glass-border-opacity, 60%), transparent)",
        backdropFilter: "blur(var(--glass-blur, 24px)) saturate(150%)",
        WebkitBackdropFilter: "blur(var(--glass-blur, 24px)) saturate(150%)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-md)${glow ? `, ${glow}` : ""}`,
        transition: "background-color 300ms ease, backdrop-filter 300ms ease, border-radius 300ms ease, box-shadow 300ms ease",
        ...style,
      }}
      {...props}
    >
      <GlassMaterial preset={glassPreset} />
      {children}
    </div>
  )
}
