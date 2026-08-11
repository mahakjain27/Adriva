export type MotionStyle = "minimal" | "standard" | "expressive"

/**
 * Multipliers applied to each theme's own base duration/translate-distance/
 * stagger values — not a replacement for them. Every theme keeps its
 * intrinsic motion character (Luxury's slow settle, Modern's crisp snap,
 * etc.); this only dials that character up or down. `standard` is exactly
 * `1` on every axis so it's a true no-op — uncustomized companies (and
 * every profile before this control existed) render with identical timing.
 */
export interface MotionScale {
  duration: number
  distance: number
  stagger: number
}

const MOTION_SCALES: Record<MotionStyle, MotionScale> = {
  minimal: { duration: 0.6, distance: 0.35, stagger: 0.5 },
  standard: { duration: 1, distance: 1, stagger: 1 },
  expressive: { duration: 1.35, distance: 1.6, stagger: 1.4 },
}

/** `undefined` (uncustomized) resolves to "standard" — a true no-op, matching every other Style preset's fallback behavior. */
export function getMotionScale(style: MotionStyle | undefined): MotionScale {
  return MOTION_SCALES[style ?? "standard"]
}
