/**
 * Hero background — a single, static, low-opacity radial wash, nowhere near
 * Luxury's multi-layer glow or Modern's live WebGL shader. Executive's brief
 * is explicit: "avoid excessive glow," "do not create a saturated
 * background." One quiet accent behind the avatar, on a neutral base, is the
 * whole effect. Uses `--brand-glow` (already brand- and ombre-aware, shared
 * with Luxury/Modern) at low opacity so the atmosphere responds to Brand
 * Color/Ombre without ever reading as decorative.
 */
export function ExecutiveAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />
      <div
        className="absolute top-[30%] left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--brand-glow, var(--primary)) 22%, transparent), transparent 72%)",
          transition: "background 300ms ease",
        }}
      />
    </div>
  )
}
