import { ChevronLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { toast } from "sonner"
import { useCompany, useUpdateCompany } from "@/features/companies/hooks/useCompanies"
import { useEmployee, useUpdateEmployee } from "@/features/employees/hooks/useEmployees"
import { employeeToProfileData } from "@/features/employees/utils/toProfileData"
import { useProductsByCompany } from "@/features/products/hooks/useProducts"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { getProfileTheme, type ProfileThemeName } from "@/features/profiles/theme"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fadeIn } from "@/components/motion"
import { cn } from "@/lib/utils"
import { PreviewFrame } from "./components/PreviewFrame"
import { SaveThemeDialog } from "./components/SaveThemeDialog"
import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_MOTION,
  DEFAULT_SECOND_COLOR,
  DEFAULT_STYLE,
  DEFAULT_TYPOGRAPHY,
} from "./defaultThemeValues"
import { deriveProfileBranding } from "./deriveProfileBranding"
import type { MotionStyle } from "./deriveMotionTokens"
import type { OmbreMode } from "./derivePalette"
import type { CompanyStyle } from "./deriveStyleTokens"
import type { CompanyTypography } from "./curatedFonts"
import { BaseThemeSection } from "./sections/BaseThemeSection"
import { BrandSection } from "./sections/BrandSection"
import { CollapsibleSection } from "./sections/CollapsibleSection"
import { MotionSection } from "./sections/MotionSection"
import { OmbreSection } from "./sections/OmbreSection"
import { StyleSection } from "./sections/StyleSection"
import { TypographySection } from "./sections/TypographySection"
import { PreviewDeviceToggle, PREVIEW_DEVICE_WIDTH, type PreviewDevice } from "./sections/PreviewDeviceToggle"

/**
 * Triple-mode, all sharing the same state/derivation/controls below:
 * - `/companies/:companyId/employees/:employeeId/theme-builder` — employee
 *   mode. Live-previews THAT employee's actual profile (real photo, name,
 *   contact info, products — via the same `employeeToProfileData` real
 *   rendering uses) instead of the generic mock profile, seeds Base Theme
 *   from the employee's own `theme` field, and on save persists both the
 *   company's shared brand/style/typography/motion *and* this employee's
 *   `theme` — without touching the company's `defaultTheme` (that's a
 *   separate, company-wide "new hires default to" setting).
 * - `/companies/:companyId/theme-builder` — direct company mode (unchanged).
 * - `/theme-builder` (no companyId) — library mode, builds a reusable
 *   SavedTheme instead of saving anywhere directly (unchanged).
 */
