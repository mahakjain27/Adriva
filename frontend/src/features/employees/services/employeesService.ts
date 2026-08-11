import { ApiError, apiFetch } from "@/lib/apiClient"
import type { Employee, EmployeeInput } from "../types"

/** Real backend calls — see backend/app/api/employees.py. Function names/signatures are unchanged from the previous in-memory mock. */

export async function listEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>("/api/employees")
}

export async function listEmployeesByCompany(companyId: string): Promise<Employee[]> {
  return apiFetch<Employee[]>(`/api/companies/${companyId}/employees`)
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
  try {
    return await apiFetch<Employee>(`/api/employees/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  return apiFetch<Employee>(`/api/companies/${input.companyId}/employees`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

/** Identity assets (slug/URL/QR/vCard) are assigned once at creation and never change on edit — enforced server-side (see employees.py's update_employee). */
export async function updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
  return apiFetch<Employee>(`/api/employees/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiFetch<void>(`/api/employees/${id}`, { method: "DELETE" })
}

export async function duplicateEmployee(id: string): Promise<Employee> {
  return apiFetch<Employee>(`/api/employees/${id}/duplicate`, { method: "POST" })
}
