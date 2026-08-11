import { createContext, useContext, type ReactNode } from "react"
import type { ProfileBranding } from "./types"

const DEFAULT_BRANDING: ProfileBranding = { mode: "powered" }

const BrandingContext = createContext<ProfileBranding>(DEFAULT_BRANDING)

/**
 * Lets leaf render components (GlassCard, Hero panels, CTA buttons,
 * QuickActions bubbles) read the raw preset enums (`glassPreset`,
 * `buttonPreset`, `motionStyle`) directly, without prop-drilling through the
 * Hero/QuickActions/Products/Location dispatcher components — those only
 * ever pass `data`/`theme`. The existing CSS-custom-property mechanism in
 * ProfileLayout still carries colors/sizes; this is only for
 * structural/motion branching that a CSS var value alone can't express —
 * `motionStyle` in particular has to travel this way rather than as a CSS
 * var, since Framer Motion's JS-driven transitions can't read `var()`.
 * Falls back to a minimal default if ever rendered outside ProfileLayout.
 */
export function useBranding() {
  return useContext(BrandingContext)
}

export function BrandingProvider({ branding, children }: { branding: ProfileBranding; children: ReactNode }) {
  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
}
