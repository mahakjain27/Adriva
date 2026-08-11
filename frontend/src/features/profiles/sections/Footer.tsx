import type { ProfileHero } from "../types"

export interface FooterSectionProps {
  data: ProfileHero
}

/** Company-branded block — separate from `PoweredByFooter` (Adriva's own platform attribution, unaffected by this template). */
export function Footer({ data }: FooterSectionProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="flex flex-col items-center gap-3 px-[var(--spacing-gutter)] pt-6 pb-8 text-center" style={{ backgroundColor: "var(--background)" }}>
      {data.logoUrl && <img src={data.logoUrl} alt={data.company} className="h-10 w-auto max-w-[120px] object-contain" />}
      <p className="font-heading text-sm font-semibold text-[var(--foreground)]">{data.company}</p>
      <p className="text-caption text-[var(--muted-foreground)]">
        &copy; {year} {data.company}. All rights reserved.
      </p>
    </footer>
  )
}
