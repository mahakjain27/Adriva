import { useState, type ReactNode } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanies, useUpdateCompany } from "@/features/companies/hooks/useCompanies"
import type { SavedTheme } from "../types"

export interface ApplyToCompanyDialogProps {
  theme: SavedTheme
  trigger: ReactNode
}

/**
 * A direct write, not a trip through the Theme Builder — Apply means "use
 * this saved configuration as-is," not "start editing it."
 */
export function ApplyToCompanyDialog({ theme, trigger }: ApplyToCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [companyId, setCompanyId] = useState("")
  const companies = useCompanies()
  const updateCompany = useUpdateCompany()

  async function handleApply() {
    const company = companies.data?.find((c) => c.id === companyId)
    if (!company) return
    const { id, slug: _slug, createdAt: _createdAt, ...input } = company
    await updateCompany.mutateAsync({
      id,
      input: {
        ...input,
        defaultTheme: theme.baseTheme,
        brand: theme.brand,
        style: theme.style,
        typography: theme.typography,
        motion: theme.motion,
      },
    })
    toast.success("Theme applied", { description: company.name })
    setOpen(false)
    setCompanyId("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply "{theme.name}"</DialogTitle>
          <DialogDescription>
            Choose a company — every employee profile there updates instantly.
          </DialogDescription>
        </DialogHeader>
        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.data?.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!companyId || updateCompany.isPending}>
            {updateCompany.isPending ? "Applying…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
