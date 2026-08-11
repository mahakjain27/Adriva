import type { ProfileTheme } from "../theme"
import type { ProfileAbout, ProfileProduct } from "../types"
import { Panel } from "./Panel"
import { SectionShell } from "./SectionShell"

export interface AboutSectionProps {
  data: ProfileAbout
  theme: ProfileTheme
  products?: ProfileProduct[]
}

/** Bio paragraph, plus a row of category chips derived from real product data — never invented copy. */
export function About({ data, theme, products = [] }: AboutSectionProps) {
  const categories = Array.from(new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))))

  return (
    <SectionShell title="About">
      <Panel cards={theme.cards} className="p-7">
        <p className="relative z-[1] text-body leading-relaxed text-[var(--foreground)]">{data.bio}</p>
      </Panel>
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </SectionShell>
  )
}