export function ThemeBuilderPage() {
  const { companyId, employeeId } = useParams<{ companyId: string; employeeId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isLibraryMode = !companyId
  const isEmployeeMode = Boolean(companyId && employeeId)
  const fromCompanyId = searchParams.get("fromCompany") ?? undefined

  const company = useCompany(companyId)
  const seedCompany = useCompany(isLibraryMode ? fromCompanyId : undefined)
  const employee = useEmployee(isEmployeeMode ? employeeId : undefined)
  const products = useProductsByCompany(isEmployeeMode ? companyId : undefined)
  const updateCompany = useUpdateCompany()
  const updateEmployee = useUpdateEmployee()

  const seedSource = isLibraryMode ? seedCompany.data : company.data
  const seedLoading = (isLibraryMode ? seedCompany.isLoading : company.isLoading) || (isEmployeeMode && employee.isLoading)
  const themeParam = isLibraryMode ? "baseTheme" : "theme"

  const [baseTheme, setBaseTheme] = useState<ProfileThemeName>(
    (searchParams.get(themeParam) as ProfileThemeName) ?? "luxury",
  )
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR)
  const [ombre, setOmbre] = useState<OmbreMode>("off")
  const [secondColor, setSecondColor] = useState(DEFAULT_SECOND_COLOR)
  const [style, setStyle] = useState<CompanyStyle>(DEFAULT_STYLE)
  const [typography, setTypography] = useState<CompanyTypography>(DEFAULT_TYPOGRAPHY)
  const [motionStyle, setMotionStyle] = useState<MotionStyle>(DEFAULT_MOTION)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("mobile")
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || seedLoading) return
    if (seedSource) {
      setBaseTheme((prev) => {
        const fromUrl = searchParams.get(themeParam) as ProfileThemeName | null
        if (fromUrl) return fromUrl
        if (isEmployeeMode) return employee.data?.theme ?? prev
        return isLibraryMode ? prev : (seedSource.defaultTheme ?? prev)
      })
      if (seedSource.brand) {
        setBrandColor(seedSource.brand.color)
        setOmbre(seedSource.brand.ombre)
        setSecondColor(seedSource.brand.secondColor ?? DEFAULT_SECOND_COLOR)
      }
      if (seedSource.style) {
        setStyle(seedSource.style)
      }
      if (seedSource.typography) {
        setTypography(seedSource.typography)
      }
      if (seedSource.motion) {
        setMotionStyle(seedSource.motion)
      }
    }
    setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedSource, seedLoading, initialized])

  if (seedLoading || !initialized) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    )
  }

  if (!isLibraryMode && !company.data) {
    return <p className="p-6 text-muted-foreground">Company not found.</p>
  }

  if (isEmployeeMode && !employee.data) {
    return <p className="p-6 text-muted-foreground">Employee not found.</p>
  }

  const brand = { color: brandColor, ombre, secondColor: ombre === "custom" ? secondColor : undefined }
  const profileTheme = getProfileTheme(baseTheme)
  const liveBranding = deriveProfileBranding({
    brand,
    brandingMode: (isLibraryMode ? seedSource?.brandingMode : company.data?.brandingMode) ?? "powered",
    style,
    typography,
    motion: motionStyle,
  })
  const previewGradient = `linear-gradient(90deg, ${liveBranding.gradientFromColor}, ${liveBranding.gradientMidColor ?? liveBranding.gradientToColor}, ${liveBranding.gradientToColor})`
  // In employee mode the preview is that employee's actual profile (real photo, name, contact
  // info, products, About, Working Hours — everything ProfileEngine already renders for the real
  // public profile), just with the draft branding swapped in. Every other mode keeps the generic
  // mock profile it always used.
  const previewProfile =
    isEmployeeMode && employee.data && company.data
      ? { ...employeeToProfileData(employee.data, company.data, products.data ?? []), branding: liveBranding }
      : { ...mockProfile, branding: liveBranding }
  // Only a Base Theme switch resets scroll — it swaps the whole rendered layout, so an old scroll
  // position may not correspond to anything sensible in the new one. Device/Style/Typography just
  // restyle the same layout in place; resetting scroll for those was disruptive, not helpful, so
  // they were dropped from this key (previously included, per direct user feedback).
  const previewResetKey = baseTheme

  async function handleSave() {
    if (!company.data) return
    const { id, slug: _slug, createdAt: _createdAt, ...input } = company.data
    await updateCompany.mutateAsync({
      id,
      input: {
        ...input,
        // Employee mode edits THIS employee's theme (below), not the company's "new hires default
        // to" setting — leave defaultTheme exactly as it was.
        defaultTheme: isEmployeeMode ? company.data.defaultTheme : baseTheme,
        brand,
        style,
        typography,
        motion: motionStyle,
      },
    })
    if (isEmployeeMode && employee.data) {
      const { id: empId, slug: _empSlug, createdAt: _empCreatedAt, ...empInput } = employee.data
      await updateEmployee.mutateAsync({ id: empId, input: { ...empInput, theme: baseTheme } })
    }
    toast.success("Theme saved", { description: isEmployeeMode ? employee.data?.name : company.data.name })
    navigate(
      isEmployeeMode ? `/dashboard/companies/${id}/employees/${employeeId}` : `/dashboard/companies/${id}?tab=themes`,
    )
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col md:-m-6">
      {isEmployeeMode && employee.data && (
        <div className="shrink-0 px-5 pt-2 pb-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={14} /> {employee.data.name}
          </button>
          {/* not <h1> — a global legacy `h1 { font-size: 56px }` rule in index.css (unlayered, beats Tailwind utilities) would clobber this. */}
          <div role="heading" aria-level={1} className="text-xl font-semibold tracking-tight">
            Theme Builder <span className="text-muted-foreground">·</span> {employee.data.name}
          </div>
        </div>
      )}

      <div className={cn("flex min-h-0 flex-1 flex-col gap-6 px-5 pb-5 lg:flex-row", isEmployeeMode ? "pt-1" : "pt-2")}>
        <div className="flex min-h-0 flex-1 flex-col items-center lg:basis-[60%]">
          <PreviewDeviceToggle value={previewDevice} onChange={setPreviewDevice} />
          <div className="mt-3 min-h-0 w-full flex-1">
            <PreviewFrame width={PREVIEW_DEVICE_WIDTH[previewDevice]} resetKey={previewResetKey}>
              <AnimatePresence mode="wait">
                <motion.div key={baseTheme} initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
                  <ProfileEngine profile={previewProfile} theme={profileTheme} />
                </motion.div>
              </AnimatePresence>
            </PreviewFrame>
          </div>
        </div>

        <div className="flex min-h-0 flex-col lg:basis-[40%]">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4">
            <div className="flex flex-col gap-4 pb-6">
              <CollapsibleSection index={1} title="Base Theme">
                <BaseThemeSection value={baseTheme} onChange={setBaseTheme} />
              </CollapsibleSection>

              <CollapsibleSection index={2} title="Brand">
                <BrandSection value={brandColor} onChange={setBrandColor} logoPath={seedSource?.logoPath ?? ""} />
              </CollapsibleSection>

              <CollapsibleSection index={3} title="Ombre">
                <OmbreSection
                  value={ombre}
                  onChange={setOmbre}
                  secondColor={secondColor}
                  onSecondColorChange={setSecondColor}
                  previewGradient={previewGradient}
                />
              </CollapsibleSection>

              <CollapsibleSection index={4} title="Typography" defaultOpen={false}>
                <TypographySection value={typography} onChange={setTypography} />
              </CollapsibleSection>

              <CollapsibleSection index={5} title="Style">
                <StyleSection value={style} onChange={setStyle} />
              </CollapsibleSection>

              <CollapsibleSection index={6} title="Motion" defaultOpen={false}>
                <MotionSection value={motionStyle} onChange={setMotionStyle} />
              </CollapsibleSection>

              <CollapsibleSection index={7} title="Advanced" badge="Soon" disabled />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--border)] p-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            {isLibraryMode ? (
              <SaveThemeDialog
                baseTheme={baseTheme}
                brand={brand}
                style={style}
                typography={typography}
                motion={motionStyle}
                defaultName={seedSource ? `${seedSource.name} Theme` : ""}
                trigger={<Button>Save to Library</Button>}
              />
            ) : (
              <Button onClick={handleSave} disabled={updateCompany.isPending || updateEmployee.isPending}>
                {updateCompany.isPending || updateEmployee.isPending ? "Saving…" : "Save Theme"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
