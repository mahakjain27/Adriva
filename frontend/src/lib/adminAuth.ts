const STORAGE_KEY = "adriva_admin_key"

/**
 * Deliberately localStorage, not a `VITE_*` build-time env var — this app's
 * public digital-card route (`/:companySlug/:employeeSlug`) ships in the
 * same bundle as the dashboard, so anything baked in at build time would be
 * readable by every anonymous card visitor. The key only ever exists in the
 * operator's own browser, entered once via AdminAccessGate.
 */
export function getAdminKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setAdminKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearAdminKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}
