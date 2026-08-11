import type { ProfileData } from "../types"

/** Finds the first quick action whose id has `prefix` and strips `scheme` off its href — e.g. the `tel:`/`mailto:` links `toProfileData.ts` already builds. */
function extractContact(actions: ProfileData["quickActions"], prefix: string, scheme: string): string | undefined {
  const match = actions.find((action) => action.id.startsWith(prefix))
  if (!match || !match.href.startsWith(scheme)) return undefined
  return decodeURIComponent(match.href.slice(scheme.length).split("?")[0])
}

export function getPrimaryEmail(profile: ProfileData): string | undefined {
  return extractContact(profile.quickActions, "email-", "mailto:")
}

export function getWhatsAppHref(profile: ProfileData): string | undefined {
  return profile.quickActions.find((action) => action.id === "whatsapp")?.href
}

export function getMapsSearchHref(profile: ProfileData): string | undefined {
  if (!profile.location.address) return undefined
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location.address)}`
}

/** Real VCARD 3.0 text, built entirely from `ProfileData` — the shape both the admin preview and the public route already have in hand, so no employee/company object is needed here. */
export function buildVCardFromProfile(profile: ProfileData): string {
  const phone = extractContact(profile.quickActions, "phone-", "tel:")
  const email = getPrimaryEmail(profile)
  const website = profile.quickActions.find((action) => action.id.startsWith("website-"))?.href

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${profile.hero.name};;;;`,
    `FN:${profile.hero.name}`,
    `ORG:${profile.hero.company}`,
    `TITLE:${profile.hero.title}`,
    phone && `TEL;TYPE=CELL:${phone}`,
    email && `EMAIL:${email}`,
    website && `URL:${website}`,
    profile.location.address && `ADR;TYPE=WORK:;;${profile.location.address};;;;`,
    "END:VCARD",
  ].filter(Boolean)

  return lines.join("\n")
}

export function downloadVCardFromProfile(profile: ProfileData) {
  const blob = new Blob([buildVCardFromProfile(profile)], { type: "text/vcard" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${profile.hero.name.replace(/\s+/g, "_")}.vcf`
  anchor.click()
  URL.revokeObjectURL(url)
}
