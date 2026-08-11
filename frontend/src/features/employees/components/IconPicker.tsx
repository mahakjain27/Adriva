import { CUSTOM_BUTTON_ICON_KEYS, QUICK_ACTION_ICONS, type CustomButtonIcon } from "@/features/profiles/quickActionIcons"
import { cn } from "@/lib/utils"

export interface IconPickerProps {
  value: CustomButtonIcon
  onChange: (icon: CustomButtonIcon) => void
}

/** A grid of curated icons to choose from for a custom button — same swatch-row pattern as BrandSection's quick colors, icons instead of colors. Renders from the same QUICK_ACTION_ICONS map the profile card itself renders from, so a chosen icon always looks identical on the card. */
export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CUSTOM_BUTTON_ICON_KEYS.map((key) => {
        const Icon = QUICK_ACTION_ICONS[key]
        const isSelected = value === key
        return (
          <button
            key={key}
            type="button"
            title={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md border transition-colors",
              isSelected
                ? "border-[var(--primary)] bg-accent text-foreground"
                : "border-[var(--border)] text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon size={15} />
          </button>
        )
      })}
    </div>
  )
}
