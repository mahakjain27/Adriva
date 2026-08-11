import type { HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"

export interface ModernCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Modern's card language: flat, sharp-cornered, a bold 2px border — the
 * opposite instinct from GlassCard's soft blur, by default. Fallbacks for
 * `--glass-opacity`/`--glass-blur` (100%/0px) keep it fully flat/opaque
 * unless a company explicitly picks a Glass preset in the Theme Builder —
 * Modern doesn't get blur forced onto it, but can optionally take it on.
 *
 * The caller's `className` lands on this same root element (not a nested
 * wrapper) — see GlassCard for why: callers like the Products carousel need
 * their flex-item sizing classes on the actual element the parent's flex
 * layout sees.
 */
export function ModernCard({ children, className, style, ...props }: ModernCardProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  return (
    <div
      className={cn("relative overflow-hidden border-2", className)}
      style={{
        borderRadius: "var(--corner-radius, var(--radius-sm))",
        borderColor: "var(--modern-card-border)",
        backgroundColor:
          "color-mix(in oklch, color-mix(in oklch, var(--card) 92%, var(--brand-glow, var(--card)) 8%) var(--glass-opacity, 100%), transparent)",
        backdropFilter: "blur(var(--glass-blur, 0px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 0px))",
        boxShadow: glow ?? "none",
        transition:
          "background-color 300ms ease, backdrop-filter 300ms ease, border-radius 300ms ease, box-shadow 300ms ease, border-color 300ms ease",
        ...style,
      }}
      {...props}
    >
      <GlassMaterial preset={glassPreset} />
      {children}
    </div>
  )
}
