/**
 * Only these fonts are ever offered — never arbitrary system fonts. Two
 * substitutions from the original curated list: Satoshi and General Sans
 * are Fontshare-exclusive with no self-hostable npm package the way the
 * rest have (confirmed against the npm registry), so Modern uses Sora and
 * Executive uses Public Sans instead — both real @fontsource-variable
 * packages, same self-hosted architecture as everything else.
 */
export type CuratedFont =
  | "Cormorant Garamond"
  | "Playfair Display"
  | "Libre Baskerville"
  | "Inter"
  | "Plus Jakarta Sans"
  | "Public Sans"
  | "Sora"
  | "Manrope"
  | "DM Sans"
  | "IBM Plex Sans"
  | "Source Sans 3"
  | "Outfit"
  | "Space Grotesk"

export const CURATED_FONT_CATEGORIES: { category: string; fonts: CuratedFont[] }[] = [
  { category: "Luxury", fonts: ["Cormorant Garamond", "Playfair Display", "Libre Baskerville"] },
  { category: "Executive", fonts: ["Inter", "Plus Jakarta Sans", "Public Sans"] },
  { category: "Modern", fonts: ["Sora", "Manrope", "DM Sans"] },
  { category: "Minimal", fonts: ["Inter", "IBM Plex Sans", "Source Sans 3"] },
  { category: "Glass", fonts: ["Plus Jakarta Sans", "Outfit", "Space Grotesk"] },
]

/** Full CSS font-family stacks — same "X Variable", "X", fallback shape as the existing tokens in styles/tokens.css. */
export const CURATED_FONT_STACKS: Record<CuratedFont, string> = {
  "Cormorant Garamond": '"Cormorant Garamond Variable", "Cormorant Garamond", ui-serif, serif',
  "Playfair Display": '"Playfair Display Variable", "Playfair Display", ui-serif, serif',
  "Libre Baskerville": '"Libre Baskerville Variable", "Libre Baskerville", ui-serif, serif',
  Inter: '"Inter Variable", "Inter", system-ui, sans-serif',
  "Plus Jakarta Sans": '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", system-ui, sans-serif',
  "Public Sans": '"Public Sans Variable", "Public Sans", system-ui, sans-serif',
  Sora: '"Sora Variable", "Sora", system-ui, sans-serif',
  Manrope: '"Manrope Variable", "Manrope", system-ui, sans-serif',
  "DM Sans": '"DM Sans Variable", "DM Sans", system-ui, sans-serif',
  "IBM Plex Sans": '"IBM Plex Sans Variable", "IBM Plex Sans", system-ui, sans-serif',
  "Source Sans 3": '"Source Sans 3 Variable", "Source Sans 3", system-ui, sans-serif',
  Outfit: '"Outfit Variable", "Outfit", system-ui, sans-serif',
  "Space Grotesk": '"Space Grotesk Variable", "Space Grotesk", system-ui, sans-serif',
}

export interface CompanyTypography {
  nameFont: CuratedFont
  /** px */
  nameSize: number
  nameItalic: boolean
  companyUppercase: boolean
  /** em */
  companyLetterSpacing: number
  /** px */
  designationSize: number
  headingFont: CuratedFont
  /** px */
  headingSize: number
  /** px */
  buttonFontSize: number
  /** px */
  quickActionIconSize: number
  /** px */
  quickActionLabelSize: number
}

/** Each a full CompanyTypography — applying one is just setting these fields, not a separate persisted concept, so a later individual override never "fights" the preset. */
export const TYPOGRAPHY_PRESETS: { name: string; values: CompanyTypography }[] = [
  {
    name: "Editorial",
    values: {
      nameFont: "Playfair Display",
      nameSize: 44,
      nameItalic: true,
      companyUppercase: true,
      companyLetterSpacing: 0.15,
      designationSize: 15,
      headingFont: "Playfair Display",
      headingSize: 13,
      buttonFontSize: 16,
      quickActionIconSize: 20,
      quickActionLabelSize: 12,
    },
  },
  {
    name: "Corporate",
    values: {
      nameFont: "Public Sans",
      nameSize: 32,
      nameItalic: false,
      companyUppercase: false,
      companyLetterSpacing: 0.02,
      designationSize: 15,
      headingFont: "Inter",
      headingSize: 13,
      buttonFontSize: 15,
      quickActionIconSize: 20,
      quickActionLabelSize: 12,
    },
  },
  {
    name: "Luxury",
    values: {
      nameFont: "Cormorant Garamond",
      nameSize: 48,
      nameItalic: true,
      companyUppercase: true,
      companyLetterSpacing: 0.3,
      designationSize: 17,
      headingFont: "Playfair Display",
      headingSize: 14,
      buttonFontSize: 18,
      quickActionIconSize: 20,
      quickActionLabelSize: 13,
    },
  },
  {
    name: "Minimal",
    values: {
      nameFont: "Inter",
      nameSize: 28,
      nameItalic: false,
      companyUppercase: false,
      companyLetterSpacing: 0,
      designationSize: 13,
      headingFont: "IBM Plex Sans",
      headingSize: 11,
      buttonFontSize: 14,
      quickActionIconSize: 18,
      quickActionLabelSize: 11,
    },
  },
  {
    name: "Contemporary",
    values: {
      nameFont: "Sora",
      nameSize: 36,
      nameItalic: false,
      companyUppercase: true,
      companyLetterSpacing: 0.08,
      designationSize: 15,
      headingFont: "Space Grotesk",
      headingSize: 13,
      buttonFontSize: 16,
      quickActionIconSize: 22,
      quickActionLabelSize: 12,
    },
  },
]
