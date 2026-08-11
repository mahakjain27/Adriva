import type { HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"

export interface MinimalCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Minimal's card language: a hairline border, near-flat fill, near-invisible
 * shadow — the quietest of the four card components. Fallbacks for
 * `--glass-opacity`/`--glass-blur` (100%/0px) keep it fully flat/opaque
 * unless a company explicitly picks a Glass preset, same as
 * ExecutiveCard/ModernCard — Minimal doesn't get blur forced onto it.
 *
 * The caller's `className` lands on this same root element (not a nested
 * wrapper) — see GlassCard for why: callers like the Products carousel need
 * their flex-item sizing classes on the actual element the parent's flex
 * layout sees.
 */
export function MinimalCard({ children, className, style, ...props }: MinimalCardProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  return (
    <div
      className={cn("relative overflow-hidden border", className)}
      style={{
        borderRadius: "var(--corner-radius, var(--radius-lg))",
        borderColor: "var(--minimal-card-border)",
        // The lightest brand tint of any theme (4%) — Minimal's brief is
        // explicit that Brand Color should feel sparing, not pervasive.
        backgroundColor:
          "color-mix(in oklch, color-mix(in oklch, var(--card) 96%, var(--brand-glow, var(--card)) 4%) var(--glass-opacity, 100%), transparent)",
        backdropFilter: "blur(var(--glass-blur, 0px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 0px))",
        boxShadow: glow ?? "var(--shadow-xs)",
        transition:
          "background-color 300ms ease, backdrop-filter 300ms ease, border-radius 300ms ease, box-shadow 300ms ease",
        ...style,
      }}
      {...props}
    >
      <GlassMaterial preset={glassPreset} />
      {children}
    </div>
  )
}
