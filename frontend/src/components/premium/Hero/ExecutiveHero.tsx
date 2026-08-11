import { Download } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { ExecutiveAmbientBackground } from "@/components/premium/Background/ExecutiveAmbientBackground"
import { CTA_OUTLINE_FILL, CtaButtonExtras } from "@/components/premium/Effects/CtaButtonExtras"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"

export interface ExecutiveHeroProps {
  name: string
  title: string
  company: string
  avatarUrl?: string
  logoUrl?: string
  onSaveContact?: () => void
}

/**
 * Plain, controlled tweens throughout — no springs, no bounce, no
 * exaggerated motion. Executive should feel like the most stable of the
 * five themes, not the fastest or the softest. At the Motion control's
 * "standard" scale (1 on every axis) this reproduces the original fixed
 * values exactly.
 */
function getHeroVariants(motionStyle: MotionStyle | undefined) {
  const scale = getMotionScale(motionStyle)
  const entrance = { duration: 0.32 * scale.duration, ease: [0.4, 0, 0.2, 1] } as const

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 * scale.stagger } },
  }

  const fadeItem: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: entrance },
  }

  const cardItem: Variants = {
    hidden: { opacity: 0, y: 8 * scale.distance },
    visible: { opacity: 1, y: 0, transition: entrance },
  }

  const upItem: Variants = {
    hidden: { opacity: 0, y: 10 * scale.distance },
    visible: { opacity: 1, y: 0, transition: entrance },
  }

  const avatarItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.06 * scale.distance },
    visible: { opacity: 1, scale: 1, transition: entrance },
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
 * The most restrained of the three completed Heroes: a flat "letterhead"
 * panel (no blur unless Glass is explicitly chosen), a clean-ringed circular
 * avatar with no glow, upright Public Sans throughout (never Luxury's italic
 * serif, never Modern's geometric square avatar), and a single quiet ambient
 * wash behind it instead of a soft halo or a live shader.
 */
export function ExecutiveHero({ name, title, company, avatarUrl, logoUrl, onSaveContact }: ExecutiveHeroProps) {
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
        <ExecutiveAmbientBackground />
      </motion.div>

      <div className="relative flex w-full max-w-[390px] flex-col items-center gap-6">
        <motion.div
          variants={cardItem}
          className="relative overflow-hidden border"
          style={{
            borderRadius: "var(--corner-radius, var(--radius-lg))",
            borderColor: "var(--executive-hero-card-border)",
            background: "color-mix(in oklch, var(--card) 96%, var(--brand-glow, var(--card)) 4%)",
            backdropFilter: "blur(var(--glass-blur, 0px))",
            WebkitBackdropFilter: "blur(var(--glass-blur, 0px))",
            boxShadow: `var(--shadow-lg)${glassGlow ? `, ${glassGlow}` : ""}`,
            transition: "border-radius 300ms ease, box-shadow 300ms ease, background-color 300ms ease",
          }}
        >
          <GlassMaterial preset={glassPreset} />
          <div className="relative z-[1] flex w-full flex-col items-center gap-4 p-9 text-center">
          {logoUrl ? (
            <motion.img variants={upItem} src={logoUrl} alt={company} className="h-auto w-[160px]" />
          ) : (
            <motion.span
              variants={upItem}
              className="font-heading text-[11px] font-bold"
              style={{
                color: "var(--accent)",
                textTransform: "var(--company-transform, uppercase)",
                letterSpacing: "var(--company-letter-spacing, 0.16em)",
                transition: "letter-spacing 300ms ease",
              }}
            >
              {company}
            </motion.span>
          )}

          <motion.div
            variants={avatarItem}
            className="h-[112px] w-[112px] overflow-hidden rounded-full"
            style={{
              border: "2px solid var(--primary)",
              background: "var(--secondary)",
              transition: "border-color 300ms ease",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-heading text-[36px] font-bold text-[var(--foreground)]">
                  {initials(name)}
                </span>
              </div>
            )}
          </motion.div>

          {/* not <h1> — a global legacy `h1 { color }` rule in index.css (unlayered,
              beats Tailwind utilities) would clobber this. */}
          <motion.p
            variants={upItem}
            role="heading"
            aria-level={1}
            className="mx-auto max-w-[280px] leading-[1.1] font-extrabold tracking-[-0.01em] text-[var(--foreground)]"
            style={{
              fontFamily: "var(--font-name, var(--font-heading))",
              fontSize: "var(--name-size, 36px)",
              fontStyle: "var(--name-style, normal)",
              transition: "font-size 300ms ease",
            }}
          >
            {name}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-heading font-semibold"
            style={{
              color: "var(--muted-foreground)",
              fontSize: "var(--designation-size, 16px)",
              transition: "font-size 300ms ease",
            }}
          >
            {title}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-heading font-medium"
            style={{
              color: "var(--accent)",
              fontSize: "14px",
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
          whileHover={{ y: -1, ...outlineHover, transition: { duration: 0.15, ease: "easeOut" } }}
          whileTap={{ scale: 0.98, y: 0, ...outlineHover, transition: { duration: 0.1, ease: "easeOut" } }}
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{
            height: 58,
            borderRadius: "var(--corner-radius, var(--radius-lg))",
            background: "var(--button-bg, var(--primary))",
            color: "var(--button-text, var(--primary-foreground))",
            border: "var(--button-border, none)",
            backdropFilter: "var(--button-backdrop-filter, none)",
            boxShadow: "var(--shadow-md)",
            transition: "background 300ms ease, border-radius 300ms ease, border-color 300ms ease, color 300ms ease",
          }}
        >
          <CtaButtonExtras preset={buttonPreset} />
          <span className="relative z-[1] flex items-center gap-2">
            <Download size={19} strokeWidth={2} />
            <span
              className="font-heading font-bold"
              style={{ fontSize: "var(--button-font-size, 16px)", transition: "font-size 300ms ease" }}
            >
              Save Contact
            </span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  )
}
