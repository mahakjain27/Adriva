export interface ProfileHero {
  name: string
  title: string
  company: string
  avatarUrl: string
  logoUrl: string
}

export interface ProfileQuickAction {
  id: string
  label: string
  icon: string
  href: string
}

export interface ProfileAbout {
  bio: string
}

export interface ProfileProduct {
  id: string
  name: string
  price: string
  imageUrl: string
  /** Blank when uncategorized — shown as a small badge on the product card. */
  category?: string
}

export interface ProfileLocation {
  address: string
  mapUrl: string
}

export interface ProfileWorkingHoursEntry {
  day: string
  hours: string
}

/**
 * How the platform's own branding appears on a client's profile.
 * `powered` shows the minimal "Powered by Adriva" footer; `white-label`
 * hides it entirely. The optional color/asset fields anticipate future
 * per-client branding (custom favicon, accent colors, logo variants)
 * without a schema change later.
 */
export type BrandingMode = "powered" | "white-label"

export interface ProfileBranding {
  mode: BrandingMode
  logo?: string
  favicon?: string
  backgroundColor?: string
  foregroundColor?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  mutedColor?: string
  /** Ombre gradient stops (theme-builder) — gradientFrom/To collapse to the same value when ombre is "off". */
  gradientFromColor?: string
  gradientMidColor?: string
  gradientToColor?: string
  glowColor?: string
  ringColor?: string
  /** Style presets (theme-builder) — Glass/Buttons/Corners. */
  radius?: string
  glassBlur?: string
  glassOpacity?: string
  glassBorderOpacity?: string
  buttonBackground?: string
  buttonBorder?: string
  buttonBackdropFilter?: string
  buttonTextColor?: string
  /**
   * Raw preset enums (not derived CSS values) — inline literal unions rather
   * than importing GlassStyle/ButtonStyle from theme-builder, which would
   * create a circular import (theme-builder already imports ProfileBranding
   * from here). Let leaf components branch their DOM/motion per preset;
   * undefined when `company.style` is null, exactly like every other
   * override in this system.
   */
  glassPreset?: "soft" | "premium" | "frosted" | "crystal"
  buttonPreset?: "solid" | "gradient" | "glass" | "outline"
  motionStyle?: "minimal" | "standard" | "expressive"
  /** Typography presets (theme-builder). */
  nameFontFamily?: string
  nameSize?: string
  nameFontStyle?: string
  companyTextTransform?: string
  companyLetterSpacing?: string
  designationSize?: string
  headingFontFamily?: string
  headingSize?: string
  buttonFontSize?: string
  quickActionIconSize?: string
  quickActionLabelSize?: string
}

/** The data contract every profile section renders from. */
export interface ProfileData {
  hero: ProfileHero
  quickActions: ProfileQuickAction[]
  about: ProfileAbout
  products: ProfileProduct[]
  location: ProfileLocation
  /** Optional — the section only renders when this is non-empty. */
  workingHours?: ProfileWorkingHoursEntry[]
  branding: ProfileBranding
}
