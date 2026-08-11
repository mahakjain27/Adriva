import { ProfileLayout } from "./ProfileLayout"
import { getMapsSearchHref, getPrimaryEmail, getWhatsAppHref, downloadVCardFromProfile } from "./sections/profileContacts"
import { About, EnquiryForm, Footer, Header, Hero, Location, Products, QuickActions, ScanToChat, WorkingHours } from "./sections"
import type { ProfileTheme } from "./theme"
import type { ProfileData } from "./types"

export interface ProfileEngineProps {
  profile: ProfileData
  theme: ProfileTheme
}

/**
 * Renders a complete digital profile through the one shared structural
 * template: header → hero → quick actions → about → products →
 * scan-to-chat → location → working hours → enquiry → footer. Every
 * section reads its look from `theme` (colors/fonts/spacing/radius/
 * shadows/motion/hero layout/card chrome) — the 5 named themes differ only
 * in the token values `getProfileTheme()` resolves, never in which
 * components render.
 */
export function ProfileEngine({ profile, theme }: ProfileEngineProps) {
  const onSaveContact = () => downloadVCardFromProfile(profile)

  return (
    <ProfileLayout theme={theme} branding={profile.branding} logoUrl={profile.hero.logoUrl}>
      <Header data={profile.hero} onSaveContact={onSaveContact} />
      <Hero data={profile.hero} theme={theme} onSaveContact={onSaveContact} />
      <QuickActions data={profile.quickActions} theme={theme} mapsHref={getMapsSearchHref(profile)} />
      <About data={profile.about} theme={theme} products={profile.products} />
      <Products data={profile.products} theme={theme} />
      <ScanToChat hero={profile.hero} theme={theme} whatsappHref={getWhatsAppHref(profile)} />
      <Location data={profile.location} theme={theme} />
      <WorkingHours data={profile.workingHours} theme={theme} />
      <EnquiryForm enquiryEmail={getPrimaryEmail(profile)} />
      <Footer data={profile.hero} />
    </ProfileLayout>
  )
}
