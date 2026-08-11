import type { Company } from "@/features/companies/types"
import type { ProfileBranding } from "@/features/profiles/types"
import { derivePalette, type BrandPalette } from "./derivePalette"
import { deriveStyleTokens } from "./deriveStyleTokens"
import { deriveTypographyTokens } from "./deriveTypographyTokens"

/**
 * Used for style-token derivation when `style` is customized but `brand`
 * isn't — button fills etc. reference the theme's own stock CSS vars
 * (`var(--primary)`) rather than a resolved literal, so they still follow
 * whichever base theme is active instead of freezing to some placeholder color.
 */
const STOCK_PALETTE: BrandPalette = {
  primary: "var(--primary)",
  gradientFrom: "var(--primary)",
  gradientTo: "var(--accent)",
  glow: "var(--primary)",
  ring: "var(--primary)",
}

/**
 * The single source of truth for turning a company's brand + style recipe
 * into what ProfileLayout actually renders — called both by real rendering
 * (employeeToProfileData) and the Theme Builder's own live preview, so the
 * builder is never a separate rendering path from production. `brand`
 * (color/ombre) and `style` (glass/buttons/corners) are independent —
 * either, both, or neither may be customized. Same for `typography`.
 */
export function deriveProfileBranding(
  company: Pick<Company, "brand" | "brandingMode" | "style" | "typography" | "motion">,
): ProfileBranding {
  const branding: ProfileBranding = { mode: company.brandingMode }

  const palette = company.brand
    ? derivePalette(company.brand.color, company.brand.ombre, company.brand.secondColor)
    : null

  if (palette) {
    branding.primaryColor = palette.primary
    branding.accentColor = palette.primary
    branding.gradientFromColor = palette.gradientFrom
    branding.gradientMidColor = palette.gradientMid
    branding.gradientToColor = palette.gradientTo
    branding.glowColor = palette.glow
    branding.ringColor = palette.ring
  }

  if (company.style) {
    const tokens = deriveStyleTokens(company.style, palette ?? STOCK_PALETTE)
    branding.radius = tokens.radius
    branding.glassBlur = tokens.glassBlur
    branding.glassOpacity = tokens.glassOpacity
    branding.glassBorderOpacity = tokens.glassBorderOpacity
    branding.buttonBackground = tokens.buttonBackground
    branding.buttonBorder = tokens.buttonBorder
    branding.buttonBackdropFilter = tokens.buttonBackdropFilter
    branding.buttonTextColor = tokens.buttonTextColor
    branding.glassPreset = company.style.glass
    branding.buttonPreset = company.style.buttons
  }

  if (company.typography) {
    const tokens = deriveTypographyTokens(company.typography)
    branding.nameFontFamily = tokens.nameFontFamily
    branding.nameSize = tokens.nameSize
    branding.nameFontStyle = tokens.nameFontStyle
    branding.companyTextTransform = tokens.companyTextTransform
    branding.companyLetterSpacing = tokens.companyLetterSpacing
    branding.designationSize = tokens.designationSize
    branding.headingFontFamily = tokens.headingFontFamily
    branding.headingSize = tokens.headingSize
    branding.buttonFontSize = tokens.buttonFontSize
    branding.quickActionIconSize = tokens.quickActionIconSize
    branding.quickActionLabelSize = tokens.quickActionLabelSize
  }

  if (company.motion) {
    branding.motionStyle = company.motion
  }

  return branding
}
