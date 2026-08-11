import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import { employeeToProfileData } from "@/features/employees/utils/toProfileData"
import { getProfileTheme } from "@/features/profiles/theme"
import { getPublicProfile } from "./services/publicProfileService"
import { ProfileEngine } from "./ProfileEngine"

/**
 * The actual public-facing route (`/:companySlug/:employeeSlug`, see
 * routes/AppRouter.tsx) — previously nothing served this; `getProfileUrl()`
 * only ever built a URL string for QR/vCard display, and ProfileEngine only
 * ever rendered inside the admin's EmployeeDetailPage preview. This is new,
 * but it changes nothing about ProfileEngine or the five themes themselves
 * — it just fetches real data and reuses employeeToProfileData() exactly as
 * the admin preview already does.
 */
export function PublicProfilePage() {
  const { companySlug, employeeSlug } = useParams<{ companySlug: string; employeeSlug: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-profile", companySlug, employeeSlug],
    queryFn: () => getPublicProfile(companySlug!, employeeSlug!),
    enabled: Boolean(companySlug && employeeSlug),
    retry: false,
  })

  if (isLoading) {
    return <div className="flex min-h-[100dvh] items-center justify-center bg-white" aria-busy="true" />
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <p className="text-lg font-semibold text-neutral-900">Profile not found</p>
        <p className="text-sm text-neutral-500">This link may be out of date, or the profile may have been removed.</p>
      </div>
    )
  }

  const { company, employee, products } = data
  const profileData = employeeToProfileData(employee, company, products)
  const profileTheme = getProfileTheme(employee.theme)

  return <ProfileEngine profile={profileData} theme={profileTheme} />
}
