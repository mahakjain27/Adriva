import type { CSSProperties, ReactNode } from "react"
import { PoweredByFooter } from "@/components/common"
import { themeRegistry } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { BrandingProvider } from "./BrandingContext"
import type { ProfileTheme } from "./theme"
import type { ProfileBranding } from "./types"

export interface ProfileLayoutProps {
  theme: ProfileTheme
  branding: ProfileBranding
  children: ReactNode
  /** Company logo — renders a faint, viewport-pinned background watermark when present. Never touches theme files; see WatermarkLayer below. */
  logoUrl?: string
}

const OVERRIDE_VARS: Record<string, keyof ProfileBranding> = {
  "--background": "backgroundColor",
  "--foreground": "foregroundColor",
  "--primary": "primaryColor",
  "--secondary": "secondaryColor",
  "--accent": "accentColor",
  "--muted": "mutedColor",
  "--brand-gradient-from": "gradientFromColor",
  "--brand-gradient-mid": "gradientMidColor",
  "--brand-gradient-to": "gradientToColor",
  "--brand-glow": "glowColor",
  "--ring": "ringColor",
  // A dedicated var, not "--radius" itself — every theme's own CSS class
  // already defines --radius unconditionally, which would make var(--radius,
  // fallback) always resolve to the theme's value and never fall back,
  // masking "uncustomized" vs. "Corners preset chosen" at each consumer.
  "--corner-radius": "radius",
  "--glass-blur": "glassBlur",
  "--glass-opacity": "glassOpacity",
  "--glass-border-opacity": "glassBorderOpacity",
  "--button-bg": "buttonBackground",
  "--button-border": "buttonBorder",
  "--button-backdrop-filter": "buttonBackdropFilter",
  "--button-text": "buttonTextColor",
  "--font-name": "nameFontFamily",
  "--name-size": "nameSize",
  "--name-style": "nameFontStyle",
  "--company-transform": "companyTextTransform",
  "--company-letter-spacing": "companyLetterSpacing",
  "--designation-size": "designationSize",
  "--font-heading": "headingFontFamily",
  "--heading-size": "headingSize",
  "--button-font-size": "buttonFontSize",
  "--quick-action-icon-size": "quickActionIconSize",
  "--quick-action-label-size": "quickActionLabelSize",
}

/** Per-company color overrides (Themes gallery's "Customize" flow) as inline custom properties — these must live on the same element as the theme's own class to win the cascade; an ancestor's value would lose to the class's declaration via inheritance rules. */
function colorOverrideStyle(branding: ProfileBranding): CSSProperties {
  const style: Record<string, string> = {}
  for (const [cssVar, brandingKey] of Object.entries(OVERRIDE_VARS)) {
    const value = branding[brandingKey]
    if (value) style[cssVar] = value
  }
  return style as CSSProperties
}

/**
 * A faint, oversized, off-center brand mark pinned to the viewport (not the
 * scrolling profile column) — deliberately at the ProfileLayout level, not
 * inside any theme file, per the "themes are locked" instruction. `fixed`
 * positioning is what makes this work without touching a single themed
 * section: every Hero/SectionShell paints its own fully opaque background,
 * so a watermark placed *behind* the profile column in normal document flow
 * would be invisible everywhere content exists. Pinned to the viewport
 * instead, it naturally shows in the margins around the narrow profile
 * card on wider screens and is almost entirely covered by the card itself
 * on a phone-width viewport — which is exactly the desired
 * desktop-more-visible / mobile-very-subtle behavior, achieved for free
 * rather than fought for with z-index tricks. Rotated and offset to a
 * corner (not centered) so it never reads as a second, competing copy of
 * the Hero's own crisp logo.
 *
 * Visibility comes from two independent, non-color-altering layers, neither
 * of which relies on the other:
 * 1. A soft `--foreground`-tinted backing glow (an existing theme token —
 *    already tuned for contrast against `--background` in every theme,
 *    light or dark) sitting behind the logo, giving it a floor of contrast
 *    no matter what's technically behind the fixed layer.
 * 2. The logo image itself at low-but-real plain opacity — never filtered
 *    (no grayscale/hue-rotate/invert), so its actual colors stay intact.
 * `mix-blend-mode: overlay` is layered on top of both as a refinement, not
 * a requirement — remove it and the watermark is still visible, just
 * slightly flatter.
 */
function WatermarkLayer({ logoUrl }: { logoUrl?: string }) {
  if (!logoUrl) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -right-[18%] -bottom-[12%] -z-10 h-[55vh] w-[55vh] -rotate-12"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, var(--foreground) 0%, transparent 70%)", opacity: 0.05 }}
      />
      <img
        src={logoUrl}
        alt=""
        className="relative h-full w-full object-contain opacity-[0.06] mix-blend-overlay sm:opacity-[0.08] lg:opacity-[0.1]"
      />
    </div>
  )
}

/**
 * Structural shell every profile renders inside — mobile-first single
 * column, capped at a phone-width viewport. Applies the theme's own CSS
 * class (e.g. `theme-luxury`) directly to this wrapper rather than relying
 * on the app-wide ThemeProvider, so multiple differently-themed previews
 * (Themes gallery, per-company theme picker, employee live preview) can
 * render correctly side by side instead of sharing one global theme.
 */
export function ProfileLayout({ theme, branding, children, logoUrl }: ProfileLayoutProps) {
  return (
    <div
      data-profile-theme={theme.name}
      className={cn(
        "mx-auto flex w-full max-w-[430px] flex-col",
        themeRegistry[theme.name].className,
      )}
      style={colorOverrideStyle(branding)}
    >
      <WatermarkLayer logoUrl={logoUrl} />
      <BrandingProvider branding={branding}>{children}</BrandingProvider>
      <PoweredByFooter mode={branding.mode} />
    </div>
  )
}
