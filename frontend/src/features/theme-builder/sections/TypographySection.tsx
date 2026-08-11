import { cn } from "@/lib/utils"
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { CURATED_FONT_CATEGORIES, TYPOGRAPHY_PRESETS, type CompanyTypography, type CuratedFont } from "../curatedFonts"

export interface TypographySectionProps {
  value: CompanyTypography
  onChange: (typography: CompanyTypography) => void
}

function FontSelect({ value, onChange }: { value: CuratedFont; onChange: (font: CuratedFont) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CuratedFont)}>
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
  )
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  )
}

/** Curated, minimal — no line-height/tracking-per-element/font-weight sliders, per spec. */
export function TypographySection({ value, onChange }: TypographySectionProps) {
  function set<K extends keyof CompanyTypography>(key: K, next: CompanyTypography[K]) {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-muted-foreground">Preset</p>
        <div className="flex flex-wrap gap-1.5">
          {TYPOGRAPHY_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.values)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                "border-[var(--border)] hover:bg-accent",
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Employee Name</p>
        <FontSelect value={value.nameFont} onChange={(nameFont) => set("nameFont", nameFont)} />
        <SliderField
          label="Size"
          value={value.nameSize}
          onChange={(nameSize) => set("nameSize", nameSize)}
          min={24}
          max={64}
        />
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Italic</Label>
          <Switch checked={value.nameItalic} onCheckedChange={(nameItalic) => set("nameItalic", nameItalic)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Company Name</p>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Uppercase</Label>
          <Switch
            checked={value.companyUppercase}
            onCheckedChange={(companyUppercase) => set("companyUppercase", companyUppercase)}
          />
        </div>
        <SliderField
          label="Letter Spacing"
          value={value.companyLetterSpacing}
          onChange={(companyLetterSpacing) => set("companyLetterSpacing", companyLetterSpacing)}
          min={0}
          max={0.5}
          step={0.01}
          unit="em"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Designation</p>
        <SliderField
          label="Size"
          value={value.designationSize}
          onChange={(designationSize) => set("designationSize", designationSize)}
          min={11}
          max={22}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Section Headings</p>
        <FontSelect value={value.headingFont} onChange={(headingFont) => set("headingFont", headingFont)} />
        <SliderField
          label="Size"
          value={value.headingSize}
          onChange={(headingSize) => set("headingSize", headingSize)}
          min={10}
          max={20}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Buttons</p>
        <SliderField
          label="Font Size"
          value={value.buttonFontSize}
          onChange={(buttonFontSize) => set("buttonFontSize", buttonFontSize)}
          min={12}
          max={22}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
        <SliderField
          label="Icon Size"
          value={value.quickActionIconSize}
          onChange={(quickActionIconSize) => set("quickActionIconSize", quickActionIconSize)}
          min={14}
          max={28}
        />
        <SliderField
          label="Label Size"
          value={value.quickActionLabelSize}
          onChange={(quickActionLabelSize) => set("quickActionLabelSize", quickActionLabelSize)}
          min={9}
          max={16}
        />
      </div>
    </div>
  )
}
