import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { cn } from "@/lib/utils"

export type GlassSurfaceLevel = "secondary" | "tertiary"

export interface GlassmorphicCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /**
   * Glass's brief calls for a coherent surface hierarchy, not identical
   * panels everywhere — "secondary" (About/Products/Location/WorkingHours)
   * sits between the Hero's own hand-rolled "primary" panel (see
   * GlassHero.tsx) and "tertiary" (Quick Actions' small floating controls).
   * Each level scales the *same* Theme Builder Glass preset values rather
   * than using separate lookup tables, so the preset differences (Soft vs
   * Crystal etc.) still show through at every level, just calibrated to
   * that level's presence.
   */
  level?: GlassSurfaceLevel
}

const OPACITY_FALLBACK: Record<GlassSurfaceLevel, string> = {
  secondary: "46%",
  tertiary: "56%",
}
const OPACITY_SCALE: Record<GlassSurfaceLevel, number> = {
  secondary: 1,
  tertiary: 1.15,
}
const BLUR_FALLBACK: Record<GlassSurfaceLevel, string> = {
  secondary: "18px",
  tertiary: "12px",
}
const BLUR_SCALE: Record<GlassSurfaceLevel, number> = {
  secondary: 1,
  tertiary: 0.75,
}

/**
 * Glass's secondary/tertiary card language: real translucency + backdrop
 * blur by default (unlike GlassCard/ModernCard/ExecutiveCard/MinimalCard,
 * which default to flat/opaque until a Glass preset is chosen) — this
 * theme's whole identity is glass, so it shouldn't need an explicit preset
 * pick to look like one. A permanent, subtle top-edge highlight (independent
 * of `GlassMaterial`'s preset-specific overlays) keeps even the deliberately
 * bare "Soft" preset reading as "understated glass," not "no glass."
 *
 * The caller's `className` lands on this same root element (not a nested
 * wrapper) — see GlassCard for why: callers like the Products carousel need
 * their flex-item sizing classes on the actual element the parent's flex
 * layout sees.
 */
export function GlassmorphicCard({
  children,
  className,
  style,
  level = "secondary",
  ...props
}: GlassmorphicCardProps) {
  const { glassPreset } = useBranding()
  const glow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined

  const surfaceStyle: CSSProperties = {
    borderRadius: "var(--corner-radius, var(--radius-xl))",
    borderColor: "var(--glass-card-border)",
    // Brand tint (10%) is stronger than the other themes' cards — "glass
    // tint" driven hard by Brand Color is an explicit requirement here.
    backgroundColor: `color-mix(in oklch, color-mix(in oklch, var(--card) 90%, var(--brand-glow, var(--card)) 10%) calc(var(--glass-opacity, ${OPACITY_FALLBACK[level]}) * ${OPACITY_SCALE[level]}), transparent)`,
    backdropFilter: `blur(calc(var(--glass-blur, ${BLUR_FALLBACK[level]}) * ${BLUR_SCALE[level]}))`,
    WebkitBackdropFilter: `blur(calc(var(--glass-blur, ${BLUR_FALLBACK[level]}) * ${BLUR_SCALE[level]}))`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), var(--shadow-md)${glow ? `, ${glow}` : ""}`,
    transition:
      "background-color 300ms ease, backdrop-filter 300ms ease, border-radius 300ms ease, box-shadow 300ms ease",
    ...style,
  }

  return (
    <div className={cn("relative overflow-hidden border", className)} style={surfaceStyle} {...props}>
      <GlassMaterial preset={glassPreset} />
      {children}
    </div>
  )
}
