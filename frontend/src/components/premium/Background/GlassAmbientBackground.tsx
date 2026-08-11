import { motion } from "framer-motion"

const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

/**
 * Hero background — two softly drifting ambient blobs (brand-glow-driven,
 * ombre-endpoint-driven) plus a faint grain layer, on a deep neutral base.
 * The slow drift (18-22s loops) is what makes this read as "atmospheric/
 * dimensional" rather than a static wash like Luxury/Executive/Minimal's —
 * without reaching for Modern's WebGL shader, which is that theme's own
 * signature technique, not Glass's.
 */
export function GlassAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />
      <motion.div
        className="absolute top-[-8%] left-[8%] h-[380px] w-[380px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--brand-glow, var(--primary)) 55%, transparent), transparent 70%)",
          transition: "background 300ms ease",
        }}
        animate={{ x: [0, 18, 0], y: [0, 12, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[4%] bottom-[-10%] h-[320px] w-[320px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--brand-gradient-to, var(--accent)) 45%, transparent), transparent 72%)",
          transition: "background 300ms ease",
        }}
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
