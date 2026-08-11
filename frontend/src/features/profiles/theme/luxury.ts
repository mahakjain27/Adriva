import type { ProfileTheme } from "./types"

// Apple elegance, Rolls-Royce sophistication, Aman Resorts minimalism.
// Colors/shadows/radius reference src/styles/themes/luxury.css — never
// literal values here. See docs/design-system.md for how themes plug in.
export const luxuryTheme: ProfileTheme = {
  name: "luxury",
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
    button: "var(--radius-2xl)",
    avatar: "9999px",
  },
  shadows: {
    card: "var(--shadow-md)",
    elevated: "var(--shadow-glow)",
  },
  motion: {
    entrance: "slide",
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
    variant: "solid",
    shape: "pill",
  },
}
