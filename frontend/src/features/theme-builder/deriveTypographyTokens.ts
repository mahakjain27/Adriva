import { CURATED_FONT_STACKS, type CompanyTypography } from "./curatedFonts"

export interface TypographyTokens {
  nameFontFamily: string
  nameSize: string
  nameFontStyle: "italic" | "normal"
  companyTextTransform: "uppercase" | "none"
  companyLetterSpacing: string
  designationSize: string
  headingFontFamily: string
  headingSize: string
  buttonFontSize: string
  quickActionIconSize: string
  quickActionLabelSize: string
}

/** Turns the curated font names + numeric sizes the UI works with into ready-to-use CSS values. */
export function deriveTypographyTokens(typography: CompanyTypography): TypographyTokens {
  return {
    nameFontFamily: CURATED_FONT_STACKS[typography.nameFont],
    nameSize: `${typography.nameSize}px`,
    nameFontStyle: typography.nameItalic ? "italic" : "normal",
    companyTextTransform: typography.companyUppercase ? "uppercase" : "none",
    companyLetterSpacing: `${typography.companyLetterSpacing}em`,
    designationSize: `${typography.designationSize}px`,
    headingFontFamily: CURATED_FONT_STACKS[typography.headingFont],
    headingSize: `${typography.headingSize}px`,
    buttonFontSize: `${typography.buttonFontSize}px`,
    quickActionIconSize: `${typography.quickActionIconSize}px`,
    quickActionLabelSize: `${typography.quickActionLabelSize}px`,
  }
}
