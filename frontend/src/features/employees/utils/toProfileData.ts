import type { Company } from "@/features/companies/types"
import type { Product } from "@/features/products/types"
import type { ProfileData, ProfileQuickAction } from "@/features/profiles/types"
import { deriveProfileBranding } from "@/features/theme-builder/deriveProfileBranding"
import type { Employee } from "../types"
import { resolveEmployeeAddress, resolveEmployeeSocial } from "./resolveInheritedContact"

/**
 * Only the fields this file actually reads — narrowed with `Pick`, same
 * pattern resolveInheritedContact.ts already uses. This lets both the admin
 * flow (which has full `Employee`/`Company`/`Product` objects already
 * in-memory) and the public profile route (which fetches the trimmed,
 * audit-metadata-stripped shape the public API returns — see
 * schemas/public_profile.py) call this same function without either side
 * needing to fake fields the other doesn't have.
 */
type ProfileCompanyInput = Pick<
  Company,
  | "name"
  | "about"
  | "logoPath"
  | "website"
  | "socialLinks"
  | "address"
  | "brand"
  | "brandingMode"
  | "style"
  | "typography"
  | "motion"
>
type ProfileEmployeeInput = Pick<
  Employee,
  | "name"
  | "designation"
  | "photoPath"
  | "mapsUrl"
  | "workingHours"
  | "phones"
  | "whatsapp"
  | "emails"
  | "websites"
  | "social"
  | "customButtons"
  | "address"
>
type ProfileProductInput = Pick<Product, "id" | "name" | "price" | "imagePaths" | "category">

const SOCIAL_LABELS: Record<keyof Employee["social"], string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
  youtube: "YouTube",
}

/**
 * Flattens every contact source into one ordered list — QuickActions
 * itself just renders whatever array it's given, so all the "multiple X"
 * richness (and the company-level inheritance) lives entirely in how this
 * list gets built. Website and each social platform fall back to the
 * company's own value whenever the employee left theirs blank — see
 * `resolveInheritedContact.ts`, the single place that fallback rule lives.
 */
function buildQuickActions(employee: ProfileEmployeeInput, company: ProfileCompanyInput): ProfileQuickAction[] {
  const actions: ProfileQuickAction[] = []

  for (const entry of employee.phones) {
    if (!entry.value) continue
    actions.push({ id: `phone-${entry.id}`, label: entry.label || "Call", icon: "phone", href: `tel:${entry.value}` })
  }

  if (employee.whatsapp) {
    actions.push({
      id: "whatsapp",
      label: "WhatsApp",
      icon: "whatsapp",
      href: `https://wa.me/${employee.whatsapp.replace(/[^0-9]/g, "")}`,
    })
  }

  for (const entry of employee.emails) {
    if (!entry.value) continue
    actions.push({ id: `email-${entry.id}`, label: entry.label || "Email", icon: "mail", href: `mailto:${entry.value}` })
  }

  const customWebsites = employee.websites.filter((entry) => entry.value)
  if (customWebsites.length > 0) {
    for (const entry of customWebsites) {
      actions.push({ id: `website-${entry.id}`, label: entry.label || "Website", icon: "globe", href: entry.value })
    }
  } else if (company.website) {
    actions.push({ id: "website-company", label: "Website", icon: "globe", href: company.website })
  }

  const social = resolveEmployeeSocial(employee, company)
  for (const platform of Object.keys(SOCIAL_LABELS) as (keyof Employee["social"])[]) {
    const url = social[platform]
    if (!url) continue
    actions.push({ id: `social-${platform}`, label: SOCIAL_LABELS[platform], icon: platform, href: url })
  }

  for (const button of employee.customButtons) {
    if (!button.label || !button.url) continue
    actions.push({ id: `custom-${button.id}`, label: button.label, icon: button.icon, href: button.url })
  }

  return actions
}

/** Maps a Company + Employee record into the shape the real ProfileEngine renders. */
export function employeeToProfileData(
  employee: ProfileEmployeeInput,
  company: ProfileCompanyInput,
  products: ProfileProductInput[],
): ProfileData {
  return {
    hero: {
      name: employee.name,
      title: employee.designation,
      company: company.name,
      avatarUrl: employee.photoPath,
      logoUrl: company.logoPath,
    },
    quickActions: buildQuickActions(employee, company),
    about: { bio: company.about },
    // Already sorted by sortOrder — listProductsByCompany does that, not this function.
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imagePaths[0] ?? "",
      category: p.category || undefined,
    })),
    location: { address: resolveEmployeeAddress(employee, company), mapUrl: employee.mapsUrl },
    workingHours: employee.workingHours,
    branding: deriveProfileBranding(company),
  }
}
