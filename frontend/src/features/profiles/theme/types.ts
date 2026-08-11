import type { ThemeName } from "@/lib/theme"

/** The five profile skins. Excludes "default", which has no profile theme of its own. */
export type ProfileThemeName = Exclude<ThemeName, "default">

export interface ProfileThemeColors {
  background: string
  foreground: string
  primary: string
  secondary: string
  accent: string
  muted: string
}

export interface ProfileThemeTypography {
  fontHeading: string
  fontBody: string
  scale: "compact" | "comfortable" | "spacious"
}

export interface ProfileThemeSpacing {
  section: string
  gutter: string
}

export interface ProfileThemeRadius {
  card: string
  button: string
  avatar: string
}

export interface ProfileThemeShadows {
  card: string
  elevated: string
}

export interface ProfileThemeMotion {
  entrance: "fade" | "slide" | "scale"
  stagger: boolean
}

export interface ProfileThemeHero {
  layout: "centered" | "split" | "banner"
  avatarShape: "circle" | "rounded" | "square"
}

export interface ProfileThemeCards {
  variant: "flat" | "glass" | "elevated" | "outlined"
}

export interface ProfileThemeButtons {
  variant: "solid" | "outline" | "glass"
  shape: "pill" | "rounded" | "square"
}

/**
 * The full styling contract a profile theme must satisfy. Section components
 * read from this — never from raw CSS or hardcoded values — so a theme swap
 * is a single prop change. See docs/design-system.md for how themes plug in.
 */
export interface ProfileTheme {
  name: ProfileThemeName
  colors: ProfileThemeColors
  typography: ProfileThemeTypography
  spacing: ProfileThemeSpacing
  radius: ProfileThemeRadius
  shadows: ProfileThemeShadows
  motion: ProfileThemeMotion
  hero: ProfileThemeHero
  cards: ProfileThemeCards
  buttons: ProfileThemeButtons
}
