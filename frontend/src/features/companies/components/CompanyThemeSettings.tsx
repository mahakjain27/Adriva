import { Check, Palette } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { getProfileTheme, profileThemeNames } from "@/features/profiles/theme"
import { themeRegistry, type ThemeName } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUpdateCompany } from "../hooks/useCompanies"
import type { Company } from "../types"

export function CompanyThemeSettings({ company }: { company: Company }) {
  const updateCompany = useUpdateCompany()
  const navigate = useNavigate()

  function setDefaultTheme(name: (typeof profileThemeNames)[number]) {
    const { id, slug: _slug, createdAt: _createdAt, ...input } = company
    updateCompany.mutate(
      { id, input: { ...input, defaultTheme: name } },
      { onSuccess: () => toast.success("Default theme updated", { description: name }) },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        New employees at {company.name} default to this theme. Each employee can still override
        it individually.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profileThemeNames.map((name) => {
          const definition = themeRegistry[name as ThemeName]
          const isAvailable = definition.status === "available"
          const isSelected = company.defaultTheme === name

          return (
            <Card
              key={name}
              role={isAvailable ? "button" : undefined}
              onClick={() => isAvailable && setDefaultTheme(name)}
              className={cn(
                "transition-shadow",
                isAvailable && "cursor-pointer hover:shadow-md",
                isSelected && "ring-2 ring-[var(--accent)]",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="flex items-center gap-1.5 capitalize">
                  {definition.label}
                  {isSelected && <Check size={14} className="text-[var(--accent)]" />}
                </CardTitle>
                <Badge variant={isAvailable ? "secondary" : "outline"}>
                  {isAvailable ? "Available" : "Planned"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{definition.description}</p>
                {isAvailable && (
                  <>
                    <div className="mx-auto h-[284px] w-[215px] overflow-hidden rounded-lg border border-[var(--border)]">
                      {/* Fixed unscaled width + `origin-top-left` so the scaled-down visual
                          footprint exactly fills this box — no dead margin from a wider,
                          transform-centered layout box. */}
                      <div className="pointer-events-none origin-top-left scale-[0.5]" style={{ width: 430 }}>
                        <ProfileEngine profile={mockProfile} theme={getProfileTheme(name)} />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/dashboard/companies/${company.id}/theme-builder?theme=${name}`)
                      }}
                    >
                      <Palette /> Customize colors
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
