import type { ProfileThemeName } from "@/features/profiles/theme"
import type { BrandingMode } from "@/features/profiles/types"
import type { OmbreMode } from "@/features/theme-builder/derivePalette"
import type { CompanyStyle } from "@/features/theme-builder/deriveStyleTokens"
import type { MotionStyle } from "@/features/theme-builder/deriveMotionTokens"
import type { CompanyTypography } from "@/features/theme-builder/curatedFonts"

export interface CompanyBrandColors {
  primary: string
  secondary: string
  accent: string
}

export interface CompanySocialLinks {
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
}

export interface Company {
  id: string
  slug: string
  name: string
  /** Relative path to the uploaded logo (a `blob:` URL until a real backend exists) — never a pasted external URL. */
  logoPath: string
  website: string
  about: string
  address: string
  brandColors: CompanyBrandColors
  socialLinks: CompanySocialLinks
  /** Theme new employees at this company default to; can still be overridden per-employee. */
  defaultTheme: ProfileThemeName
  /** Powered-by-Adriva vs white-label — applies to every employee profile at this company. */
  brandingMode: BrandingMode
  /**
   * The Theme Builder's one input: a single brand color + an ombre mode,
   * from which the full palette (gradient stops, glow, ring — see
   * features/theme-builder/derivePalette.ts) is derived on every render, not
   * stored. `null` = uncustomized, theme's own stock colors. Deliberately
   * separate from `brandColors` above: that field always has a value
   * (defaulted at creation) and is purely decorative (Overview tab
   * swatches); reusing it to drive rendering would silently override every
   * theme's own designed palette for every company, even ones nobody
   * customized.
   */
  brand: { color: string; ombre: OmbreMode; secondColor?: string } | null
  /** Glass/Buttons/Corners presets — independent of `brand` (color and style are separate knobs). `null` = theme's own stock look. */
  style: CompanyStyle | null
  /** Fonts/sizes/spacing — independent of `brand`/`style`. `null` = theme's own stock typography. */
  typography: CompanyTypography | null
  /** Motion intensity — independent of `brand`/`style`/`typography`. `null` = theme's own stock motion timing. */
  motion: MotionStyle | null
  createdAt: string
}

export type CompanyInput = Omit<Company, "id" | "slug" | "createdAt">
