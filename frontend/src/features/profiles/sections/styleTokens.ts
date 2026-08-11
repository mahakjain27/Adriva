import type { CSSProperties } from "react"
import type { ProfileThemeCards, ProfileThemeHero } from "../theme"

/**
 * The one surface treatment every section shares — flat/outlined/elevated/glass,
 * switched by the active theme's `cards.variant` token. Colors/blur/shadow all
 * reference existing CSS custom properties (never literal values) so Theme
 * Builder overrides and per-theme CSS scopes keep full control. `radius`
 * defaults to the shared panel radius; pass `9999px` for a circular chrome
 * (QuickActions bubbles).
 */
export function cardChromeStyle(
  cards: ProfileThemeCards,
  glow: string | undefined,
  radius = "var(--corner-radius, var(--radius-xl))",
): CSSProperties {
  const base: CSSProperties = {
    borderRadius: radius,
    transition: "background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease, border-radius 300ms ease",
  }

  switch (cards.variant) {
    case "glass":
      return {
        ...base,
        backgroundColor:
          "color-mix(in oklch, color-mix(in oklch, var(--card) 92%, var(--brand-glow, var(--card)) 8%) var(--glass-opacity, 60%), transparent)",
        border: "1px solid color-mix(in oklch, var(--border) var(--glass-border-opacity, 60%), transparent)",
        backdropFilter: "blur(var(--glass-blur, 24px)) saturate(150%)",
        WebkitBackdropFilter: "blur(var(--glass-blur, 24px)) saturate(150%)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), var(--shadow-md)${glow ? `, ${glow}` : ""}`,
      }
    case "elevated":
      return { ...base, backgroundColor: "var(--card)", border: "none", boxShadow: `var(--shadow-lg)${glow ? `, ${glow}` : ""}` }
    case "outlined":
      return { ...base, backgroundColor: "var(--card)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-xs)" }
    case "flat":
    default:
      return { ...base, backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "none" }
  }
}

/** Avatar clip shape driven by the active theme's `hero.avatarShape` token. */
export function avatarShapeClass(shape: ProfileThemeHero["avatarShape"]) {
  if (shape === "square") return "rounded-[var(--corner-radius,var(--radius-lg))]"
  if (shape === "rounded") return "rounded-[26%]"
  return "rounded-full"
}
