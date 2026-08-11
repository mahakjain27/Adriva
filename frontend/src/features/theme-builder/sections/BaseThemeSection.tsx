import { Check } from "lucide-react"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { getProfileTheme, profileThemeNames, type ProfileThemeName } from "@/features/profiles/theme"
import { themeRegistry, type ThemeName } from "@/lib/theme"
import { cn } from "@/lib/utils"

export interface BaseThemeSectionProps {
  value: ProfileThemeName
  onChange: (theme: ProfileThemeName) => void
}

/**
 * Real, live mini previews — not screenshots, not labels — so you can see
 * each theme's actual layout/typography/motion personality before
 * committing to it. Same scaled-ProfileEngine pattern already used in
 * ThemesPage and CompanyThemeSettings.
 */
export function BaseThemeSection({ value, onChange }: BaseThemeSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {profileThemeNames.map((name) => {
        const definition = themeRegistry[name as ThemeName]
        const isAvailable = definition.status === "available"
        const isSelected = value === name

        return (
          // Not a real <button> — the live preview below renders a full ProfileEngine,
          // which now includes its own interactive buttons (Header/Hero Save Contact);
          // nesting those inside a <button> is invalid HTML. `role="button"` gets the
          // same click/keyboard-activation semantics without the nesting violation.
          <div
            key={name}
            role="button"
            tabIndex={isAvailable ? 0 : -1}
            aria-disabled={!isAvailable}
            onClick={() => isAvailable && onChange(name)}
            onKeyDown={(e) => {
              if (isAvailable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault()
                onChange(name)
              }
            }}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-colors",
              isAvailable ? "cursor-pointer border-[var(--border)] hover:bg-accent" : "cursor-not-allowed opacity-40",
              isSelected && "border-[var(--primary)] ring-2 ring-[var(--primary)]",
            )}
          >
            {isAvailable ? (
              <div className="pointer-events-none h-32 overflow-hidden rounded-md border border-[var(--border)]">
                <div className="origin-top scale-[0.4]">
                  <ProfileEngine profile={mockProfile} theme={getProfileTheme(name)} />
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-[10px] text-muted-foreground">
                Coming soon
              </div>
            )}
            <span className="flex items-center justify-between gap-1 px-1 text-xs font-medium capitalize">
              {definition.label}
              {isSelected && <Check size={12} />}
            </span>
          </div>
        )
      })}
    </div>
  )
}
