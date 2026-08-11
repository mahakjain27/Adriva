import type { Company } from "@/features/companies/types"
import type { Employee, EmployeeSocialLinks } from "../types"

/** Every inheritable social platform — kept as one list so ProfileEngine's quick actions, the vCard export, and the admin form's "inherited" hints all iterate the exact same set. */
export const SOCIAL_PLATFORMS = ["linkedin", "instagram", "facebook", "twitter", "youtube"] as const

/**
 * The employee's own value wins whenever it's set; otherwise falls back to
 * the company-wide value. Resolved here once so the live profile
 * (`toProfileData.ts`), the vCard export, and the admin form's "Using
 * Company…" hints can never disagree about what's actually shown —
 * nothing is duplicated into the employee record itself.
 */
export function resolveEmployeeAddress(
  employee: Pick<Employee, "address">,
  company: Pick<Company, "address">,
): string {
  return employee.address || company.address
}

/** A single "primary" website for contexts (like the vCard) that only want one URL — the first custom entry if any exist, otherwise the company's. The live profile's quick-action row still shows *every* custom entry when there are several; this is only a one-value convenience. */
export function resolveEmployeePrimaryWebsite(
  employee: Pick<Employee, "websites">,
  company: Pick<Company, "website">,
): string {
  return employee.websites.find((entry) => entry.value)?.value || company.website
}

export function resolveEmployeeSocial(
  employee: Pick<Employee, "social">,
  company: Pick<Company, "socialLinks">,
): EmployeeSocialLinks {
  return {
    linkedin: employee.social.linkedin || company.socialLinks.linkedin || "",
    instagram: employee.social.instagram || company.socialLinks.instagram || "",
    facebook: employee.social.facebook || company.socialLinks.facebook || "",
    twitter: employee.social.twitter || company.socialLinks.twitter || "",
    youtube: employee.social.youtube || company.socialLinks.youtube || "",
  }
}
