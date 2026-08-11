import { Plus } from "lucide-react"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEmployees } from "@/features/employees/hooks/useEmployees"
import { CompanyFormDialog } from "./components/CompanyFormDialog"
import { useCompanies } from "./hooks/useCompanies"

export function CompaniesPage() {
  const navigate = useNavigate()
  const companies = useCompanies()
  const employees = useEmployees()

  function employeeCount(companyId: string) {
    return employees.data?.filter((e) => e.companyId === companyId).length ?? 0
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">Every client workspace you manage.</p>
        </div>
        <CompanyFormDialog
          trigger={
            <Button>
              <Plus /> Add Company
            </Button>
          }
        />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Employees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {companies.data?.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer"
                onClick={() => navigate(`/dashboard/companies/${company.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={company.logoPath} alt="" />
                      <AvatarFallback>{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{company.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{company.website || "—"}</TableCell>
                <TableCell>{employeeCount(company.id)}</TableCell>
              </TableRow>
            ))}

            {companies.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No companies yet. Add your first one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
