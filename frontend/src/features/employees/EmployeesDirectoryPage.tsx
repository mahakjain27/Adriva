import { Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCompanies } from "@/features/companies/hooks/useCompanies"
import { EmployeeFormDialog } from "./components/EmployeeFormDialog"
import { useEmployees } from "./hooks/useEmployees"

export function EmployeesDirectoryPage() {
  const navigate = useNavigate()
  const employees = useEmployees()
  const companies = useCompanies()
  const [search, setSearch] = useState("")

  const companyName = (companyId: string) =>
    companies.data?.find((c) => c.id === companyId)?.name ?? "—"

  const filtered = useMemo(() => {
    if (!employees.data) return []
    const query = search.trim().toLowerCase()
    if (!query) return employees.data
    return employees.data.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        companyName(e.companyId).toLowerCase().includes(query),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.data, companies.data, search])

  const isLoading = employees.isLoading || companies.isLoading

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Every profile across every company.</p>
        </div>
        <EmployeeFormDialog
          trigger={
            <Button size="sm">
              <Plus /> Add Employee
            </Button>
          }
          onSuccess={(employee) =>
            navigate(`/dashboard/companies/${employee.companyId}/employees/${employee.id}`)
          }
        />
      </div>

      <div className="relative max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Designation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading &&
              filtered.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/companies/${employee.companyId}/employees/${employee.id}`,
                    )
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={employee.photoPath} alt="" />
                        <AvatarFallback>{employee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {companyName(employee.companyId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{employee.designation}</TableCell>
                </TableRow>
              ))}

            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No employees match "{search}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
