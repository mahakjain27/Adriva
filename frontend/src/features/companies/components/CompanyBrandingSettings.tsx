import { Check } from "lucide-react"
import { toast } from "sonner"
import type { BrandingMode } from "@/features/profiles/types"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUpdateCompany } from "../hooks/useCompanies"
import type { Company } from "../types"

const options: { value: BrandingMode; label: string; description: string }[] = [
  {
    value: "powered",
    label: "Powered by Adriva",
    description: "A minimal \"Powered by Adriva\" footer appears on every profile.",
  },
  {
    value: "white-label",
    label: "White-label",
    description: "No Adriva branding anywhere — the client's brand stands alone.",
  },
]

export function CompanyBrandingSettings({ company }: { company: Company }) {
  const updateCompany = useUpdateCompany()

  function setBrandingMode(value: BrandingMode) {
    const { id, slug: _slug, createdAt: _createdAt, ...input } = company
    updateCompany.mutate(
      { id, input: { ...input, brandingMode: value } },
      { onSuccess: () => toast.success("Branding updated") },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Controls how Adriva's own branding appears across every employee profile at{" "}
        {company.name}.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = company.brandingMode === option.value

          return (
            <Card
              key={option.value}
              role="button"
              onClick={() => setBrandingMode(option.value)}
              className={cn(
                "cursor-pointer transition-shadow hover:shadow-md",
                isSelected && "ring-2 ring-[var(--accent)]",
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle>{option.label}</CardTitle>
                {isSelected && <Check size={16} className="text-[var(--accent)]" />}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
