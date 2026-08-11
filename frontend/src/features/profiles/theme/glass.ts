import type { ProfileTheme } from "./types"

// visionOS-inspired glassmorphism — deep atmospheric canvas, layered
// translucent surfaces, dimensional depth. Colors/shadows/radius reference
// src/styles/themes/glass.css — never literal values here. See
// docs/design-system.md for how themes plug in.
export const glassTheme: ProfileTheme = {
  name: "glass",
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
    card: "var(--radius-xl)",
    button: "var(--radius-xl)",
    avatar: "9999px",
  },
  shadows: {
    card: "var(--shadow-md)",
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
    variant: "glass",
  },
  buttons: {
    variant: "glass",
    shape: "rounded",
  },
}
