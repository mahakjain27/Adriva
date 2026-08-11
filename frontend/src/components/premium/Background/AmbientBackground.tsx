/**
 * Hero background — four static layers, no motion of their own (the whole
 * thing fades in as step 1 of LuxuryHero's entrance sequence):
 *   1. Off-white base
 *   2. Radial lavender glow behind the avatar
 *   3. Very light blue ambient gradient
 *   4. Extremely subtle CSS noise texture
 * Values come from `--luxury-hero-*` (styles/themes/luxury.css) — exclusive
 * to the Hero, never shared with GlassCard/About/Products/Location.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--luxury-hero-bg)" }} />
      <div
        className="absolute top-[32%] left-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--brand-glow, var(--luxury-hero-glow-lavender)), transparent 70%)",
          transition: "background 300ms ease",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--brand-glow, var(--luxury-hero-glow-lavender)), transparent 55%)",
          transition: "background 300ms ease",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--luxury-noise-opacity)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
