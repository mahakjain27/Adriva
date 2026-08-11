import type { Company } from "@/features/companies/types"
import type { ProfileThemeName } from "@/features/profiles/theme"
import type { CompanyTypography } from "@/features/theme-builder/curatedFonts"
import type { MotionStyle } from "@/features/theme-builder/deriveMotionTokens"
import type { CompanyStyle } from "@/features/theme-builder/deriveStyleTokens"

/**
 * Base Themes (in `profileThemes`) define structure — layout, motion,
 * component personality. Saved Themes define configuration on top of a base
 * theme — brand color/ombre, glass/button/corner style, typography — and are
 * independent of any one `Company`. Reuses the exact same shapes `Company`
 * customization already uses, so `deriveProfileBranding` needs no changes.
 */
export interface SavedTheme {
  id: string
  name: string
  baseTheme: ProfileThemeName
  brand: Company["brand"]
  style: CompanyStyle | null
  typography: CompanyTypography | null
  motion: MotionStyle | null
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type SavedThemeInput = Pick<SavedTheme, "name" | "baseTheme" | "brand" | "style" | "typography" | "motion">
