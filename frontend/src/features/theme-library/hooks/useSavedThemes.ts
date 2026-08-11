import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createSavedTheme,
  deleteSavedTheme,
  duplicateSavedTheme,
  getSavedTheme,
  listSavedThemes,
  updateSavedTheme,
} from "../services/savedThemesService"
import type { SavedThemeInput } from "../types"

export const savedThemeKeys = {
  all: ["saved-themes"] as const,
  detail: (id: string) => ["saved-themes", id] as const,
}

export function useSavedThemes() {
  return useQuery({ queryKey: savedThemeKeys.all, queryFn: listSavedThemes })
}

export function useSavedTheme(id: string | undefined) {
  return useQuery({
    queryKey: savedThemeKeys.detail(id ?? ""),
    queryFn: () => getSavedTheme(id!),
    enabled: Boolean(id),
  })
}

export function useCreateSavedTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SavedThemeInput) => createSavedTheme(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedThemeKeys.all })
    },
  })
}

export function useUpdateSavedTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<SavedThemeInput> & { favorite?: boolean }
    }) => updateSavedTheme(id, input),
    onSuccess: (theme) => {
      queryClient.invalidateQueries({ queryKey: savedThemeKeys.all })
      queryClient.invalidateQueries({ queryKey: savedThemeKeys.detail(theme.id) })
    },
  })
}

export function useDeleteSavedTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSavedTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedThemeKeys.all })
    },
  })
}

export function useDuplicateSavedTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateSavedTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedThemeKeys.all })
    },
  })
}
