import type { Company } from "@/features/companies/types"
import type { Employee } from "../types"

/** This frontend's own public origin (VITE_PUBLIC_BASE_URL) — the public profile route (/:companySlug/:employeeSlug, see routes/AppRouter.tsx) is served by this app, not the API. */
const PROFILE_BASE_URL = import.meta.env.VITE_PUBLIC_BASE_URL

export function getProfileUrl(company: Pick<Company, "slug">, employee: Pick<Employee, "slug">) {
  return `${PROFILE_BASE_URL}/${company.slug}/${employee.slug}`
}
