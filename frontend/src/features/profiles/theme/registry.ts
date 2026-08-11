import type { ThemeName } from "@/lib/theme"
import { executiveTheme } from "./executive"
import { glassTheme } from "./glass"
import { luxuryTheme } from "./luxury"
import { minimalTheme } from "./minimal"
import { modernTheme } from "./modern"
import type { ProfileTheme, ProfileThemeName } from "./types"

export const profileThemes: Record<ProfileThemeName, ProfileTheme> = {
  executive: executiveTheme,
  luxury: luxuryTheme,
  modern: modernTheme,
  minimal: minimalTheme,
  glass: glassTheme,
}

export const profileThemeNames = Object.keys(profileThemes) as ProfileThemeName[]

/** `default` has no profile theme of its own — falls back to `executive`. */
export function getProfileTheme(theme: ThemeName): ProfileTheme {
  return theme === "default" ? profileThemes.executive : profileThemes[theme]
}
