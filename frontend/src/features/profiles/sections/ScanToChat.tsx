import { useEffect, useState } from "react"
import { generateQrDataUrl } from "@/features/employees/utils/qrcode"
import type { ProfileTheme } from "../theme"
import type { ProfileHero } from "../types"
import { Panel } from "./Panel"
import { SectionShell } from "./SectionShell"

export interface ScanToChatSectionProps {
  hero: ProfileHero
  theme: ProfileTheme
  /** `wa.me` link already built by `toProfileData.ts` — section renders nothing without it. */
  whatsappHref?: string
}

/** WhatsApp QR block — generated client-side, never sent to a third party. Renders nothing when the profile has no WhatsApp number. */
export function ScanToChat({ hero, theme, whatsappHref }: ScanToChatSectionProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>()

  useEffect(() => {
    if (!whatsappHref) return
    let cancelled = false
    generateQrDataUrl(whatsappHref).then((url) => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [whatsappHref])

  if (!whatsappHref) return null

  return (
    <SectionShell title="Scan to Chat">
      <Panel cards={theme.cards} className="flex items-center gap-5 p-6">
        <div
          className="relative z-[1] flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl"
          style={{ backgroundColor: "var(--card)" }}
        >
          {qrDataUrl && <img src={qrDataUrl} alt="WhatsApp QR code" className="h-full w-full object-contain p-1.5" />}
        </div>
        <div className="relative z-[1] flex flex-col gap-1.5">
          <p className="font-heading text-sm font-semibold text-[var(--foreground)]">{hero.name}</p>
          <p className="text-caption text-[var(--muted-foreground)]">Scan or tap this code to start a WhatsApp chat.</p>
        </div>
      </Panel>
    </SectionShell>
  )
}
