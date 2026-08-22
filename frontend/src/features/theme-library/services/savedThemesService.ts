import { ApiError, apiFetchAdmin as apiFetch } from "@/lib/apiClient"
import type { SavedTheme, SavedThemeInput } from "../types"

/** Real backend calls — see backend/app/api/themes.py. Function names/signatures are unchanged from the previous in-memory mock. */

export async function listSavedThemes(): Promise<SavedTheme[]> {
  return apiFetch<SavedTheme[]>("/api/themes")
}

export async function getSavedTheme(id: string): Promise<SavedTheme | undefined> {
  try {
    return await apiFetch<SavedTheme>(`/api/themes/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export async function createSavedTheme(input: SavedThemeInput): Promise<SavedTheme> {
  return apiFetch<SavedTheme>("/api/themes", { method: "POST", body: JSON.stringify(input) })
}

export async function updateSavedTheme(
  id: string,
  input: Partial<SavedThemeInput> & { favorite?: boolean },
): Promise<SavedTheme> {
  return apiFetch<SavedTheme>(`/api/themes/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

export async function deleteSavedTheme(id: string): Promise<void> {
  await apiFetch<void>(`/api/themes/${id}`, { method: "DELETE" })
}

export async function duplicateSavedTheme(id: string): Promise<SavedTheme> {
  return apiFetch<SavedTheme>(`/api/themes/${id}/duplicate`, { method: "POST" })
}
