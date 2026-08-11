import { motion } from "framer-motion"
import { Building2, Palette, QrCode, Users } from "lucide-react"
import { Link } from "react-router"
import { useCompanies } from "@/features/companies"
import { useEmployees } from "@/features/employees"
import { profileThemeNames } from "@/features/profiles/theme"
import { themeRegistry, type ThemeName } from "@/lib/theme"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ICON_SIZE, ICON_STROKE_WIDTH } from "@/lib/icons"
import { staggerContainer, staggerItem } from "@/components/motion"

const availableThemeCount = profileThemeNames.filter(
  (name) => themeRegistry[name as ThemeName].status === "available",
).length

export function OverviewPage() {
  const companies = useCompanies()
  const employees = useEmployees()

  const stats = [
    {
      label: "Companies",
      value: companies.data?.length,
      isLoading: companies.isLoading,
      icon: Building2,
      href: "/dashboard/companies",
    },
    {
      label: "Employees",
      value: employees.data?.length,
      isLoading: employees.isLoading,
      icon: Users,
      href: "/dashboard/employees",
    },
    {
      label: "Profiles",
      value: employees.data?.length,
      suffix: "Active",
      isLoading: employees.isLoading,
      icon: QrCode,
      // One live profile per employee — there's no separate profiles list,
      // so this points at the same directory the Employees card does.
      href: "/dashboard/employees",
    },
    {
      label: "Themes",
      value: availableThemeCount,
      suffix: "Available",
      isLoading: false,
      icon: Palette,
      href: "/dashboard/themes",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your Adriva workspace.</p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <Link to={stat.href} className="block">
              <Card className="transition-colors hover:border-[var(--primary)]/50 hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon
                    size={ICON_SIZE.md}
                    strokeWidth={ICON_STROKE_WIDTH}
                    className="text-muted-foreground"
                  />
                </CardHeader>
                <CardContent>
                  {stat.isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <span className="text-3xl font-semibold tracking-tight">
                      {stat.value}
                      {stat.suffix && (
                        <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                          {stat.suffix}
                        </span>
                      )}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
