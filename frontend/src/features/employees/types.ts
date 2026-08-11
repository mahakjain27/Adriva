import type { NfcCardDesign } from "@/features/nfc-card/types"
import type { CustomButtonIcon } from "@/features/profiles/quickActionIcons"
import type { ProfileThemeName } from "@/features/profiles/theme"

/** A repeatable phone/email/website row — `label` is optional (e.g. "Work", "Mobile"), blank falls back to a generic default at render time. */
export interface ContactEntry {
  id: string
  label: string
  value: string
}

export interface EmployeeSocialLinks {
  linkedin: string
  instagram: string
  facebook: string
  twitter: string
  youtube: string
}

/** Free text, not a time-picker — "9:00 AM – 6:00 PM" or "Closed", matches the app's curated-not-overengineered controls elsewhere. */
export interface WorkingHoursEntry {
  day: string
  hours: string
}

export interface CustomButton {
  id: string
  label: string
  url: string
  icon: CustomButtonIcon
}

export interface Employee {
  id: string
  companyId: string
  slug: string
  /** Relative path to the uploaded photo (a `blob:` URL until a real backend exists) — never a pasted external URL. */
  photoPath: string
  name: string
  designation: string
  /** At least one required — same as the single `phone` field this replaces. */
  phones: ContactEntry[]
  whatsapp: string
  emails: ContactEntry[]
  websites: ContactEntry[]
  social: EmployeeSocialLinks
  /** Per-employee override — falls back to the company's address on the public profile when blank. */
  address: string
  mapsUrl: string
  workingHours: WorkingHoursEntry[]
  customButtons: CustomButton[]
  theme: ProfileThemeName
  /** Printable NFC card front/back layout — `null` until the admin opens the designer and saves one. */
  nfcCard: NfcCardDesign | null
  createdAt: string
}

export type EmployeeInput = Omit<Employee, "id" | "slug" | "createdAt">
