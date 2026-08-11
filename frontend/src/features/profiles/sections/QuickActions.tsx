import { Link as LinkIcon, MapPin, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { useBranding } from "@/features/profiles/BrandingContext"
import { ICON_STROKE_WIDTH } from "@/lib/icons"
import { QUICK_ACTION_ICONS } from "../quickActionIcons"
import type { ProfileTheme } from "../theme"
import type { ProfileQuickAction } from "../types"
import { pressVariants, getSectionReveal, sectionRevealViewport } from "./animations"
import { Panel } from "./Panel"

export interface QuickActionsSectionProps {
  data: ProfileQuickAction[]
  theme: ProfileTheme
  /** Google Maps search link for the resolved address — omitted when there's no address to show a Maps tile for. */
  mapsHref?: string
}

async function handleShare() {
  const data = { title: document.title, url: location.href }
  if (navigator.share) {
    try {
      await navigator.share(data)
    } catch {
      /* user cancelled — no-op */
    }
    return
  }
  try {
    await navigator.clipboard.writeText(location.href)
    toast.success("Link copied to clipboard")
  } catch {
    toast.error("Couldn't copy the link")
  }
}

interface TileProps {
  theme: ProfileTheme
  icon: ReactNode
  label: string
  href?: string
  onClick?: () => void
}

function TileBubble({ theme, icon, label }: Pick<TileProps, "theme" | "icon" | "label">) {
  return (
    <>
      <Panel cards={theme.cards} radius="9999px" className="flex h-[68px] w-[68px] items-center justify-center">
        <span
          className="relative z-[1] inline-flex"
          style={{ width: "var(--quick-action-icon-size, 20px)", height: "var(--quick-action-icon-size, 20px)", color: "var(--accent)" }}
        >
          {icon}
        </span>
      </Panel>
      <span className="text-center text-[var(--muted-foreground)]" style={{ fontSize: "var(--quick-action-label-size, 0.8125rem)" }}>
        {label}
      </span>
    </>
  )
}

function Tile({ theme, icon, label, href, onClick }: TileProps) {
  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener"
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={pressVariants}
        className="flex flex-col items-center gap-2.5"
      >
        <TileBubble theme={theme} icon={icon} label={label} />
      </motion.a>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={pressVariants}
      className="flex flex-col items-center gap-2.5"
    >
      <TileBubble theme={theme} icon={icon} label={label} />
    </motion.button>
  )
}

/** Icon-circle grid over the dynamic contact list, plus two always-available utility tiles (Maps, Share). */
export function QuickActions({ data, theme, mapsHref }: QuickActionsSectionProps) {
  const { motionStyle } = useBranding()

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={sectionRevealViewport}
      variants={getSectionReveal(motionStyle)}
      className="grid grid-cols-3 gap-5 bg-[var(--background)] px-[var(--spacing-gutter)] pb-10"
    >
      {data.map((action) => {
        const Icon = QUICK_ACTION_ICONS[action.icon] ?? LinkIcon
        return (
          <Tile
            key={action.id}
            theme={theme}
            icon={<Icon size="100%" strokeWidth={ICON_STROKE_WIDTH} />}
            label={action.label}
            href={action.href}
          />
        )
      })}
      {mapsHref && <Tile theme={theme} icon={<MapPin size="100%" strokeWidth={ICON_STROKE_WIDTH} />} label="Maps" href={mapsHref} />}
      <Tile theme={theme} icon={<Share2 size="100%" strokeWidth={ICON_STROKE_WIDTH} />} label="Share" onClick={handleShare} />
    </motion.div>
  )
}
