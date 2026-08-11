import { Link2, Pencil, Plus } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeFormDialog } from "@/features/employees/components/EmployeeFormDialog"
import { useEmployeesByCompany } from "@/features/employees/hooks/useEmployees"
import { ProductsTab } from "@/features/products"
import { CompanyBrandingSettings } from "./components/CompanyBrandingSettings"
import { CompanyFormDialog } from "./components/CompanyFormDialog"
import { CompanyThemeSettings } from "./components/CompanyThemeSettings"
import { useCompany } from "./hooks/useCompanies"

const tabs = ["overview", "employees", "products", "themes", "settings"] as const

export function CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const company = useCompany(companyId)
  const employees = useEmployeesByCompany(companyId)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = tabs.includes(searchParams.get("tab") as (typeof tabs)[number])
    ? (searchParams.get("tab") as (typeof tabs)[number])
    : "overview"

  function setActiveTab(tab: string) {
    setSearchParams((prev) => {
      prev.set("tab", tab)
      return prev
    }, { replace: true })
  }

  if (company.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!company.data) {
    return <p className="text-muted-foreground">Company not found.</p>
  }

  const c = company.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={c.logoPath} alt="" />
            <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{c.name}</h1>
            {c.website && (
              <a
                href={c.website}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground hover:underline"
              >
                {c.website}
              </a>
            )}
          </div>
        </div>
        <CompanyFormDialog
          company={c}
          trigger={
            <Button variant="outline" size="sm">
              <Pencil /> Edit
            </Button>
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <p className="max-w-xl text-sm text-muted-foreground">{c.about}</p>
              <p className="text-sm text-muted-foreground">{c.address}</p>
              <div className="flex items-center gap-3">
                {[c.brandColors.primary, c.brandColors.secondary, c.brandColors.accent].map(
                  (color, i) => (
                    <span
                      key={i}
                      className="size-5 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                  ),
                )}
                {(
                  [
                    ["linkedin", "LinkedIn"],
                    ["instagram", "Instagram"],
                    ["facebook", "Facebook"],
                    ["twitter", "Twitter / X"],
                    ["youtube", "YouTube"],
                  ] as const
                ).map(([platform, label]) => {
                  const url = c.socialLinks[platform]
                  if (!url) return null
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Link2 size={14} /> {label}
                    </a>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <EmployeeFormDialog
              companyId={c.id}
              trigger={
                <Button size="sm">
                  <Plus /> Add Employee
                </Button>
              }
            />
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.isLoading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={2}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {employees.data?.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/dashboard/companies/${c.id}/employees/${employee.id}`)
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage src={employee.photoPath} alt="" />
                          <AvatarFallback>
                            {employee.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.designation}
                    </TableCell>
                  </TableRow>
                ))}

                {employees.data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                      No employees yet. Add the first one for {c.name}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <ProductsTab companyId={c.id} />
        </TabsContent>

        <TabsContent value="themes" className="mt-4">
          <CompanyThemeSettings company={c} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <CompanyBrandingSettings company={c} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
