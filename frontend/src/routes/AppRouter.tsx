import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { DashboardLayout } from "@/components/layout"
import { OverviewPage } from "@/features/dashboard"
import { CompaniesPage, CompanyDetailPage } from "@/features/companies"
import { EmployeesDirectoryPage, EmployeeDetailPage } from "@/features/employees"
import { ThemesPage } from "@/features/themes"
import { ThemeLibraryPage } from "@/features/theme-library"
import { SettingsPage } from "@/features/settings"
import { ThemeBuilderPage } from "@/features/theme-builder"
import { NfcCardDesignerPage } from "@/features/nfc-card"
import { PublicProfilePage } from "@/features/profiles/PublicProfilePage"

const PlaygroundRoute = lazy(() =>
  import("./PlaygroundRoute").then((m) => ({ default: m.PlaygroundRoute })),
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:companyId" element={<CompanyDetailPage />} />
          <Route
            path="companies/:companyId/employees/:employeeId"
            element={<EmployeeDetailPage />}
          />
          <Route
            path="companies/:companyId/employees/:employeeId/nfc-card"
            element={<NfcCardDesignerPage />}
          />
          <Route
            path="companies/:companyId/employees/:employeeId/theme-builder"
            element={<ThemeBuilderPage />}
          />
          <Route path="companies/:companyId/theme-builder" element={<ThemeBuilderPage />} />
          <Route path="theme-builder" element={<ThemeBuilderPage />} />
          <Route path="employees" element={<EmployeesDirectoryPage />} />
          <Route path="themes" element={<ThemesPage />} />
          <Route path="theme-library" element={<ThemeLibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {import.meta.env.DEV && (
          <Route
            path="/playground"
            element={
              <Suspense fallback={null}>
                <PlaygroundRoute />
              </Suspense>
            }
          />
        )}

        {/* The real public digital profile — /:companySlug/:employeeSlug. This is
            where the backend's GET /c/{employeeId} redirect (see profiles.py) lands
            after resolving an employee's current slug pair; getProfileUrl() never
            builds this pattern directly anymore since slugs aren't stable enough to
            print on physical media. Registered last: react-router ranks static
            segments (/dashboard, /playground) above dynamic ones regardless of
            order, but keeping the catch-all pattern last in the JSX also reads
            correctly to a human. */}
        <Route path="/:companySlug/:employeeSlug" element={<PublicProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
