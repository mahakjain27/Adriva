import type { ProfileData } from "../types"

/**
 * Dev-only fixture for the /playground route. Not shipped to real profiles.
 *
 * Intentionally a real client (not Adriva) so the white-label behavior is
 * visible in the playground: the client's own brand dominates the card and
 * Adriva appears only in the tiny "Powered by" footer.
 */
export const mockProfile: ProfileData = {
  hero: {
    name: "Aditya Kothari",
    title: "Business Development Manager",
    company: "Aadrik Distributors Pvt. Ltd.",
    avatarUrl: "",
    logoUrl: "",
  },
  quickActions: [
    { id: "call", label: "Call", icon: "phone", href: "tel:+10000000000" },
    { id: "whatsapp", label: "WhatsApp", icon: "whatsapp", href: "https://wa.me/10000000000" },
    { id: "email", label: "Email", icon: "mail", href: "mailto:hello@aadrik.com" },
    { id: "website", label: "Website", icon: "globe", href: "https://aadrik.com" },
  ],
  about: {
    bio: "Aadrik Distributors Pvt. Ltd. is a trusted partner for industrial materials and supplies — delivering reliable quality, transparent pricing, and dependable service to businesses across the region.",
  },
  products: [
    { id: "p1", name: "CO₂ Wire", price: "Custom quote", imageUrl: "" },
    { id: "p2", name: "Grinding", price: "Custom quote", imageUrl: "" },
    { id: "p3", name: "Safety", price: "Custom quote", imageUrl: "" },
  ],
  location: {
    address: "142 Spring St, New York, NY",
    mapUrl: "",
  },
  branding: {
    mode: "powered",
  },
}
