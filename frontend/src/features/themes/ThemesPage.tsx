import { useNavigate } from "react-router"
import { themeRegistry, type ThemeName } from "@/lib/theme"
import { getProfileTheme, profileThemeNames } from "@/features/profiles/theme"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ThemesPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Themes</h1>
        <p className="text-sm text-muted-foreground">
          Visual skins available for client profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {profileThemeNames.map((name) => {
          const definition = themeRegistry[name as ThemeName]
          const isAvailable = definition.status === "available"

          return (
            <Card
              key={name}
              className={cn(
                "transition-all duration-200",
                isAvailable &&
                  "cursor-pointer hover:-translate-y-1 hover:shadow-lg",
              )}
              role={isAvailable ? "button" : undefined}
              tabIndex={isAvailable ? 0 : undefined}
              onClick={isAvailable ? () => navigate(`/dashboard/theme-builder?baseTheme=${name}`) : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="capitalize">{definition.label}</CardTitle>
                <Badge variant={isAvailable ? "secondary" : "outline"}>
                  {isAvailable ? "Available" : "Planned"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{definition.description}</p>
                {isAvailable && (
                  <div className="group relative mx-auto h-[350px] w-[258px] overflow-hidden rounded-lg border border-[var(--border)]">
                    {/* Fixed unscaled width + `origin-top-left` so the scaled-down visual
                        footprint exactly fills this box — no dead margin from a wider,
                        transform-centered layout box (the previous bug). */}
                    <div className="pointer-events-none origin-top-left scale-[0.6]" style={{ width: 430 }}>
                      <ProfileEngine profile={mockProfile} theme={getProfileTheme(name)} />
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="pb-3 text-xs font-medium text-white">Preview →</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
