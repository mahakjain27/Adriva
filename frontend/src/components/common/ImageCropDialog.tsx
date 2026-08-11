import { useEffect, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { getCroppedImageFile } from "@/lib/cropImage"

/** Below 1, the image renders smaller than the crop frame (letterboxed against the dialog's dark background) — lets the admin shrink a busy/wide logo down instead of only ever cropping in tighter than "fit". */
const MIN_ZOOM = 0.5
const MAX_ZOOM = 3

export interface ImageCropDialogProps {
  file: File | null
  aspectRatio: number
  /** `round` for avatars/logos (matches UploadZone's `shape="circle"`), `rect` for card backgrounds and anything else. */
  cropShape?: "round" | "rect"
  onCancel: () => void
  onCropped: (file: File) => void
}

/**
 * Opt-in crop step between "file selected" and "upload" — see UploadZone's
 * `cropAspectRatio` prop. A fresh object URL is created per file and
 * revoked on close/unmount so this never leaks memory across repeated
 * open/cancel cycles.
 */
export function ImageCropDialog({ file, aspectRatio, cropShape = "rect", onCancel, onCropped }: ImageCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!file) {
      setImageUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function handleApply() {
    if (!file || !imageUrl || !croppedAreaPixels) return
    setIsSaving(true)
    try {
      const cropped = await getCroppedImageFile(imageUrl, croppedAreaPixels, file.name, file.type)
      onCropped(cropped)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={Boolean(file)} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>

        {imageUrl && (
          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-neutral-900">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={aspectRatio}
              cropShape={cropShape}
              showGrid={cropShape === "rect"}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground">Zoom</span>
          <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!croppedAreaPixels || isSaving}>
            {isSaving ? "Applying…" : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
