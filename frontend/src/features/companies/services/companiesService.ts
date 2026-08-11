import { ApiError, apiFetch } from "@/lib/apiClient"
import type { Company, CompanyInput } from "../types"

/** Real backend calls — see backend/app/api/companies.py. Function names/signatures are unchanged from the previous in-memory mock, so useCompanies.ts and every caller need no changes. */

export async function listCompanies(): Promise<Company[]> {
  return apiFetch<Company[]>("/api/companies")
}

export async function getCompany(id: string): Promise<Company | undefined> {
  try {
    return await apiFetch<Company>(`/api/companies/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  return apiFetch<Company>("/api/companies", { method: "POST", body: JSON.stringify(input) })
}

export async function updateCompany(id: string, input: CompanyInput): Promise<Company> {
  return apiFetch<Company>(`/api/companies/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

export async function deleteCompany(id: string): Promise<void> {
  await apiFetch<void>(`/api/companies/${id}`, { method: "DELETE" })
}
