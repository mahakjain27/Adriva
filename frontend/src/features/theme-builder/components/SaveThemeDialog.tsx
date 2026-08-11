import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Company } from "@/features/companies/types"
import type { ProfileThemeName } from "@/features/profiles/theme"
import { useCreateSavedTheme } from "@/features/theme-library/hooks/useSavedThemes"
import type { CompanyTypography } from "../curatedFonts"
import type { MotionStyle } from "../deriveMotionTokens"
import type { CompanyStyle } from "../deriveStyleTokens"

export interface SaveThemeDialogProps {
  trigger: ReactNode
  baseTheme: ProfileThemeName
  brand: Company["brand"]
  style: CompanyStyle
  typography: CompanyTypography
  motion: MotionStyle
  defaultName?: string
}

/** Name-prompt only — everything else is already configured in the builder. */
export function SaveThemeDialog({
  trigger,
  baseTheme,
  brand,
  style,
  typography,
  motion,
  defaultName = "",
}: SaveThemeDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultName)
  const navigate = useNavigate()
  const createTheme = useCreateSavedTheme()

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    const theme = await createTheme.mutateAsync({ name: trimmed, baseTheme, brand, style, typography, motion })
    toast.success("Theme saved to library", { description: theme.name })
    setOpen(false)
    navigate("/dashboard/theme-library")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setName(defaultName)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Theme Library</DialogTitle>
          <DialogDescription>
            Base Theme, Brand, Ombre, Style, Typography, and Motion are all captured as one reusable theme.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="theme-name">Theme name</Label>
          <Input
            id="theme-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="e.g. Emerald Luxury"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || createTheme.isPending}>
            {createTheme.isPending ? "Saving…" : "Save Theme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
