import { motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"
import { spring } from "@/lib/motion-tokens"
import { cn } from "@/lib/utils"

export interface PremiumActionButtonProps {
  icon?: ReactNode
  children: ReactNode
  variant?: "solid" | "glass"
  href?: string
  onClick?: () => void
  className?: string
}

const glassPress = {
  rest: { scale: 1, boxShadow: "var(--shadow-sm)" },
  hover: { scale: 1.01, boxShadow: "var(--shadow-glow)" },
  tap: { scale: 0.96, transition: spring.snappy },
}

const solidPress = {
  rest: { scale: 1, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), var(--shadow-sm)" },
  hover: {
    scale: 1.01,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), var(--shadow-glow)",
  },
  tap: { scale: 0.96, transition: spring.snappy },
}

// Derived from `--primary` via color-mix, not a hardcoded color — stays
// theme-agnostic even though only Luxury has a `--primary` worth gradient-ing.
const solidStyle: CSSProperties = {
  background:
    "linear-gradient(155deg, color-mix(in oklch, var(--primary) 88%, white) 0%, var(--primary) 55%, color-mix(in oklch, var(--primary) 85%, black) 100%)",
}

const variantClasses: Record<NonNullable<PremiumActionButtonProps["variant"]>, string> = {
  solid: "text-[var(--primary-foreground)]",
  glass: "border border-[var(--border)]/60 bg-[var(--card)]/60 text-[var(--foreground)] backdrop-blur-xl",
}

/**
 * Large, thumb-friendly CTA with native-feeling spring press feedback and a
 * glow that brightens on hover/tap. Used for "Save Contact" (solid) and
 * quick actions (glass) alike.
 */
export function PremiumActionButton({
  icon,
  children,
  variant = "solid",
  href,
  onClick,
  className,
}: PremiumActionButtonProps) {
  const sharedClassName = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-2xl)] px-6 text-sm font-medium",
    variantClasses[variant],
    className,
  )
  const style = variant === "solid" ? solidStyle : undefined
  const press = variant === "solid" ? solidPress : glassPress

  if (href) {
    return (
      <motion.a
        href={href}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={press}
        className={sharedClassName}
        style={style}
      >
        {icon}
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={press}
      className={sharedClassName}
      style={style}
    >
      {icon}
      {children}
    </motion.button>
  )
}
