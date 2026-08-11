import type { HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"

export interface ExecutiveCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Executive's card language: flat "premium paper," a restrained 1px border —
 * more composed than ModernCard's bold 2px, without GlassCard's blur-by-
 * default softness. Fallbacks for `--glass-opacity`/`--glass-blur` (100%/0px)
 * keep it fully flat/opaque unless a company explicitly picks a Glass preset
 * — Executive stays "professional" by default, per the design brief's
 * repeated instruction not to let Glass presets turn it into the Glass theme.
 *
 * The caller's `className` lands on this same root element (not a nested
 * wrapper) — see GlassCard for why: callers like the Products carousel need
 * their flex-item sizing classes on the actual element the parent's flex
 * layout sees.
 */
export function ExecutiveCard({ children, className, style, ...props }: ExecutiveCardProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  return (
    <div
      className={cn("relative overflow-hidden border", className)}
      style={{
        borderRadius: "var(--corner-radius, var(--radius-lg))",
        borderColor: "var(--executive-card-border)",
        // A restrained brand tint (half of Luxury/Modern's 8%) — Executive
        // stays visibly neutral, with just enough warmth to read as brand-aware.
        backgroundColor:
          "color-mix(in oklch, color-mix(in oklch, var(--card) 95%, var(--brand-glow, var(--card)) 5%) var(--glass-opacity, 100%), transparent)",
        backdropFilter: "blur(var(--glass-blur, 0px))",
        WebkitBackdropFilter: "blur(var(--glass-blur, 0px))",
        boxShadow: glow ?? "var(--shadow-sm)",
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
