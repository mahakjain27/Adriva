import type { ProfileTheme } from "../theme"
import type { ProfileWorkingHoursEntry } from "../types"
import { Panel } from "./Panel"
import { SectionShell } from "./SectionShell"

export interface WorkingHoursSectionProps {
  data: ProfileWorkingHoursEntry[] | undefined
  theme: ProfileTheme
}

/** Renders nothing when there's no working-hours data. */
export function WorkingHours({ data, theme }: WorkingHoursSectionProps) {
  if (!data || data.length === 0) return null

  return (
    <SectionShell title="Working Hours">
      <Panel cards={theme.cards} className="flex flex-col divide-y divide-[var(--border)]/60 p-4">
        {data.map((entry, index) => (
          <div key={index} className="relative z-[1] flex items-center justify-between py-2 first:pt-0 last:pb-0">
            <span className="text-body text-[var(--foreground)]">{entry.day}</span>
            <span className="text-caption text-[var(--muted-foreground)]">{entry.hours}</span>
          </div>
        ))}
      </Panel>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </SectionShell>
  )
}
