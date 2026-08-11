/**
 * Hero background — flat neutral, plus a single wash so quiet it barely
 * registers as an effect. No orb, no blur-3xl glow, no shader: Minimal's
 * brief explicitly rules out "large ambient glows" and "decorative blobs."
 * Uses `--brand-glow` (already brand- and ombre-aware, shared with every
 * other completed theme) at a much lower opacity than Executive's — this is
 * the quietest atmosphere of the four.
 */
export function MinimalAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--brand-glow, var(--primary)) 8%, transparent), transparent 45%)",
          transition: "background 300ms ease",
        }}
      />
    </div>
  )
}
