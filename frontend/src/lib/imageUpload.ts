import { apiUploadAdmin as apiUpload } from "./apiClient"

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Returns an error message if the file fails validation, otherwise null. Mirrors the backend's own validation (upload_service.py) so a bad file is rejected instantly, before ever reaching the network. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Only JPG, PNG, or WEBP images are allowed."
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5MB or smaller."
  }
  return null
}

interface UploadResponse {
  path: string
  url: string
  filename: string
  mimeType: string
  size: number
}

/**
 * Every existing caller's `uploadPath` already encodes what kind of asset
 * this is (e.g. `companies/{id}/logo`, `companies/{id}/employees/photo`,
 * `companies/{id}/products/image`) — the backend only needs one of its
 * three storage categories, not the full descriptive path, so this infers
 * it rather than requiring every call site to be rewritten to pass a
 * separate category prop.
 */
function inferCategory(uploadPath: string): "companies" | "employees" | "products" {
  if (uploadPath.includes("/nfc-card/") || uploadPath.includes("/employees/")) return "employees"
  if (uploadPath.includes("/products/")) return "products"
  return "companies"
}

/**
 * Uploads to the real backend (`POST /api/uploads`) and returns the
 * permanent, backend-served path — same signature as the previous
 * `mockUploadImage` (file, path, onProgress) => Promise<string>, so
 * `UploadZone` and every form dialog using it are unchanged. Progress is
 * reported in two steps (upload start/complete) rather than granular
 * percentages — `fetch` doesn't expose upload progress without falling back
 * to `XMLHttpRequest`, and a two-step indicator is enough to show something
 * is happening for images this small (max 5MB).
 */
export async function uploadImage(
  file: File,
  uploadPath: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  onProgress(15)
  const formData = new FormData()
  formData.append("file", file)
  formData.append("category", inferCategory(uploadPath))
  const result = await apiUpload<UploadResponse>("/api/uploads", formData)
  onProgress(100)
  // The absolute URL, not the bare relative path — every caller renders this
  // directly as an <img src>, and the frontend/backend are different origins
  // (different ports in dev, different domains in production), so a
  // root-relative "/uploads/..." path would resolve against the wrong host.
  return result.url
}
