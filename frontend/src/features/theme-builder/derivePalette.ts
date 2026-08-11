export type OmbreMode = "off" | "soft" | "premium" | "sunset" | "ocean" | "custom"

export interface BrandPalette {
  /** Flat brand color — used for anything that isn't gradient-eligible (e.g. the focus ring). */
  primary: string
  /** = primary when ombre is "off", so gradient-based elements collapse to a flat look automatically. */
  gradientFrom: string
  /** Only set for "premium" (3-stop dark → brand → light). */
  gradientMid?: string
  gradientTo: string
  /** Brand at reduced alpha, for ambient glow layers. */
  glow: string
  ring: string
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min

  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: s * 100, l: l * 100 }
}

function hsl(h: number, s: number, l: number, alpha = 1): string {
  const hh = ((h % 360) + 360) % 360
  const ss = Math.min(100, Math.max(0, s))
  const ll = Math.min(100, Math.max(0, l))
  return alpha === 1
    ? `hsl(${hh.toFixed(1)}, ${ss.toFixed(1)}%, ${ll.toFixed(1)}%)`
    : `hsla(${hh.toFixed(1)}, ${ss.toFixed(1)}%, ${ll.toFixed(1)}%, ${alpha})`
}

/**
 * Derives a full palette from one brand color + an ombre mode — the whole
 * point of the v2 theme builder: one input, everything else computed. HSL
 * math throughout (not oklch) — simpler, predictable tint/shade/hue-shift
 * formulas, and `color-mix()`/gradients accept hex/hsl inputs regardless of
 * the interpolation space they declare, so nothing downstream cares.
 */
export function derivePalette(brand: string, ombre: OmbreMode, custom?: string): BrandPalette {
  const { h, s, l } = hexToHsl(brand)
  const primary = hsl(h, s, l)
  const ring = primary

  /**
   * `glow` feeds every ambient/atmosphere effect (Hero background, card
   * shadows, CTA glow) — so it needs to lean toward the ombre's second hue,
   * not just the flat brand hue, or "Ombre affects atmosphere/glow" would be
   * false for every mode but Premium. `off`/`soft`/`premium` stay hue-locked
   * to the brand color (their gradient stays within one hue too); `sunset`/
   * `ocean`/`custom` blend halfway toward their distinct second hue so the
   * glow visibly reads as sunset/ocean/custom, not just "brand-colored."
   */
  function blendedGlow(secondHue: number, secondSat: number) {
    return hsl((h + secondHue) / 2, Math.max(s, secondSat), l, 0.35)
  }

  switch (ombre) {
    case "soft":
      return { primary, gradientFrom: primary, gradientTo: hsl(h, s, l + 20), glow: hsl(h, s, l, 0.35), ring }
    case "premium":
      return {
        primary,
        gradientFrom: hsl(h, s, l - 25),
        gradientMid: primary,
        gradientTo: hsl(h, s, l + 25),
        glow: hsl(h, s, l, 0.35),
        ring,
      }
    case "sunset":
      return {
        primary,
        gradientFrom: primary,
        gradientTo: hsl(30, Math.max(s, 60), l),
        glow: blendedGlow(30, 60),
        ring,
      }
    case "ocean":
      return {
        primary,
        gradientFrom: primary,
        gradientTo: hsl(205, Math.max(s, 55), l),
        glow: blendedGlow(205, 55),
        ring,
      }
    case "custom": {
      const secondHue = custom ? hexToHsl(custom) : { h, s }
      return {
        primary,
        gradientFrom: primary,
        gradientTo: custom ?? primary,
        glow: custom ? blendedGlow(secondHue.h, secondHue.s) : hsl(h, s, l, 0.35),
        ring,
      }
    }
    case "off":
    default:
      return { primary, gradientFrom: primary, gradientTo: primary, glow: hsl(h, s, l, 0.35), ring }
  }
}
