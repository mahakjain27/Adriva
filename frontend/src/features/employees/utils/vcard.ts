import type { Company } from "@/features/companies/types"
import type { Employee } from "../types"
import { resolveEmployeeAddress, resolveEmployeePrimaryWebsite } from "./resolveInheritedContact"

/** Real VCARD 3.0 text — importable by any phone's contacts app. vCard 3.0 allows repeated TEL/EMAIL/URL lines, one per entry. Address and website fall back to the company's own value when the employee left theirs blank, same as the live profile. */
export function buildVCard(employee: Employee, company: Company): string {
  const address = resolveEmployeeAddress(employee, company)
  const customWebsites = employee.websites.filter((w) => w.value)
  const websiteLines =
    customWebsites.length > 0
      ? customWebsites.map((w) => `URL:${w.value}`)
      : [resolveEmployeePrimaryWebsite(employee, company)].filter(Boolean).map((url) => `URL:${url}`)

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${employee.name};;;;`,
    `FN:${employee.name}`,
    `ORG:${company.name}`,
    `TITLE:${employee.designation}`,
    ...employee.phones.filter((p) => p.value).map((p) => `TEL;TYPE=CELL:${p.value}`),
    employee.whatsapp && `TEL;TYPE=CELL:${employee.whatsapp}`,
    ...employee.emails.filter((e) => e.value).map((e) => `EMAIL:${e.value}`),
    ...websiteLines,
    address && `ADR;TYPE=WORK:;;${address};;;;`,
    "END:VCARD",
  ].filter(Boolean)

  return lines.join("\n")
}

export function downloadVCard(employee: Employee, company: Company) {
  const blob = new Blob([buildVCard(employee, company)], { type: "text/vcard" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${employee.slug}.vcf`
  anchor.click()
  URL.revokeObjectURL(url)
}
