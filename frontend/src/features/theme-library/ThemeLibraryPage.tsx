import { Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { profileThemeNames, type ProfileThemeName } from "@/features/profiles/theme"
import { cn } from "@/lib/utils"
import { SavedThemeCard } from "./components/SavedThemeCard"
import { useSavedThemes } from "./hooks/useSavedThemes"

export function ThemeLibraryPage() {
  const navigate = useNavigate()
  const savedThemes = useSavedThemes()
  const [search, setSearch] = useState("")
  const [baseThemeFilter, setBaseThemeFilter] = useState<ProfileThemeName | "all">("all")

  const filtered = useMemo(() => {
    if (!savedThemes.data) return []
    const query = search.trim().toLowerCase()
    return savedThemes.data
      .filter((t) => baseThemeFilter === "all" || t.baseTheme === baseThemeFilter)
      .filter((t) => !query || t.name.toLowerCase().includes(query))
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [savedThemes.data, search, baseThemeFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Theme Library</h1>
          <p className="text-sm text-muted-foreground">
            Reusable design configurations — save one, apply it to any company.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/dashboard/theme-builder")}>
          <Plus /> New Theme
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search saved themes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setBaseThemeFilter("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
              baseThemeFilter === "all"
                ? "border-[var(--primary)] bg-accent"
                : "border-[var(--border)] hover:bg-accent",
            )}
          >
            All
          </button>
          {profileThemeNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setBaseThemeFilter(name)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                baseThemeFilter === name
                  ? "border-[var(--primary)] bg-accent"
                  : "border-[var(--border)] hover:bg-accent",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {savedThemes.isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      )}

      {!savedThemes.isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-sm font-medium">
            {savedThemes.data?.length ? "No themes match your search." : "No saved themes yet."}
          </p>
          <p className="text-sm text-muted-foreground">
            Build one in the Theme Builder, or save an employee's current styling.
          </p>
          {!savedThemes.data?.length && (
            <Button size="sm" className="mt-2" onClick={() => navigate("/dashboard/theme-builder")}>
              <Plus /> New Theme
            </Button>
          )}
        </div>
      )}

      {!savedThemes.isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((theme) => (
            <SavedThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  )
}
