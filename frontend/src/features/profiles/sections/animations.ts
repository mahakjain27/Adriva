import type { Variants } from "framer-motion"
import { getMotionScale, type MotionStyle } from "@/features/theme-builder/deriveMotionTokens"
import { duration, easing, spring } from "@/lib/motion-tokens"

/**
 * Scroll-triggered section entrance: slide + fade + a touch of blur removal.
 * A function (not a static object) so the Theme Builder's Motion control can
 * scale the distance/duration — `standard` (the default) reproduces the
 * original fixed values exactly, so uncustomized companies are unaffected.
 */
export function getSectionReveal(motionStyle?: MotionStyle): Variants {
  const scale = getMotionScale(motionStyle)
  return {
    hidden: { opacity: 0, y: 24 * scale.distance, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: duration.slow * scale.duration, ease: easing.entrance },
    },
  }
}

export const sectionRevealViewport = { once: true, margin: "-10% 0px" }

export const pressVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.96, transition: spring.snappy },
}
