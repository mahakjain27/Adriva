import type { ProfileTheme } from "./types"

// Crisp corporate letterhead — neutral grays, one restrained accent, flat
// controlled shadows. Colors/shadows/radius reference
// src/styles/themes/executive.css — never literal values here. See
// docs/design-system.md for how themes plug in.
export const executiveTheme: ProfileTheme = {
  name: "executive",
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
    button: "var(--radius-lg)",
    avatar: "9999px",
  },
  shadows: {
    card: "var(--shadow-sm)",
    elevated: "var(--shadow-glow)",
  },
  motion: {
    entrance: "fade",
    stagger: true,
  },
  hero: {
    layout: "centered",
    avatarShape: "circle",
  },
  cards: {
    variant: "outlined",
  },
  buttons: {
    variant: "solid",
    shape: "rounded",
  },
}
