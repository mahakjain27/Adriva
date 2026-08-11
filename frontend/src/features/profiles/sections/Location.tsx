import { ExternalLink, Navigation } from "lucide-react"
import { ICON_STROKE_WIDTH } from "@/lib/icons"
import type { ProfileTheme } from "../theme"
import type { ProfileLocation } from "../types"
import { Panel } from "./Panel"
import { SectionShell } from "./SectionShell"

export interface LocationSectionProps {
  data: ProfileLocation
  theme: ProfileTheme
}

/** Real embedded Google Maps iframe (no API key required) — replaces the previous static placeholder tile. */
export function Location({ data, theme }: LocationSectionProps) {
  if (!data.address) return null

  const query = encodeURIComponent(data.address)
  const searchHref = `https://www.google.com/maps/search/?api=1&query=${query}`
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`

  return (
    <SectionShell title="Location">
      <Panel cards={theme.cards} className="p-0">
        <a
          href={searchHref}
          target="_blank"
          rel="noopener"
          className="absolute top-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#1a73e8] shadow-md"
        >
          <ExternalLink size={13} strokeWidth={ICON_STROKE_WIDTH} /> Open in Maps
        </a>
        <iframe
          title="Location map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${query}&z=16&output=embed`}
          className="relative z-[1] h-[220px] w-full border-0"
        />
      </Panel>
      <p className="mt-3 text-center text-body text-[var(--foreground)]">{data.address}</p>
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener"
        className="mt-4 flex w-full items-center justify-center gap-2 py-4 font-heading font-semibold"
        style={{
          borderRadius: "var(--corner-radius, var(--radius-lg))",
          background: "var(--button-bg, var(--primary))",
          color: "var(--button-text, var(--primary-foreground))",
          border: "var(--button-border, none)",
        }}
      >
        <Navigation size={17} strokeWidth={2} /> Get Directions
      </a>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </SectionShell>
  )
}
