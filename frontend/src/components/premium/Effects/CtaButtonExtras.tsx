import { motion, type TargetAndTransition } from "framer-motion"
import type { ButtonStyle } from "@/features/theme-builder/deriveStyleTokens"

export interface CtaButtonExtrasProps {
  preset?: ButtonStyle
}

/**
 * Extra hover/tap fill for the `outline` preset — callers spread this into
 * their existing `whileHover`/`whileTap` objects only when `buttonPreset ===
 * "outline"`, so the transparent button visibly fills on interaction instead
 * of just moving.
 */
export const CTA_OUTLINE_FILL: TargetAndTransition = {
  backgroundColor: "var(--primary)",
  color: "var(--primary-foreground)",
}

/**
 * Mounted inside the CTA button (which must be `position: relative;
 * overflow: hidden`), before the visible icon/label content. Deliberately a
 * self-contained overlay with its own literal `animate` rather than
 * touching the host button's own motion props — the host button already
 * uses `variants`/parent-propagated `animate="visible"` for its entrance
 * stagger, and giving it a second, directly-set `animate` prop would
 * override that propagation instead of layering on top of it.
 *
 * Renders nothing for `solid` (already a flat fill) and `undefined`
 * (uncustomized).
 */
export function CtaButtonExtras({ preset }: CtaButtonExtrasProps) {
  if (preset === "gradient") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          backgroundSize: "220% 220%",
          background:
            "linear-gradient(135deg, var(--brand-gradient-from, var(--primary)), var(--brand-gradient-mid, var(--brand-gradient-to, var(--primary))), var(--brand-gradient-to, var(--primary)))",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          boxShadow: [
            "0 0 0px 0px transparent",
            "0 0 28px 6px color-mix(in oklch, var(--brand-glow, var(--primary)) 55%, transparent)",
            "0 0 0px 0px transparent",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (preset === "glass") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          background: "linear-gradient(120deg, transparent 15%, rgba(255,255,255,0.25) 50%, transparent 80%)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
        animate={{ x: ["-8%", "8%", "-8%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (preset === "outline") {
    // The real border is the button's own `--button-border: 2px solid <primary>`
    // (see deriveStyleTokens.ts) — this is only a decorative extra. A masked,
    // rotating/panned gradient ring kept producing rendering seams (mask-composite
    // support varies), so this is a plain box-shadow pulse instead: no gradient,
    // no mask, nothing that can seam.
    return (
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: "inherit" }}
        animate={{
          boxShadow: [
            "0 0 0px 0px transparent",
            "0 0 16px 2px color-mix(in oklch, var(--primary) 45%, transparent)",
            "0 0 0px 0px transparent",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  return null
}
