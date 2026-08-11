import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useBranding } from "@/features/profiles/BrandingContext"
import { getSectionReveal, sectionRevealViewport } from "./animations"

export interface SectionShellProps {
  title: string
  children: ReactNode
}

/** Divider + heading + scroll-reveal wrapper shared by every section. */
export function SectionShell({ title, children }: SectionShellProps) {
  const { motionStyle } = useBranding()

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={sectionRevealViewport}
      variants={getSectionReveal(motionStyle)}
      className="bg-[var(--background)] px-[var(--spacing-gutter)] pb-10"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className="h-px flex-1"
          style={{
            backgroundColor: "color-mix(in oklch, var(--border) 70%, var(--brand-glow, var(--border)) 30%)",
            transition: "background-color 300ms ease",
          }}
        />
        {/* not <h2> — a global legacy `h2 { color }` rule in index.css (unlayered,
            beats Tailwind utilities) would clobber this. */}
        <div
          role="heading"
          aria-level={2}
          className="font-heading tracking-wide text-[var(--muted-foreground)] uppercase"
          style={{ fontSize: "var(--heading-size, 0.875rem)", transition: "font-size 300ms ease" }}
        >
          {title}
        </div>
        <span
          className="h-px flex-1"
          style={{
            backgroundColor: "color-mix(in oklch, var(--border) 70%, var(--brand-glow, var(--border)) 30%)",
            transition: "background-color 300ms ease",
          }}
        />
      </div>
      {children}
    </motion.section>
  )
}
