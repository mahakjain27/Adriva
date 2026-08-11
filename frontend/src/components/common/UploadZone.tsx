import { Pencil, Upload, X } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react"
import { toast } from "sonner"
import { ImageCropDialog } from "@/components/common/ImageCropDialog"
import { uploadImage, validateImageFile } from "@/lib/imageUpload"
import { cn } from "@/lib/utils"

export interface UploadZoneProps {
  /** The current stored path — a `blob:` URL today, a real `/uploads/...` path once a backend exists. Both are valid `<img src>` values. */
  value: string | null | undefined
  onChange: (path: string | null) => void
  /** Future relative storage path, e.g. `companies/{companyId}/logo` — threaded through to `mockUploadImage` for forward-compatibility with the real backend call. */
  uploadPath: string
  label?: string
  /** `circle` for avatars/logos (matches how `Avatar` renders them elsewhere), `square` for product images. */
  shape?: "circle" | "square"
  className?: string
  /**
   * When set, a crop step (react-easy-crop) opens between file selection and
   * upload, locked to this aspect ratio (e.g. `1` for a square/circle
   * avatar, `400/252` for the NFC card's ID-1 ratio). Omit to upload the
   * selected file as-is — the default for callers like the Products form,
   * which weren't asked for cropping.
   */
  cropAspectRatio?: number
}

/**
 * The standard image input across Adriva — replaces every "paste an image
 * URL" text field. Drag-and-drop, click-to-upload, live preview,
 * replace/remove, validation (JPG/PNG/WEBP, 5MB), optional crop step, and
 * upload progress.
 */
export function UploadZone({
  value,
  onChange,
  uploadPath,
  label,
  shape = "square",
  className,
  cropAspectRatio,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevValueRef = useRef(value)

  // Revoke the previous blob URL whenever it's replaced or cleared, and on unmount — real `https://` URLs from old seed data are left alone.
  useEffect(() => {
    const prev = prevValueRef.current
    if (prev && prev !== value && prev.startsWith("blob:")) {
      URL.revokeObjectURL(prev)
    }
    prevValueRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      if (prevValueRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(prevValueRef.current)
      }
    }
  }, [])

  const isUploading = progress !== null

  async function uploadFile(file: File) {
    setProgress(0)
    try {
      const path = await uploadImage(file, uploadPath, setProgress)
      onChange(path)
    } catch {
      toast.error("Upload failed. Please try again.")
    } finally {
      setProgress(null)
    }
  }

  /** Validates the raw picked/dropped file, then either opens the crop step or uploads directly, depending on `cropAspectRatio`. */
  function handleFile(file: File) {
    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      return
    }
    if (cropAspectRatio) {
      setPendingCropFile(file)
      return
    }
    void uploadFile(file)
  }

  function openPicker() {
    if (!isUploading) inputRef.current?.click()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.key === "Enter" || e.key === " ") && !isUploading) {
      e.preventDefault()
      openPicker()
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const radius = shape === "circle" ? "rounded-full" : "rounded-lg"

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <p className="text-sm leading-none font-medium">{label}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      {value && !isUploading ? (
        <div className={cn("group relative size-24 shrink-0 overflow-hidden border border-[var(--border)]", radius)}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={openPicker}
              className="flex size-7 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
              title="Replace"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex size-7 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
              title="Remove"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => {
            e.preventDefault()
            if (!isUploading) setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex w-40 flex-col items-center justify-center gap-1.5 border-2 border-dashed p-4 text-center transition-colors",
            radius === "rounded-full" ? "aspect-square rounded-full" : "rounded-lg",
            isUploading ? "cursor-default" : "cursor-pointer",
            isDragging ? "border-[var(--primary)] bg-accent" : "border-[var(--border)] hover:bg-accent/50",
          )}
        >
          {isUploading ? (
            <>
              <div className="h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-[var(--primary)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
            </>
          ) : (
            <>
              <Upload size={18} className="text-muted-foreground" />
              <p className="text-xs font-medium">Drag & drop or click</p>
              <p className="text-[11px] text-muted-foreground">JPG, PNG, WEBP · up to 5MB</p>
            </>
          )}
        </div>
      )}

      {cropAspectRatio && (
        <ImageCropDialog
          file={pendingCropFile}
          aspectRatio={cropAspectRatio}
          cropShape={shape === "circle" ? "round" : "rect"}
          onCancel={() => setPendingCropFile(null)}
          onCropped={(cropped) => {
            setPendingCropFile(null)
            void uploadFile(cropped)
          }}
        />
      )}
    </div>
  )
}
