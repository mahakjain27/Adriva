import type { ThemeDefinition, ThemeName } from "./types"

/**
 * Single source of truth for every theme Adriva can render.
 * Adding a theme: create `src/styles/themes/<name>.css` scoped under `.theme-<name>`,
 * import it in `src/index.css`, then flip `status` to "available" here.
 * See docs/design-system.md for the full walkthrough.
 */
export const themeRegistry: Record<ThemeName, ThemeDefinition> = {
  default: {
    name: "default",
    label: "Default",
    description: "The neutral shadcn/ui base theme. Used until a themed profile is selected.",
    className: "",
    status: "available",
  },
  executive: {
    name: "executive",
    label: "Executive",
    description: "Sharp and confident. Deep neutrals with a single restrained accent.",
    className: "theme-executive",
    status: "available",
  },
  luxury: {
    name: "luxury",
    label: "Luxury",
    description: "Gold accents, rich darks, glass surfaces.",
    className: "theme-luxury",
    status: "available",
  },
  modern: {
    name: "modern",
    label: "Modern",
    description: "Bold color, high contrast, geometric type.",
    className: "theme-modern",
    status: "available",
  },
  minimal: {
    name: "minimal",
    label: "Minimal",
    description: "Maximum whitespace, monochrome, quiet.",
    className: "theme-minimal",
    status: "available",
  },
  glass: {
    name: "glass",
    label: "Glass",
    description: "Translucent surfaces, blur, light refraction.",
    className: "theme-glass",
    status: "available",
  },
}

export const defaultTheme: ThemeName = "default"

export const availableThemes = Object.values(themeRegistry).filter(
  (theme) => theme.status === "available",
)
