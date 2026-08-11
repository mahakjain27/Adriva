import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface CollapsibleSectionProps {
  index: number
  title: string
  children?: ReactNode
  defaultOpen?: boolean
  badge?: string
  disabled?: boolean
  /** Optional controlled open state — omit to keep the section self-managing its own open/closed state (the default everywhere except forms that need to force a section open, e.g. to reveal a validation error hidden inside a collapsed section). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Numbered, collapsible wrapper shared by every Theme Builder section. `disabled` renders a locked, non-expanding header for not-yet-built sections (Motion/Advanced) instead of an empty expandable shell. */
export function CollapsibleSection({
  index,
  title,
  children,
  defaultOpen = true,
  badge,
  disabled = false,
  open: openProp,
  onOpenChange,
}: CollapsibleSectionProps) {
  const [openState, setOpenState] = useState(defaultOpen && !disabled)
  const open = openProp ?? openState
  function setOpen(next: boolean) {
    if (onOpenChange) onOpenChange(next)
    else setOpenState(next)
  }

  return (
    <section className="border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed",
        )}
      >
        <span className={cn("flex items-center gap-2 text-sm font-semibold", disabled && "text-muted-foreground")}>
          <span className="text-muted-foreground">{index}.</span>
          {title}
          {badge && (
            <Badge variant="secondary" className="text-[10px]">
              {badge}
            </Badge>
          )}
        </span>
        {!disabled && (
          <ChevronDown
            size={16}
            className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
