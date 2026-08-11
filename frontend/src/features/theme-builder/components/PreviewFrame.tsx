import { useLayoutEffect, useRef, type ReactNode } from "react"

export interface PreviewFrameProps {
  /** Target width for the active device (PREVIEW_DEVICE_WIDTH) — Mobile/Tablet/Desktop change width only. */
  width: number
  /** Changes whenever Base Theme, Device, Style, or Typography change — the preview scrolls itself back to the top when this changes. */
  resetKey: string
  children: ReactNode
}

/**
 * The preview container itself — not a wrapper around another card. Border,
 * rounded corners, shadow, and vertical scrolling all live on this single
 * element. Height is `h-full` — it always fills exactly whatever space its
 * flex-1 parent gives it (see ThemeBuilderPage), rather than a literal
 * `calc(100vh - Npx)` guess that has to be re-tuned every time the
 * surrounding chrome (heading, toggle, page padding) changes size and can
 * silently overflow the page when the guess is wrong.
 */
export function PreviewFrame({ width, resetKey, children }: PreviewFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [resetKey])

  return (
    <div
      ref={scrollRef}
      className="mx-auto h-full overflow-x-hidden overflow-y-auto rounded-[20px] border border-[var(--border)] bg-[var(--background)] shadow-lg transition-[width] duration-300 ease-out [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ width: `min(${width}px, 100%)` }}
    >
      {children}
    </div>
  )
}
