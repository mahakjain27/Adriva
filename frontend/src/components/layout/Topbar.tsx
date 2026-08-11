import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
    </header>
  )
}
