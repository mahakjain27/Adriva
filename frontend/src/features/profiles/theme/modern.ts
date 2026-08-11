import type { ProfileTheme } from "./types"

// Bold color, high contrast, geometric type. Colors/shadows/radius reference
// src/styles/themes/modern.css — never literal values here. See
// docs/design-system.md for how themes plug in.
export const modernTheme: ProfileTheme = {
  name: "modern",
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
    card: "var(--radius-sm)",
    button: "var(--radius-lg)",
    avatar: "var(--radius-lg)",
  },
  shadows: {
    card: "var(--shadow-md)",
    elevated: "var(--shadow-glow)",
  },
  motion: {
    entrance: "scale",
    stagger: true,
  },
  hero: {
    layout: "centered",
    avatarShape: "rounded",
  },
  cards: {
    variant: "outlined",
  },
  buttons: {
    variant: "solid",
    shape: "square",
  },
}
