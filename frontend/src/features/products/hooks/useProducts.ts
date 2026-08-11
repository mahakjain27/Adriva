import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createProduct,
  deleteProduct,
  listProductsByCompany,
  reorderProducts,
  updateProduct,
} from "../services/productsService"
import type { ProductInput } from "../types"

export const productKeys = {
  byCompany: (companyId: string) => ["products", "company", companyId] as const,
}

export function useProductsByCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: productKeys.byCompany(companyId ?? ""),
    queryFn: () => listProductsByCompany(companyId!),
    enabled: Boolean(companyId),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.byCompany(product.companyId) })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => updateProduct(id, input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.byCompany(product.companyId) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; companyId: string }) => deleteProduct(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.byCompany(variables.companyId) })
    },
  })
}

export function useReorderProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, orderedIds }: { companyId: string; orderedIds: string[] }) =>
      reorderProducts(companyId, orderedIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.byCompany(variables.companyId) })
    },
  })
}
