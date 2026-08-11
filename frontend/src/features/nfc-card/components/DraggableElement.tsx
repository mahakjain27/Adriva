import { motion, useMotionValue } from "framer-motion"
import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

export interface DraggableElementProps {
  xPct: number
  yPct: number
  rotation: number
  scale: number
  minScale: number
  maxScale: number
  /** QR codes don't get a rotate handle or rotation at all — see ElementsPanel, which drops the Rotation slider for the same element. */
  rotatable: boolean
  canvasRef: RefObject<HTMLDivElement | null>
  selected: boolean
  onSelect: () => void
  onPositionChange: (xPct: number, yPct: number) => void
  onScaleChange: (scale: number) => void
  onRotationChange: (rotation: number) => void
  children: ReactNode
  className?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const HANDLE_CLASS =
  "absolute z-[2] h-3 w-3 rounded-sm border border-[var(--primary)] bg-white shadow-sm touch-none"

/**
 * A freely-draggable, centered-on-its-point element — see the move-drag
 * comment below for why position uses the "commit and reset" pattern. When
 * `selected`, also renders four corner resize handles and (if `rotatable`)
 * a detached rotate handle below the box, matching a standard design-tool
 * transform box instead of only exposing Size/Rotation via the side panel's
 * sliders. These use plain pointer events rather than Framer's `drag` —
 * they only ever need to *read* pointer position to derive a new
 * scale/rotation value, never move themselves (their own position is a
 * pure function of the element's current size/rotation, which updates via
 * the same `onUpdateElement` path as the sliders already used), so there's
 * no transform-vs-percentage reconciliation to do.
 */
export function DraggableElement({
  xPct,
  yPct,
  rotation,
  scale,
  minScale,
  maxScale,
  rotatable,
  canvasRef,
  selected,
  onSelect,
  onPositionChange,
  onScaleChange,
  onRotationChange,
  children,
  className,
}: DraggableElementProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const latest = useRef({ xPct, yPct, scale })
  latest.current = { xPct, yPct, scale }

  function handleDragEnd() {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const currentXPx = (xPct / 100) * rect.width + x.get()
    const currentYPx = (yPct / 100) * rect.height + y.get()
    const nextXPct = clamp((currentXPx / rect.width) * 100, 0, 100)
    const nextYPct = clamp((currentYPx / rect.height) * 100, 0, 100)
    x.set(0)
    y.set(0)
    onPositionChange(nextXPct, nextYPct)
  }

  /** Drag any corner outward from the element's center to grow it, inward to shrink — the single `scale` field drives a uniform resize (every element here is square or single-axis text), so which corner is grabbed doesn't matter. */
  function handleResizeStart(e: ReactPointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { xPct: startXPct, yPct: startYPct, scale: startScale } = latest.current
    const centerX = (startXPct / 100) * rect.width
    const centerY = (startYPct / 100) * rect.height
    const startDistance = Math.hypot(e.clientX - rect.left - centerX, e.clientY - rect.top - centerY) || 1

    function handleMove(moveEvent: PointerEvent) {
      const distance = Math.hypot(moveEvent.clientX - rect.left - centerX, moveEvent.clientY - rect.top - centerY)
      const nextScale = clamp(Math.round(startScale * (distance / startDistance)), minScale, maxScale)
      onScaleChange(nextScale)
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
  }

  /** Drag in an arc around the element's center — angle 0 (rotation: 0) is the handle's resting position directly below the box. */
  function handleRotateStart(e: ReactPointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    function handleMove(moveEvent: PointerEvent) {
      const { xPct: currentXPct, yPct: currentYPct } = latest.current
      const centerX = (currentXPct / 100) * rect.width
      const centerY = (currentYPct / 100) * rect.height
      const angleDeg = (Math.atan2(moveEvent.clientY - rect.top - centerY, moveEvent.clientX - rect.left - centerX) * 180) / Math.PI
      const nextRotation = Math.round((((angleDeg - 90) % 360) + 360) % 360)
      onRotationChange(nextRotation)
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        translateX: "-50%",
        translateY: "-50%",
        x,
        y,
        rotate: rotation,
        touchAction: "none",
      }}
      className={cn(
        "cursor-grab touch-none select-none active:cursor-grabbing",
        selected && "outline outline-2 outline-offset-4 outline-[var(--primary)]",
        className,
      )}
    >
      {children}

      {selected && (
        <>
          <div onPointerDown={handleResizeStart} className={cn(HANDLE_CLASS, "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize")} />
          <div onPointerDown={handleResizeStart} className={cn(HANDLE_CLASS, "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize")} />
          <div onPointerDown={handleResizeStart} className={cn(HANDLE_CLASS, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize")} />
          <div onPointerDown={handleResizeStart} className={cn(HANDLE_CLASS, "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize")} />

          {rotatable && (
            <>
              <span className="pointer-events-none absolute top-full left-1/2 h-4 w-px -translate-x-1/2 bg-[var(--primary)]" />
              <div
                onPointerDown={handleRotateStart}
                className="absolute top-full left-1/2 mt-4 h-3.5 w-3.5 -translate-x-1/2 touch-none cursor-grab rounded-full border border-[var(--primary)] bg-white shadow-sm active:cursor-grabbing"
              />
            </>
          )}
        </>
      )}
    </motion.div>
  )
}
