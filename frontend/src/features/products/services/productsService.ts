import { apiFetch } from "@/lib/apiClient"
import type { Product, ProductInput } from "../types"

/** Real backend calls — see backend/app/api/products.py. Function names/signatures are unchanged from the previous in-memory mock. */

export async function listProductsByCompany(companyId: string): Promise<Product[]> {
  return apiFetch<Product[]>(`/api/companies/${companyId}/products`)
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return apiFetch<Product>(`/api/companies/${input.companyId}/products`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(input) })
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/api/products/${id}`, { method: "DELETE" })
}

/** Persists a new drag-to-reorder result — `orderedIds` is the full, current display order for one company. */
export async function reorderProducts(companyId: string, orderedIds: string[]): Promise<Product[]> {
  return apiFetch<Product[]>(`/api/companies/${companyId}/products/reorder`, {
    method: "PUT",
    body: JSON.stringify({ orderedIds }),
  })
}
