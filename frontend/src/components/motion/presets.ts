import type { Variants } from "framer-motion"
import { duration, easing, spring } from "@/lib/motion-tokens"

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: easing.standard } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.entrance },
  },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.entrance },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easing.entrance },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.fast, ease: easing.entrance },
  },
}

export const floating: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, ease: easing.standard, repeat: Infinity },
  },
}

/** Use with `whileHover="hover"` / `initial="rest"`. */
export const hoverLift: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: spring.soft },
}

/** Use with `whileTap="tap"` / `initial="rest"`. */
export const buttonPress: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.97, transition: { duration: duration.instant, ease: easing.standard } },
}

/** Use as `initial="initial" animate="animate" exit="exit"` on route-level containers. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: easing.entrance } },
  exit: { opacity: 0, y: -8, transition: { duration: duration.fast, ease: easing.exit } },
}
