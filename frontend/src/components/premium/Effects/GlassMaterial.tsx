import { motion } from "framer-motion"
import type { GlassStyle } from "@/features/theme-builder/deriveStyleTokens"

export interface GlassMaterialProps {
  preset?: GlassStyle
}

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

/**
 * Extra glow merged into the host card's own `boxShadow` — box-shadow paints
 * outside the border box even under `overflow: hidden`, so unlike the
 * overlay layers below it isn't clipped and doesn't need its own element.
 */
export const GLASS_PRESET_GLOW: Partial<Record<GlassStyle, string>> = {
  premium: "0 8px 40px -8px color-mix(in oklch, var(--brand-glow, var(--primary)) 45%, transparent)",
  // Crystal reads as the most dimensional preset — a wider, stronger glow than
  // Premium's on top of its own border-highlight/shine layers (below).
  crystal: "0 20px 60px -8px color-mix(in oklch, var(--brand-glow, var(--primary)) 60%, transparent)",
}

/**
 * Mounted inside every glass surface (GlassCard/ModernCard, Hero panel,
 * QuickActions bubble) as a plain sibling of the host's real children — the
 * host must be `position: relative; overflow: hidden` with its real
 * border-radius already set. Every layer here uses `border-radius: inherit`
 * and absolute positioning, wrapped in a single `-z-10` root: per CSS
 * stacking order, a negative z-index paints *before* the host's normal
 * static in-flow content, so this always sits behind the real content
 * without the host needing to wrap its own children in an extra z-indexed
 * div (that wrapper previously had to carry the caller's `className` instead
 * of the actual root, which broke layout classes like Products cards'
 * `w-40 shrink-0 snap-center`).
 *
 * Renders nothing for `soft` (its distinctiveness *is* the absence of extra
 * treatment — quiet/matte, in deliberate contrast to the other three) and
 * for `undefined` (uncustomized — byte-for-byte unchanged from before this
 * component existed).
 */
export function GlassMaterial({ preset }: GlassMaterialProps) {
  if (!preset || preset === "soft") return null

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ borderRadius: "inherit" }}>
      {preset === "premium" && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: "55%",
              borderRadius: "inherit",
              background: "linear-gradient(120deg, transparent 10%, rgba(255,255,255,0.16) 45%, transparent 75%)",
            }}
            animate={{ x: ["-6%", "6%", "-6%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="pointer-events-none absolute inset-[6px]"
            style={{
              borderRadius: "inherit",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          />
        </>
      )}

      {preset === "frosted" && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ borderRadius: "inherit", background: "color-mix(in oklch, white 14%, transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: "inherit",
              backgroundImage: `url("${NOISE_SVG}")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
              opacity: 0.06,
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: "70%",
              borderRadius: "inherit",
              background: "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.35), transparent 75%)",
            }}
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {preset === "crystal" && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: "inherit",
              padding: "1.5px",
              background:
                "linear-gradient(135deg, var(--brand-gradient-from, var(--primary)), var(--brand-gradient-to, var(--accent)))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <div
            className="pointer-events-none absolute -top-3 -left-3 h-14 w-14 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0"
            style={{
              width: "40%",
              background: "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)",
              mixBlendMode: "overlay",
            }}
            initial={{ x: "-120%" }}
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  )
}
