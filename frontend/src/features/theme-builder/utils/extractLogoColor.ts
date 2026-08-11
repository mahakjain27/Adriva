/**
 * Extracts a dominant, vivid color from a logo image via a simple pixel
 * histogram — skips near-transparent, near-black/white, and low-saturation
 * (gray) pixels, then buckets the rest by coarse RGB quantization and
 * returns the most frequent bucket's average color. No new dependency.
 *
 * Returns `null` if the image fails to load or the canvas is CORS-tainted
 * (the logo's host doesn't serve CORS headers) — callers should show a
 * "couldn't read this image's colors" message rather than treat it as a bug.
 */
export async function extractLogoColor(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null

  const img = new Image()
  img.crossOrigin = "anonymous"

  const loaded = await new Promise<boolean>((resolve) => {
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
  if (!loaded) return null

  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  let data: Uint8ClampedArray
  try {
    ctx.drawImage(img, 0, 0, size, size)
    data = ctx.getImageData(0, 0, size, size).data
  } catch {
    return null
  }

  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>()

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 200) continue

    const brightness = (r + g + b) / 3
    if (brightness < 20 || brightness > 235) continue

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    if (saturation < 0.15) continue

    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 }
    bucket.count += 1
    bucket.r += r
    bucket.g += g
    bucket.b += b
    buckets.set(key, bucket)
  }

  let best: { count: number; r: number; g: number; b: number } | undefined
  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) best = bucket
  }
  if (!best) return null

  const r = Math.round(best.r / best.count)
  const g = Math.round(best.g / best.count)
  const b = Math.round(best.b / best.count)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`
}
