import { Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Workspace-wide preferences.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Settings className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            More settings are coming soon — branding defaults, team access, and billing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
