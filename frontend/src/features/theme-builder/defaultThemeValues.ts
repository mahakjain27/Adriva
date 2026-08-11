import { TYPOGRAPHY_PRESETS, type CompanyTypography } from "./curatedFonts"
import type { MotionStyle } from "./deriveMotionTokens"
import type { CompanyStyle } from "./deriveStyleTokens"

/** Seed values used whenever a company has never customized a given axis (`brand`/`style`/`typography`/`motion` all `null`) — shared by the full-page Theme Builder and the inline Employee-page customizer so neither drifts from the other. */
export const DEFAULT_BRAND_COLOR = "#8b5cf6"
export const DEFAULT_SECOND_COLOR = "#3b82f6"
export const DEFAULT_STYLE: CompanyStyle = { glass: "premium", buttons: "gradient", corners: "rounded" }
export const DEFAULT_TYPOGRAPHY: CompanyTypography = TYPOGRAPHY_PRESETS.find((p) => p.name === "Corporate")!.values
export const DEFAULT_MOTION: MotionStyle = "standard"
