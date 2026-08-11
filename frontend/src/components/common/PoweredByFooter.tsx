import { motion } from "framer-motion"
import type { BrandingMode } from "@/features/profiles/types"
import adrivaLogo from "@/assets/adriva-logo-transparent.png"

export interface PoweredByFooterProps {
  /** `powered` shows the footer; `white-label` hides it entirely. */
  mode: BrandingMode
}

/**
 * The single, theme-agnostic place where Adriva's platform branding appears
 * on a client's profile. Renders only when `mode === "powered"`; a premium
 * client with `mode === "white-label"` gets nothing here.
 *
 * Deliberately minimal and consumes only shared design tokens — no per-theme
 * styling, so every theme inherits this automatically. Shows the Adriva
 * wordmark rather than a clickable link — this is attribution, not a CTA.
 */
export function PoweredByFooter({ mode }: PoweredByFooterProps) {
  if (mode === "white-label") return null

  return (
    <footer className="bg-[var(--background)] px-[var(--spacing-gutter)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-1">
      <motion.img
        src={adrivaLogo}
        alt="Adriva"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{
          opacity: 1,
          transition: { duration: 0.2 },
        }}
        className="mx-auto h-12 w-auto"
        style={{ filter: "var(--powered-by-filter, none)" }}
      />
    </footer>
  )
}
