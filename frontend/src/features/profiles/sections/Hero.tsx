import { Download } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { CTA_OUTLINE_FILL, CtaButtonExtras } from "@/components/premium/Effects/CtaButtonExtras"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"
import type { ProfileTheme } from "../theme"
import type { ProfileHero } from "../types"
import { Panel } from "./Panel"
import { avatarShapeClass } from "./styleTokens"

export interface HeroSectionProps {
  data: ProfileHero
  theme: ProfileTheme
  onSaveContact: () => void
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function getHeroVariants(motionStyle: MotionStyle | undefined) {
  const scale = getMotionScale(motionStyle)
  const entrance = { duration: 0.32 * scale.duration, ease: [0.4, 0, 0.2, 1] } as const

  const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 * scale.stagger } } }
  const item: Variants = { hidden: { opacity: 0, y: 10 * scale.distance }, visible: { opacity: 1, y: 0, transition: entrance } }
  const avatarItem: Variants = {
    hidden: { opacity: 0, scale: 1 - 0.05 * scale.distance },
    visible: { opacity: 1, scale: 1, transition: entrance },
  }

  return { container, item, avatarItem }
}

/**
 * One structural Hero for every theme. `theme.hero.layout === "split"` (only
 * Minimal uses this today) swaps to a chromeless, left-aligned column —
 * every other theme renders the centered panel below. Everything else
 * (avatar shape, card chrome, colors, fonts, motion easing) comes from
 * `theme`/CSS tokens, not from branching per theme name.
 */
export function Hero({ data, theme, onSaveContact }: HeroSectionProps) {
  const { buttonPreset, motionStyle } = useBranding()
  const outlineHover = buttonPreset === "outline" ? CTA_OUTLINE_FILL : undefined
  const { container, item, avatarItem } = getHeroVariants(motionStyle)
  const split = theme.hero.layout === "split"

  const avatar = (
    <motion.div
      variants={avatarItem}
      className={`shrink-0 overflow-hidden ${avatarShapeClass(theme.hero.avatarShape)} ${split ? "h-[84px] w-[84px]" : "h-[132px] w-[132px]"}`}
      style={{ border: "3px solid var(--primary)", background: "var(--secondary)" }}
    >
      {data.avatarUrl ? (
        <img src={data.avatarUrl} alt={data.name} className="h-full w-full object-cover" />
      ) : data.logoUrl ? (
        <img src={data.logoUrl} alt={data.company} className="h-full w-full object-contain p-3" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-heading text-3xl font-bold text-[var(--foreground)]">{initials(data.name)}</span>
        </div>
      )}
    </motion.div>
  )

  const saveButton = (
    <motion.button
      type="button"
      onClick={onSaveContact}
      variants={item}
      whileHover={{ y: -1, ...outlineHover, transition: { duration: 0.15, ease: "easeOut" } }}
      whileTap={{ scale: 0.98, y: 0, ...outlineHover, transition: { duration: 0.1, ease: "easeOut" } }}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{
        height: 54,
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
        <Download size={18} strokeWidth={2} />
        <span className="font-heading font-bold" style={{ fontSize: "var(--button-font-size, 15px)", transition: "font-size 300ms ease" }}>
          Save Contact
        </span>
      </span>
    </motion.button>
  )

  const companyLabel = (
    <motion.span
      variants={item}
      className="font-heading text-[11px] font-semibold"
      style={{
        color: "var(--accent)",
        textTransform: "var(--company-transform, uppercase)",
        letterSpacing: "var(--company-letter-spacing, 0.14em)",
        transition: "letter-spacing 300ms ease",
      }}
    >
      {data.company}
    </motion.span>
  )

  const nameHeading = (
    <motion.p
      variants={item}
      role="heading"
      aria-level={1}
      className="leading-[1.1] font-extrabold tracking-[-0.01em] text-[var(--foreground)]"
      style={{
        fontFamily: "var(--font-name, var(--font-heading))",
        fontSize: split ? "var(--name-size, 34px)" : "var(--name-size, 32px)",
        fontStyle: "var(--name-style, normal)",
        transition: "font-size 300ms ease",
      }}
    >
      {data.name}
    </motion.p>
  )

  const titleLine = (
    <motion.p
      variants={item}
      className="font-heading font-semibold"
      style={{ color: "var(--muted-foreground)", fontSize: "var(--designation-size, 15px)", transition: "font-size 300ms ease" }}
    >
      {data.title}
    </motion.p>
  )

  const tagline = data.tagline && (
    <motion.p variants={item} className="text-body" style={{ color: "var(--foreground)", opacity: 0.85 }}>
      {data.tagline}
    </motion.p>
  )

  if (split) {
    return (
      <motion.section
        initial="hidden"
        animate="visible"
        variants={container}
        className="flex flex-col items-start gap-6 px-[var(--spacing-gutter)] pb-10 text-left"
        style={{ backgroundColor: "var(--background)", paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}
      >
        {avatar}
        <div className="flex flex-col items-start gap-1.5">
          {companyLabel}
          {nameHeading}
          {titleLine}
          {tagline}
        </div>
        {saveButton}
      </motion.section>
    )
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={container}
      className="flex flex-col items-center px-[var(--spacing-gutter)] pb-10 text-center"
      style={{ backgroundColor: "var(--background)", paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}
    >
      <Panel cards={theme.cards} className="flex w-full max-w-[390px] flex-col items-center gap-4 p-8">
        {data.logoUrl && (
          <motion.img variants={item} src={data.logoUrl} alt={data.company} className="relative z-[1] h-auto max-h-10 w-auto max-w-[140px] object-contain" />
        )}
        <div className="relative z-[1]">{avatar}</div>
        <div className="relative z-[1] flex flex-col items-center gap-1.5">
          {nameHeading}
          {titleLine}
          {companyLabel}
          {tagline}
        </div>
        <div className="relative z-[1] w-full">{saveButton}</div>
      </Panel>
    </motion.section>
  )
}
