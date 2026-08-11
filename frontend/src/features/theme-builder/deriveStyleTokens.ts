import type { BrandPalette } from "./derivePalette"

export type GlassStyle = "soft" | "premium" | "frosted" | "crystal"
export type ButtonStyle = "solid" | "gradient" | "glass" | "outline"
export type CornerStyle = "sharp" | "soft" | "rounded" | "pill"

export interface CompanyStyle {
  glass: GlassStyle
  buttons: ButtonStyle
  corners: CornerStyle
}

export interface StyleTokens {
  radius: string
  glassBlur: string
  /** Percentage string (e.g. "60%") — used directly as color-mix()'s percentage argument. */
  glassOpacity: string
  glassBorderOpacity: string
  buttonBackground: string
  buttonBorder: string
  buttonBackdropFilter: string
  buttonTextColor: string
}

const CORNER_RADIUS: Record<CornerStyle, string> = {
  sharp: "0.25rem",
  soft: "0.5rem",
  rounded: "0.875rem",
  pill: "9999px",
}

const GLASS_PRESETS: Record<GlassStyle, { blur: string; opacity: string; borderOpacity: string }> = {
  // Deliberately spread wide apart, not clustered near each other — the
  // whole point of this table is that each preset should be obviously
  // distinct on its numbers alone, before GlassMaterial's extra layers even
  // come into play. premium ≈ Luxury's original hardcoded look (24px blur,
  // ~60% opacity), kept as the de facto "stock" values.
  soft: { blur: "8px", opacity: "35%", borderOpacity: "18%" },
  premium: { blur: "24px", opacity: "60%", borderOpacity: "50%" },
  frosted: { blur: "42px", opacity: "82%", borderOpacity: "55%" },
  crystal: { blur: "10px", opacity: "18%", borderOpacity: "80%" },
}

/** Derives Glass/Buttons/Corners tokens from a preset choice + the current brand palette (so "Gradient" buttons pick up ombre, "Solid"/"Outline" pick up the brand color). */
export function deriveStyleTokens(style: CompanyStyle, palette: BrandPalette): StyleTokens {
  const glass = GLASS_PRESETS[style.glass]

  const buttonBackground: Record<ButtonStyle, string> = {
    solid: palette.primary,
    gradient: `linear-gradient(135deg, ${palette.gradientFrom}, ${palette.gradientMid ?? palette.gradientTo}, ${palette.gradientTo})`,
    glass: `color-mix(in oklch, ${palette.primary} 25%, transparent)`,
    outline: "transparent",
  }

  const buttonBorder: Record<ButtonStyle, string> = {
    solid: "none",
    gradient: "none",
    glass: `1px solid color-mix(in oklch, ${palette.primary} 40%, transparent)`,
    outline: `2px solid ${palette.primary}`,
  }

  const buttonBackdropFilter: Record<ButtonStyle, string> = {
    solid: "none",
    gradient: "none",
    glass: "blur(20px)",
    outline: "none",
  }

  const buttonTextColor: Record<ButtonStyle, string> = {
    solid: "var(--primary-foreground)",
    gradient: "var(--primary-foreground)",
    glass: "var(--foreground)",
    outline: palette.primary,
  }

  return {
    radius: CORNER_RADIUS[style.corners],
    glassBlur: glass.blur,
    glassOpacity: glass.opacity,
    glassBorderOpacity: glass.borderOpacity,
    buttonBackground: buttonBackground[style.buttons],
    buttonBorder: buttonBorder[style.buttons],
    buttonBackdropFilter: buttonBackdropFilter[style.buttons],
    buttonTextColor: buttonTextColor[style.buttons],
  }
}
