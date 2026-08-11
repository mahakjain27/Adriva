/**
 * Resolves any valid CSS color (hex, rgb, hsl, oklch, color-mix, …) to 0-255
 * RGB bytes by actually painting one pixel and reading the raster bytes
 * back — NOT by parsing the `fillStyle` getter's string, which doesn't
 * reliably round-trip wide-gamut colors like oklch back to a parseable
 * `#rrggbb`/`rgb(...)` form (silently yielding black for every color
 * otherwise — see the git history on this file if that regresses).
 */
let probeCtx: CanvasRenderingContext2D | null = null

export function resolveCssColor(value: string): [number, number, number] {
  if (!probeCtx) {
    const probe = document.createElement("canvas")
    probe.width = 1
    probe.height = 1
    probeCtx = probe.getContext("2d", { willReadFrequently: true })
  }
  if (!probeCtx || !value) return [0, 0, 0]

  probeCtx.fillStyle = "#000"
  probeCtx.fillStyle = value
  probeCtx.fillRect(0, 0, 1, 1)
  const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** `resolveCssColor` as a `#rrggbb` string, for seeding `<input type="color">`. */
export function resolveCssColorToHex(value: string): string {
  const [r, g, b] = resolveCssColor(value)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
}
