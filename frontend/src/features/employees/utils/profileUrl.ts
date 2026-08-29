import type { Employee } from "../types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * The permanent link for anything printed or burned onto physical media —
 * QR codes, NFC chips — that can't be updated after the fact. Company slugs
 * aren't stable (companies.py's update_company recomputes the slug from the
 * company name on every save), so this never encodes a slug directly: it
 * points at the backend's `/c/{employeeId}` redirect (see profiles.py),
 * keyed on the employee's permanent id, which resolves to wherever that
 * employee's slug pair currently lives and 302s there. A company rename
 * updates the redirect target instead of breaking every card already
 * printed or tapped into someone's wallet.
 */
export function getProfileUrl(employee: Pick<Employee, "id">) {
  return `${API_BASE_URL}/c/${employee.id}`
}
