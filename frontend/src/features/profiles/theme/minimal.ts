import type { ProfileTheme } from "./types"

// Maximum whitespace, quiet monochrome, one sparing accent. Colors/shadows/
// radius reference src/styles/themes/minimal.css — never literal values
// here. See docs/design-system.md for how themes plug in.
export const minimalTheme: ProfileTheme = {
  name: "minimal",
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
    scale: "spacious",
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
    card: "var(--shadow-xs)",
    elevated: "var(--shadow-glow)",
  },
  motion: {
    entrance: "fade",
    stagger: true,
  },
  hero: {
    layout: "split",
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
