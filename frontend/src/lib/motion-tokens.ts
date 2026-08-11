import type { Easing } from "framer-motion"

/** Seconds. Interaction feedback stays under 300ms; entrances run a touch longer. */
export const duration = {
  instant: 0.15,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
} as const

export const easing: Record<"standard" | "entrance" | "exit", Easing> = {
  standard: [0.4, 0, 0.2, 1],
  entrance: [0, 0, 0.2, 1],
  exit: [0.4, 0, 1, 1],
}

export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 24 },
  snappy: { type: "spring", stiffness: 420, damping: 32 },
} as const
