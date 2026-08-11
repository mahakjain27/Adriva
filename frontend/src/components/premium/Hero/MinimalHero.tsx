import { Download } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { MinimalAmbientBackground } from "@/components/premium/Background/MinimalAmbientBackground"
import { CTA_OUTLINE_FILL, CtaButtonExtras } from "@/components/premium/Effects/CtaButtonExtras"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"

export interface MinimalHeroProps {
  name: string
  title: string
  company: string
  avatarUrl?: string
  logoUrl?: string
  onSaveContact?: () => void
}

/**
 * Plain, quiet tweens — no springs, no bounce. Minimal's motion brief is the
 * most restrained of any completed theme: opacity + a few px of translate.
 * At the Motion control's "standard" scale (1 on every axis) this
 * reproduces the original fixed values exactly.
 */
function getHeroVariants(motionStyle: MotionStyle | undefined) {
  const scale = getMotionScale(motionStyle)
  const entrance = { duration: 0.35 * scale.duration, ease: [0.4, 0, 0.2, 1] } as const

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 * scale.stagger } },
  }

  const upItem: Variants = {
    hidden: { opacity: 0, y: 8 * scale.distance },
    visible: { opacity: 1, y: 0, transition: entrance },
  }

  return { container, upItem }
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
 * Deliberately chromeless — no bordered/blurred panel at all, unlike every
 * other completed theme's Hero. That's the point: Minimal's brief says the
 * premium feeling must come from typography/spacing/alignment, not surface
 * treatment, so this Hero is content sitting directly on a near-flat
 * background. Left-aligned (every other theme centers its Hero) so it reads
 * as an editorial intro column, not a repeat of the "card in the middle"
 * pattern. The employee name is sized to carry the hierarchy on its own.
 */
export function MinimalHero({ name, title, company, avatarUrl, logoUrl, onSaveContact }: MinimalHeroProps) {
  const { buttonPreset, motionStyle } = useBranding()
  const outlineHover = buttonPreset === "outline" ? CTA_OUTLINE_FILL : undefined
  const { container, upItem } = getHeroVariants(motionStyle)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-8"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: 24 }}
    >
      <motion.div variants={upItem} className="absolute inset-0">
        <MinimalAmbientBackground />
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-[390px] flex-col items-start gap-7">
        <motion.div
          variants={upItem}
          className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-full"
          style={{ border: "1.5px solid var(--primary)", background: "var(--secondary)" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : logoUrl ? (
            <img src={logoUrl} alt={company} className="h-full w-full object-contain p-3" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-[26px] font-semibold text-[var(--foreground)]">
                {initials(name)}
              </span>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col items-start gap-2">
          <motion.span
            variants={upItem}
            className="font-heading text-[11px] font-semibold"
            style={{
              color: "var(--accent)",
              textTransform: "var(--company-transform, uppercase)",
              letterSpacing: "var(--company-letter-spacing, 0.1em)",
              transition: "letter-spacing 300ms ease",
            }}
          >
            {company}
          </motion.span>

          {/* not <h1> — a global legacy `h1 { color }` rule in index.css (unlayered,
              beats Tailwind utilities) would clobber this. */}
          <motion.p
            variants={upItem}
            role="heading"
            aria-level={1}
            className="max-w-[320px] leading-[1.08] font-semibold tracking-[-0.015em] text-[var(--foreground)]"
            style={{
              fontFamily: "var(--font-name, var(--font-heading))",
              fontSize: "var(--name-size, 42px)",
              fontStyle: "var(--name-style, normal)",
              transition: "font-size 300ms ease",
            }}
          >
            {name}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-heading font-normal"
            style={{
              color: "var(--muted-foreground)",
              fontSize: "var(--designation-size, 16px)",
              transition: "font-size 300ms ease",
            }}
          >
            {title}
          </motion.p>
        </div>

        <motion.button
          type="button"
          onClick={onSaveContact}
          variants={upItem}
          whileHover={{ opacity: 0.88, transition: { duration: 0.15, ease: "easeOut" } }}
          whileTap={{ scale: 0.99, ...outlineHover, transition: { duration: 0.1, ease: "easeOut" } }}
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{
            height: 54,
            borderRadius: "var(--corner-radius, var(--radius-lg))",
            background: "var(--button-bg, var(--primary))",
            color: "var(--button-text, var(--primary-foreground))",
            border: "var(--button-border, none)",
            backdropFilter: "var(--button-backdrop-filter, none)",
            boxShadow: "var(--shadow-sm)",
            transition: "background 300ms ease, border-radius 300ms ease, border-color 300ms ease, color 300ms ease",
          }}
        >
          <CtaButtonExtras preset={buttonPreset} />
          <span className="relative z-[1] flex items-center gap-2">
            <Download size={17} strokeWidth={2} />
            <span
              className="font-heading font-medium"
              style={{ fontSize: "var(--button-font-size, 15px)", transition: "font-size 300ms ease" }}
            >
              Save Contact
            </span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
