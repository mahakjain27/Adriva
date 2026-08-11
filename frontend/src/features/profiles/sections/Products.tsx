import { motion } from "framer-motion"
import type { ProfileTheme } from "../theme"
import type { ProfileProduct } from "../types"
import { Panel } from "./Panel"
import { SectionShell } from "./SectionShell"

export interface ProductsSectionProps {
  data: ProfileProduct[]
  theme: ProfileTheme
}

export function Products({ data, theme }: ProductsSectionProps) {
  if (data.length === 0) return null

  return (
    <SectionShell title="Products">
      <div className="-mx-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--spacing-gutter)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.map((product) => (
          <motion.div key={product.id} className="shrink-0 snap-center" whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: "easeOut" }}>
            <Panel cards={theme.cards} className="flex w-40 flex-col gap-2 p-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  className="relative z-[1] aspect-square w-full object-cover"
                  style={{ borderRadius: "var(--corner-radius, var(--radius-lg))" }}
                />
              ) : (
                <div
                  className="relative z-[1] aspect-square w-full"
                  style={{ backgroundColor: "var(--secondary)", borderRadius: "var(--corner-radius, var(--radius-lg))" }}
                />
              )}
              <div className="relative z-[1] flex flex-col gap-0.5">
                {product.category && (
                  <span className="text-[10px] font-medium tracking-wide text-[var(--accent)] uppercase">{product.category}</span>
                )}
                <p className="font-heading text-sm text-[var(--foreground)]">{product.name}</p>
                <p className="text-caption text-[var(--muted-foreground)]">{product.price}</p>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
