import { clearAdminKey, getAdminKey } from "./adminAuth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseError(response: Response): Promise<never> {
  let detail = response.statusText
  try {
    const body = await response.json()
    if (typeof body?.detail === "string") detail = body.detail
  } catch {
    // Non-JSON error body — fall back to statusText.
  }
  throw new ApiError(response.status, detail)
}

/**
 * The single fetch wrapper every real service call goes through — base URL,
 * JSON headers, and consistent error unwrapping (FastAPI's `{"detail": "..."}`
 * shape) live here once, so each `*Service.ts` file stays a thin, readable
 * mapping from its existing mock function signatures to real HTTP calls.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!response.ok) await parseError(response)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "POST", body: formData })
  if (!response.ok) await parseError(response)
  return response.json() as Promise<T>
}

/**
 * Every private management endpoint (companies/employees/products/themes/
 * uploads — everything except the public profile routes) goes through this
 * instead of `apiFetch`, so it carries the admin key AdminAccessGate stored
 * in localStorage. A 401 means the key was never set, is wrong, or the
 * server rotated it — clearing it here makes AdminAccessGate re-prompt on
 * the next render rather than looping the same rejected request.
 */
export async function apiFetchAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const key = getAdminKey()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
      ...init?.headers,
    },
  })
  if (response.status === 401) clearAdminKey()
  if (!response.ok) await parseError(response)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function apiUploadAdmin<T>(path: string, formData: FormData): Promise<T> {
  const key = getAdminKey()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers: key ? { Authorization: `Bearer ${key}` } : undefined,
  })
  if (response.status === 401) clearAdminKey()
  if (!response.ok) await parseError(response)
  return response.json() as Promise<T>
}
