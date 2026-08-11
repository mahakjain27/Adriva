import { cn } from "@/lib/utils"

export type PreviewDevice = "mobile" | "tablet" | "desktop"

/** Mobile/Tablet/Desktop change the preview canvas's width only — height always comes from the panel. */
export const PREVIEW_DEVICE_WIDTH: Record<PreviewDevice, number> = {
  mobile: 390,
  tablet: 768,
  desktop: 1280,
}

const OPTIONS: { value: PreviewDevice; label: string }[] = [
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
  { value: "desktop", label: "Desktop" },
]

export interface PreviewDeviceToggleProps {
  value: PreviewDevice
  onChange: (device: PreviewDevice) => void
}

/**
 * Resizes the preview pane's outer frame — the card itself always stays
 * capped at its real max-w-[430px] (these are mobile-card profiles, not
 * responsive multi-column pages), so "Tablet/Desktop" means more
 * surrounding frame, not a different card layout.
 */
export function PreviewDeviceToggle({ value, onChange }: PreviewDeviceToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === option.value ? "bg-accent" : "hover:bg-accent/50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
