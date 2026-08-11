import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { SCALE_RANGE, TEXT_ELEMENT_IDS, type NfcCardSide, type NfcElementConfig, type NfcElementId } from "../types"

const ELEMENT_LABELS: Record<NfcElementId, string> = {
  logo: "Logo",
  qr: "QR Code",
  name: "Name",
  designation: "Designation",
  companyName: "Company Name",
}

export interface ElementsPanelProps {
  side: NfcCardSide
  selectedElementId: NfcElementId | null
  onSelectElement: (id: NfcElementId | null) => void
  onUpdateElement: (id: NfcElementId, patch: Partial<NfcElementConfig>) => void
  /** The real employee/company value each text element falls back to when its own `text` override is empty — shown as the input's placeholder. */
  defaultTextByElement: Partial<Record<NfcElementId, string>>
}

/** One row per element — visibility toggle always visible, controls expand inline for whichever element is currently selected (clicked on the canvas or here): Size/Rotation for every element, plus editable text content and Bold/Italic for the three text elements. */
export function ElementsPanel({
  side,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  defaultTextByElement,
}: ElementsPanelProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {(Object.keys(ELEMENT_LABELS) as NfcElementId[]).map((id) => {
        const config = side.elements[id]
        const isSelected = selectedElementId === id
        const isText = TEXT_ELEMENT_IDS.includes(id)
        const range = SCALE_RANGE[isText ? "text" : "image"]

        return (
          <div
            key={id}
            className={cn(
              "rounded-lg border transition-colors",
              isSelected ? "border-[var(--primary)] bg-accent" : "border-[var(--border)]",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectElement(null)
                    return
                  }
                  onSelectElement(id)
                  // Selecting implies wanting to see/move it — a hidden element has nothing on the
                  // canvas to drag, which otherwise looks exactly like dragging being broken.
                  if (!config.visible) onUpdateElement(id, { visible: true })
                }}
                className="flex-1 text-left"
              >
                {ELEMENT_LABELS[id]}
              </button>
              <button
                type="button"
                onClick={() => onUpdateElement(id, { visible: !config.visible })}
                className="text-muted-foreground hover:text-foreground"
                title={config.visible ? "Hide" : "Show"}
              >
                {config.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            {isSelected && (
              <div className="flex flex-col gap-3 border-t border-[var(--border)] px-3 py-3">
                {isText && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Text</Label>
                    <Input
                      value={config.text}
                      onChange={(ev) => onUpdateElement(id, { text: ev.target.value })}
                      placeholder={defaultTextByElement[id]}
                      className="h-8 text-sm"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">{isText ? "Font Size" : "Size"}</Label>
                    <span className="text-xs text-muted-foreground">
                      {config.scale}
                      {isText ? "px" : "%"}
                    </span>
                  </div>
                  <Slider
                    value={[config.scale]}
                    onValueChange={([v]) => onUpdateElement(id, { scale: v })}
                    min={range.min}
                    max={range.max}
                    step={1}
                  />
                </div>

                {/* QR codes don't rotate — no slider here, and no rotate handle on the canvas either (see DraggableElement's `rotatable` prop). */}
                {id !== "qr" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Rotation</Label>
                      <span className="text-xs text-muted-foreground">{config.rotation}°</span>
                    </div>
                    <Slider
                      value={[config.rotation]}
                      onValueChange={([v]) => onUpdateElement(id, { rotation: v })}
                      min={0}
                      max={359}
                      step={1}
                    />
                  </div>
                )}

                {isText && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={config.bold}
                        onCheckedChange={(v) => onUpdateElement(id, { bold: v })}
                      />
                      <Label className="text-xs text-muted-foreground">Bold</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={config.italic}
                        onCheckedChange={(v) => onUpdateElement(id, { italic: v })}
                      />
                      <Label className="text-xs text-muted-foreground">Italic</Label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
