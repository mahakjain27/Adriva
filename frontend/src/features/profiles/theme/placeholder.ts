import type { ProfileTheme, ProfileThemeName } from "./types"

/**
 * Neutral stand-in used by every theme until its real design pass happens.
 * Points at the base app tokens (`src/styles/tokens.css`, `src/index.css`)
 * so nothing renders broken in the meantime — it just looks unstyled.
 */
export function createPlaceholderTheme(name: ProfileThemeName): ProfileTheme {
  return {
    name,
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      accent: "var(--accent)",
      muted: "var(--muted)",
    },
    typography: {
      fontHeading: "var(--font-heading)",
      fontBody: "var(--font-sans)",
      scale: "comfortable",
    },
    spacing: {
      section: "var(--spacing-section)",
      gutter: "var(--spacing-gutter)",
    },
    radius: {
      card: "var(--radius-lg)",
      button: "var(--radius-md)",
      avatar: "9999px",
    },
    shadows: {
      card: "var(--shadow-sm)",
      elevated: "var(--shadow-lg)",
    },
    motion: {
      entrance: "fade",
      stagger: false,
    },
    hero: {
      layout: "centered",
      avatarShape: "circle",
    },
    cards: {
      variant: "flat",
    },
    buttons: {
      variant: "solid",
      shape: "rounded",
    },
  }
}
