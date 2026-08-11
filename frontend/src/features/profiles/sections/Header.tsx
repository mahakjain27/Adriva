import { Download } from "lucide-react"
import { PremiumActionButton } from "@/components/premium/Effects/PremiumActionButton"
import type { ProfileHero } from "../types"

export interface HeaderSectionProps {
  data: ProfileHero
  onSaveContact: () => void
}

/** Sticky top bar — company mark + a persistent Save Contact action while the visitor scrolls. */
export function Header({ data, onSaveContact }: HeaderSectionProps) {
  return (
    <header
      className="sticky top-0 z-[var(--z-sticky)] flex items-center justify-between gap-3 border-b px-[var(--spacing-gutter)] py-3"
      style={{
        backgroundColor: "color-mix(in oklch, var(--background) 86%, transparent)",
        borderColor: "var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {data.logoUrl && <img src={data.logoUrl} alt={data.company} className="h-7 w-auto max-w-[96px] object-contain" />}
        <span className="truncate font-heading text-sm font-semibold text-[var(--foreground)]">{data.company}</span>
      </div>
      <PremiumActionButton
        icon={<Download size={15} strokeWidth={2} />}
        onClick={onSaveContact}
        className="min-h-9 shrink-0 px-4 text-xs"
      >
        Save
      </PremiumActionButton>
    </header>
  )
}
