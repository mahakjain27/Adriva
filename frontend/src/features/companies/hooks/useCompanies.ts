import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
} from "../services/companiesService"
import type { CompanyInput } from "../types"

export const companyKeys = {
  all: ["companies"] as const,
  detail: (id: string) => ["companies", id] as const,
}

export function useCompanies() {
  return useQuery({ queryKey: companyKeys.all, queryFn: listCompanies })
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(id ?? ""),
    queryFn: () => getCompany(id!),
    enabled: Boolean(id),
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CompanyInput) => createCompany(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyInput }) => updateCompany(id, input),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(company.id) })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
    },
  })
}
