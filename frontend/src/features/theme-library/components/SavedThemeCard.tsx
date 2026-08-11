import { useState } from "react"
import { Copy, Download, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { getProfileTheme } from "@/features/profiles/theme"
import { deriveProfileBranding } from "@/features/theme-builder/deriveProfileBranding"
import { cn } from "@/lib/utils"
import { useDeleteSavedTheme, useDuplicateSavedTheme, useUpdateSavedTheme } from "../hooks/useSavedThemes"
import type { SavedTheme } from "../types"
import { ApplyToCompanyDialog } from "./ApplyToCompanyDialog"

function formatRelativeTime(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function SavedThemeCard({ theme }: { theme: SavedTheme }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(theme.name)
  const updateTheme = useUpdateSavedTheme()
  const duplicateTheme = useDuplicateSavedTheme()
  const deleteTheme = useDeleteSavedTheme()

  const branding = deriveProfileBranding({
    brand: theme.brand,
    brandingMode: "powered",
    style: theme.style,
    typography: theme.typography,
    motion: theme.motion,
  })
  const profileTheme = getProfileTheme(theme.baseTheme)

  function commitRename() {
    const trimmed = name.trim()
    setEditing(false)
    if (!trimmed || trimmed === theme.name) {
      setName(theme.name)
      return
    }
    updateTheme.mutate({ id: theme.id, input: { name: trimmed } })
  }

  async function handleDuplicate() {
    const copy = await duplicateTheme.mutateAsync(theme.id)
    toast.success("Theme duplicated", { description: copy.name })
  }

  async function handleDelete() {
    await deleteTheme.mutateAsync(theme.id)
    toast.success("Theme deleted", { description: theme.name })
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="pointer-events-none h-64 overflow-hidden border-b border-[var(--border)] bg-muted/30">
        <div className="origin-top scale-[0.5] pt-4">
          <ProfileEngine profile={{ ...mockProfile, branding }} theme={profileTheme} />
        </div>
      </div>

      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename()
                  if (e.key === "Escape") {
                    setName(theme.name)
                    setEditing(false)
                  }
                }}
                onBlur={commitRename}
                className="h-7 text-sm"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="truncate text-left text-sm font-semibold hover:underline"
                title="Rename"
              >
                {theme.name}
              </button>
            )}
            <div className="mt-1 flex items-center gap-1.5">
              <Badge variant="outline" className="capitalize">
                {theme.baseTheme}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated {formatRelativeTime(theme.updatedAt)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => updateTheme.mutate({ id: theme.id, input: { favorite: !theme.favorite } })}
            title={theme.favorite ? "Unfavorite" : "Favorite"}
          >
            <Star className={cn("size-4", theme.favorite && "fill-[var(--primary)] text-[var(--primary)]")} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ApplyToCompanyDialog theme={theme} trigger={<Button size="sm" variant="outline">Apply</Button>} />
          <Button size="sm" variant="outline" onClick={handleDuplicate} disabled={duplicateTheme.isPending}>
            <Copy /> Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Export — coming soon")}>
            <Download /> Export
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="ml-auto">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{theme.name}"?</AlertDialogTitle>
                <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
