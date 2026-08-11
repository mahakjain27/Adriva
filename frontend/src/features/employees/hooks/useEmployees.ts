import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createEmployee,
  deleteEmployee,
  duplicateEmployee,
  getEmployee,
  listEmployees,
  listEmployeesByCompany,
  updateEmployee,
} from "../services/employeesService"
import type { EmployeeInput } from "../types"

export const employeeKeys = {
  all: ["employees", "all"] as const,
  byCompany: (companyId: string) => ["employees", "company", companyId] as const,
  detail: (id: string) => ["employees", id] as const,
}

function invalidateEmployeeLists(queryClient: ReturnType<typeof useQueryClient>, companyId?: string) {
  queryClient.invalidateQueries({ queryKey: employeeKeys.all })
  if (companyId) {
    queryClient.invalidateQueries({ queryKey: employeeKeys.byCompany(companyId) })
  }
}

export function useEmployees() {
  return useQuery({ queryKey: employeeKeys.all, queryFn: listEmployees })
}

export function useEmployeesByCompany(companyId: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.byCompany(companyId ?? ""),
    queryFn: () => listEmployeesByCompany(companyId!),
    enabled: Boolean(companyId),
  })
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ""),
    queryFn: () => getEmployee(id!),
    enabled: Boolean(id),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: (employee) => invalidateEmployeeLists(queryClient, employee.companyId),
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) => updateEmployee(id, input),
    onSuccess: (employee) => {
      invalidateEmployeeLists(queryClient, employee.companyId)
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => invalidateEmployeeLists(queryClient),
  })
}

export function useDuplicateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateEmployee(id),
    onSuccess: (employee) => invalidateEmployeeLists(queryClient, employee.companyId),
  })
}
