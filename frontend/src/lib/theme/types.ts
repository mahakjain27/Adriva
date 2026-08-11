export type ThemeName = "default" | "executive" | "luxury" | "modern" | "minimal" | "glass"

export interface ThemeDefinition {
  name: ThemeName
  label: string
  description: string
  /** CSS class applied to the theme scope; empty string for the default (untheme) look. */
  className: string
  status: "available" | "planned"
}
