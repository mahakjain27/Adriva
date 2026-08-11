import { Download } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { AmbientBackground } from "@/components/premium/Background/AmbientBackground"
import { CTA_OUTLINE_FILL, CtaButtonExtras } from "@/components/premium/Effects/CtaButtonExtras"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"

export interface LuxuryHeroProps {
  name: string
  title: string
  company: string
  avatarUrl?: string
  logoUrl?: string
  onSaveContact?: () => void
}

/**
 * ~0.06s stagger across 8 beats + a ~0.35s spring settle each ≈ 0.7s total,
 * at the Theme Builder's Motion "standard" scale (1 on every axis — a true
 * no-op, so uncustomized companies render identically to before this
 * control existed). bounce stays 0 (critically damped) at every scale —
 * Luxury's entrance should always feel like a settle, never a pop/overshoot,
 * regardless of how much distance/duration the Motion control dials in.
 */
function getHeroVariants(motionStyle: MotionStyle | undefined) {
  const scale = getMotionScale(motionStyle)
  const spring = { type: "spring", duration: 0.35 * scale.duration, bounce: 0 } as const

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 * scale.stagger } },
  }

  const fadeItem: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: spring },
  }

  const cardItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.08 * scale.distance },
    visible: { opacity: 1, scale: 1, transition: spring },
  }

  const upItem: Variants = {
    hidden: { opacity: 0, y: 12 * scale.distance },
    visible: { opacity: 1, y: 0, transition: spring },
  }

  const avatarItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.2 * scale.distance },
    visible: { opacity: 1, scale: 1, transition: spring },
  }

  return { container, fadeItem, cardItem, upItem, avatarItem }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/**
 * Sequence: background → card → company → avatar → name → designation →
 * company (again, smaller) → CTA, ~0.7s total, springs throughout.
 * Vertically centered, capped at 390px, safe-area aware. Self-contained —
 * owns its own CTA (no children slot). Cormorant Garamond italic (`font-luxury`,
 * see styles/themes/luxury.css) is Luxury's signature name treatment.
 */
export function LuxuryHero({ name, title, company, avatarUrl, logoUrl, onSaveContact }: LuxuryHeroProps) {
  const { glassPreset, buttonPreset, motionStyle } = useBranding()
  const glassGlow = glassPreset ? GLASS_PRESET_GLOW[glassPreset] : undefined
  const outlineHover = buttonPreset === "outline" ? CTA_OUTLINE_FILL : undefined
  const { container, fadeItem, cardItem, upItem, avatarItem } = getHeroVariants(motionStyle)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: 24 }}
    >
      <motion.div variants={fadeItem} className="absolute inset-0">
        <AmbientBackground />
      </motion.div>

      <div className="relative flex w-full max-w-[390px] flex-col items-center gap-6">
        <motion.div
          variants={cardItem}
          className="relative overflow-hidden"
          style={{
            borderRadius: "var(--corner-radius, 32px)",
            background: "color-mix(in oklch, var(--background) 68%, transparent)",
            backdropFilter: "blur(var(--glass-blur, 24px))",
            WebkitBackdropFilter: "blur(var(--glass-blur, 24px))",
            border: "1px solid var(--luxury-hero-card-border)",
            boxShadow: `0 30px 80px color-mix(in oklch, var(--brand-glow, var(--luxury-hero-glow-lavender)) 60%, transparent)${glassGlow ? `, ${glassGlow}` : ""}`,
            transition: "border-radius 300ms ease, box-shadow 300ms ease",
          }}
        >
          <GlassMaterial preset={glassPreset} />
          <div className="relative z-[1] flex w-full flex-col items-center gap-4 p-9 text-center">
          {logoUrl ? (
            <motion.img variants={upItem} src={logoUrl} alt={company} className="h-auto w-[180px]" />
          ) : (
            <motion.span
              variants={upItem}
              className="font-sans text-[11px] font-semibold"
              style={{
                color: "var(--accent)",
                textTransform: "var(--company-transform, uppercase)",
                letterSpacing: "var(--company-letter-spacing, 0.45em)",
                transition: "letter-spacing 300ms ease",
              }}
            >
              {company}
            </motion.span>
          )}

          <motion.div variants={avatarItem} className="relative h-[120px] w-[120px]">
            <div
              className="absolute -inset-3 rounded-full opacity-50 blur-xl"
              style={{
                background: "radial-gradient(circle, var(--brand-glow, var(--primary)), transparent 70%)",
                transition: "background 300ms ease",
              }}
            />
            <div
              className="relative h-full w-full rounded-full p-[3px]"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-gradient-from, color-mix(in oklch, var(--primary) 60%, white)), var(--brand-gradient-mid, var(--brand-gradient-to, var(--primary))), var(--brand-gradient-to, var(--primary)))",
                transition: "background 300ms ease",
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-white shadow-[inset_0_2px_8px_rgba(30,36,51,0.12)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="font-luxury text-[42px] font-medium tracking-normal"
                      style={{ color: "var(--foreground)" }}
                    >
                      {initials(name)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* not <h1> — a global legacy `h1 { color }` rule in index.css (unlayered,
              beats Tailwind utilities) would clobber this. */}
          <motion.p
            variants={upItem}
            role="heading"
            aria-level={1}
            className="mx-auto max-w-[260px] font-semibold tracking-[-0.02em]"
            style={{
              lineHeight: 0.95,
              color: "var(--foreground)",
              fontFamily: "var(--font-name, var(--font-luxury))",
              fontSize: "var(--name-size, 48px)",
              fontStyle: "var(--name-style, italic)",
              transition: "font-size 300ms ease",
            }}
          >
            {name}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-sans font-medium"
            style={{
              color: "color-mix(in oklch, var(--foreground) 65%, transparent)",
              fontSize: "var(--designation-size, 17px)",
              transition: "font-size 300ms ease",
            }}
          >
            {title}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-sans font-medium"
            style={{
              color: "color-mix(in oklch, var(--foreground) 50%, transparent)",
              fontSize: "15px",
              textTransform: "var(--company-transform, none)",
              letterSpacing: "var(--company-letter-spacing, normal)",
              transition: "letter-spacing 300ms ease",
            }}
          >
            {company}
          </motion.p>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={onSaveContact}
          variants={upItem}
          whileHover={{ y: -3, ...outlineHover }}
          whileTap={{ scale: 0.97, ...outlineHover }}
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{
            height: 64,
            borderRadius: "var(--corner-radius, 9999px)",
            background:
              "var(--button-bg, linear-gradient(135deg, var(--brand-gradient-from, color-mix(in oklch, var(--accent) 75%, white)), var(--brand-gradient-mid, var(--brand-gradient-to, var(--accent))), var(--brand-gradient-to, var(--accent))))",
            border: "var(--button-border, none)",
            backdropFilter: "var(--button-backdrop-filter, none)",
            color: "var(--button-text, white)",
            boxShadow: "0 15px 35px color-mix(in oklch, var(--brand-glow, var(--primary)) 35%, transparent)",
            transition: "background 300ms ease, border-radius 300ms ease, border-color 300ms ease, color 300ms ease",
          }}
        >
          <CtaButtonExtras preset={buttonPreset} />
          <span className="relative z-[1] flex items-center gap-2">
            <Download size={20} strokeWidth={2} />
            <span
              className="font-sans font-semibold"
              style={{ fontSize: "var(--button-font-size, 18px)", transition: "font-size 300ms ease" }}
            >
              Save Contact
            </span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
