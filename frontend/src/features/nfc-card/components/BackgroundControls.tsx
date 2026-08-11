import { UploadZone } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CURATED_FONT_CATEGORIES, type CuratedFont } from "@/features/theme-builder/curatedFonts"
import { CARD_HEIGHT_PX, CARD_WIDTH_PX } from "./CardCanvas"
import type { NfcCardSide } from "../types"

const QUICK_COLORS = ["#0f172a", "#111111", "#7b1f2f", "#0f6b4f", "#1e40af", "#6d28d9", "#c9a227"]

export interface BackgroundControlsProps {
  side: NfcCardSide
  uploadPath: string
  onChange: (patch: Partial<NfcCardSide>) => void
}

/** Background color/image + text color + one shared font for this side of the card. */
export function BackgroundControls({ side, uploadPath, onChange }: BackgroundControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Background Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={side.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value, backgroundImagePath: null })}
            className="h-9 w-12 shrink-0 p-1"
          />
          <span className="font-mono text-xs text-muted-foreground uppercase">{side.backgroundColor}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => onChange({ backgroundColor: color, backgroundImagePath: null })}
              className="size-6 rounded-full border border-[var(--border)] transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Background Image</Label>
        <UploadZone
          value={side.backgroundImagePath}
          onChange={(path) => onChange({ backgroundImagePath: path })}
          uploadPath={uploadPath}
          shape="square"
          cropAspectRatio={CARD_WIDTH_PX / CARD_HEIGHT_PX}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Text Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={side.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-9 w-12 shrink-0 p-1"
          />
          <span className="font-mono text-xs text-muted-foreground uppercase">{side.textColor}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Font</Label>
        <Select value={side.fontFamily} onValueChange={(v) => onChange({ fontFamily: v as CuratedFont })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURATED_FONT_CATEGORIES.map((group) => (
              <SelectGroup key={group.category}>
                <SelectLabel>{group.category}</SelectLabel>
                {group.fonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
