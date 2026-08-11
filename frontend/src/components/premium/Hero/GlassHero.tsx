import { Download } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { GlassAmbientBackground } from "@/components/premium/Background/GlassAmbientBackground"
import { CTA_OUTLINE_FILL, CtaButtonExtras } from "@/components/premium/Effects/CtaButtonExtras"
import { GLASS_PRESET_GLOW, GlassMaterial } from "@/components/premium/Effects/GlassMaterial"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"

export interface GlassHeroProps {
  name: string
  title: string
  company: string
  avatarUrl?: string
  logoUrl?: string
  onSaveContact?: () => void
}

/**
 * Fluid but controlled — no springs/bounce, per the brief. A touch slower
 * than Executive's for a moodier, more "settling into place" feel that
 * suits a dimensional glass surface. At the Motion control's "standard"
 * scale (1 on every axis) this reproduces the original fixed values exactly.
 */
function getHeroVariants(motionStyle: MotionStyle | undefined) {
  const scale = getMotionScale(motionStyle)
  const entrance = { duration: 0.4 * scale.duration, ease: [0.4, 0, 0.2, 1] } as const

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 * scale.stagger } },
  }

  const fadeItem: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: entrance },
  }

  const cardItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.03 * scale.distance },
    visible: { opacity: 1, scale: 1, transition: entrance },
  }

  const upItem: Variants = {
    hidden: { opacity: 0, y: 10 * scale.distance },
    visible: { opacity: 1, y: 0, transition: entrance },
  }

  const avatarItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.12 * scale.distance },
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
 * The theme's centerpiece and primary glass surface — the most transparent,
 * most blurred, most prominently bordered/shadowed panel in the theme (see
 * GlassmorphicCard for the secondary/tertiary levels below it). The avatar
 * gets the one genuinely dimensional treatment in the theme: a brand/ombre
 * gradient ring + soft outer glow, explicitly permitted by the brief
 * ("unlike Modern, Glass is allowed a more dimensional ring") — but it's the
 * only place that happens, so the theme reads as "glass," not "Luxury with
 * transparency."
 */
export function GlassHero({ name, title, company, avatarUrl, logoUrl, onSaveContact }: GlassHeroProps) {
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
        <GlassAmbientBackground />
      </motion.div>

      <div className="relative flex w-full max-w-[390px] flex-col items-center gap-6">
        <motion.div
          variants={cardItem}
          className="relative overflow-hidden border"
          style={{
            borderRadius: "var(--corner-radius, var(--radius-2xl))",
            borderColor: "var(--glass-hero-card-border)",
            background:
              "color-mix(in oklch, color-mix(in oklch, var(--card) 88%, var(--brand-glow, var(--card)) 12%) calc(var(--glass-opacity, 34%) * 0.85), transparent)",
            backdropFilter: "blur(calc(var(--glass-blur, 26px) * 1.15))",
            WebkitBackdropFilter: "blur(calc(var(--glass-blur, 26px) * 1.15))",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), var(--shadow-xl)${glassGlow ? `, ${glassGlow}` : ""}`,
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
              className="font-heading text-[11px] font-semibold"
              style={{
                color: "var(--accent)",
                textTransform: "var(--company-transform, uppercase)",
                letterSpacing: "var(--company-letter-spacing, 0.14em)",
                transition: "letter-spacing 300ms ease",
              }}
            >
              {company}
            </motion.span>
          )}

          <motion.div variants={avatarItem} className="relative h-[116px] w-[116px]">
            <div
              className="absolute -inset-3 rounded-full opacity-60 blur-xl"
              style={{
                background: "radial-gradient(circle, var(--brand-glow, var(--primary)), transparent 70%)",
                transition: "background 300ms ease",
              }}
            />
            <div
              className="relative h-full w-full rounded-full p-[2.5px]"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-gradient-from, var(--primary)), var(--brand-gradient-mid, var(--brand-gradient-to, var(--accent))), var(--brand-gradient-to, var(--accent)))",
                transition: "background 300ms ease",
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-[var(--card)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-heading text-[38px] font-semibold text-[var(--foreground)]">
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
            className="mx-auto max-w-[280px] leading-[1.08] font-semibold tracking-[-0.015em] text-[var(--foreground)]"
            style={{
              fontFamily: "var(--font-name, var(--font-heading))",
              fontSize: "var(--name-size, 40px)",
              fontStyle: "var(--name-style, normal)",
              transition: "font-size 300ms ease",
            }}
          >
            {name}
          </motion.p>

          <motion.p
            variants={upItem}
            className="font-heading font-medium"
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
          whileHover={{ y: -2, ...outlineHover, transition: { duration: 0.18, ease: "easeOut" } }}
          whileTap={{ scale: 0.98, y: 0, ...outlineHover, transition: { duration: 0.1, ease: "easeOut" } }}
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{
            height: 60,
            borderRadius: "var(--corner-radius, var(--radius-xl))",
            background:
              "var(--button-bg, linear-gradient(135deg, var(--brand-gradient-from, var(--primary)), var(--brand-gradient-mid, var(--brand-gradient-to, var(--accent))), var(--brand-gradient-to, var(--accent))))",
            color: "var(--button-text, var(--primary-foreground))",
            border: "var(--button-border, none)",
            backdropFilter: "var(--button-backdrop-filter, none)",
            boxShadow: "0 18px 40px color-mix(in oklch, var(--brand-glow, var(--primary)) 45%, transparent)",
            transition: "background 300ms ease, border-radius 300ms ease, border-color 300ms ease, color 300ms ease",
          }}
        >
          <CtaButtonExtras preset={buttonPreset} />
          <span className="relative z-[1] flex items-center gap-2">
            <Download size={19} strokeWidth={2} />
            <span
              className="font-heading font-semibold"
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
