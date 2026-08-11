import { Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { extractLogoColor } from "../utils/extractLogoColor"

export interface BrandSectionProps {
  value: string
  onChange: (color: string) => void
  logoPath: string
}

const QUICK_COLORS = [
  { label: "Burgundy", value: "#7b1f2f" },
  { label: "Emerald", value: "#0f6b4f" },
  { label: "Royal Blue", value: "#1e40af" },
  { label: "Coral", value: "#f4634f" },
  { label: "Black", value: "#111111" },
  { label: "Gold", value: "#c9a227" },
  { label: "Purple", value: "#6d28d9" },
] as const

/**
 * One color, nothing else — the system derives everything downstream
 * (see derivePalette.ts). Secondary/border/icon/text/glow/glass-tint colors
 * are deliberately never exposed here.
 */
export function BrandSection({ value, onChange, logoPath }: BrandSectionProps) {
  const [extracting, setExtracting] = useState(false)

  async function handleUseLogoColors() {
    if (!logoPath) {
      toast.error("This company doesn't have a logo yet")
      return
    }
    setExtracting(true)
    const color = await extractLogoColor(logoPath)
    setExtracting(false)
    if (!color) {
      toast.error("Couldn't read this image's colors")
      return
    }
    onChange(color)
    toast.success("Brand color set from logo")
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Brand Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 shrink-0 p-1"
          />
          <span className="font-mono text-sm text-muted-foreground uppercase">{value}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_COLORS.map((swatch) => (
            <button
              key={swatch.label}
              type="button"
              title={swatch.label}
              aria-label={swatch.label}
              onClick={() => onChange(swatch.value)}
              className="size-6 rounded-full border border-[var(--border)] transition-transform hover:scale-110"
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={extracting}
        onClick={handleUseLogoColors}
      >
        <Sparkles /> {extracting ? "Reading logo…" : "Use Company Logo Colors"}
      </Button>
    </div>
  )
}
