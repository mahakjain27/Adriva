import type { Company, CompanyBrandColors, CompanySocialLinks } from "@/features/companies/types"
import type { ContactEntry, CustomButton, EmployeeSocialLinks, WorkingHoursEntry } from "@/features/employees/types"
import { apiFetch } from "@/lib/apiClient"
import type { ProfileThemeName } from "@/features/profiles/theme"
import type { BrandingMode } from "@/features/profiles/types"

/**
 * The shape `GET /api/public/profiles/{companySlug}/{employeeSlug}` returns
 * — see backend/app/schemas/public_profile.py. Deliberately not the full
 * `Company`/`Employee` types (no createdAt/updatedAt — the backend strips
 * admin-only audit metadata before this ever reaches a public route), which
 * is exactly why toProfileData.ts's employeeToProfileData() was narrowed to
 * `Pick<>` inputs rather than requiring the full types.
 */
export interface PublicProfileCompany {
  id: string
  slug: string
  name: string
  logoPath: string
  website: string
  about: string
  address: string
  socialLinks: CompanySocialLinks
  brandColors: CompanyBrandColors
  defaultTheme: string
  brandingMode: BrandingMode
  brand: Company["brand"]
  style: Company["style"]
  typography: Company["typography"]
  motion: Company["motion"]
}

export interface PublicProfileEmployee {
  id: string
  slug: string
  photoPath: string
  name: string
  designation: string
  phones: ContactEntry[]
  whatsapp: string
  emails: ContactEntry[]
  websites: ContactEntry[]
  social: EmployeeSocialLinks
  address: string
  mapsUrl: string
  workingHours: WorkingHoursEntry[]
  customButtons: CustomButton[]
  theme: ProfileThemeName
  nfcCard: Record<string, unknown> | null
}

export interface PublicProfileProduct {
  id: string
  name: string
  price: string
  imagePaths: string[]
  category: string
  sortOrder: number
}

export interface PublicProfileResponse {
  company: PublicProfileCompany
  employee: PublicProfileEmployee
  products: PublicProfileProduct[]
}

export async function getPublicProfile(
  companySlug: string,
  employeeSlug: string,
): Promise<PublicProfileResponse> {
  return apiFetch<PublicProfileResponse>(
    `/api/public/profiles/${encodeURIComponent(companySlug)}/${encodeURIComponent(employeeSlug)}`,
  )
}

export function getVCardDownloadUrl(companySlug: string, employeeSlug: string): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  return `${apiBaseUrl}/api/public/profiles/${encodeURIComponent(companySlug)}/${encodeURIComponent(employeeSlug)}/vcard`
}
