import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  ChevronLeft,
  Copy,
  Download,
  Nfc,
  Paintbrush,
  Palette,
  Pencil,
  Printer,
  SquareStack,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { useCompany } from "@/features/companies/hooks/useCompanies"
import { useProductsByCompany } from "@/features/products/hooks/useProducts"
import { ProfileEngine } from "@/features/profiles/ProfileEngine"
import { getProfileTheme } from "@/features/profiles/theme"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { fadeIn } from "@/components/motion"
import { EmployeeFormDialog } from "./components/EmployeeFormDialog"
import { useDuplicateEmployee, useEmployee } from "./hooks/useEmployees"
import { employeeToProfileData } from "./utils/toProfileData"
import { generateQrDataUrl } from "./utils/qrcode"
import { downloadVCard } from "./utils/vcard"
import { getProfileUrl } from "./utils/profileUrl"
import { printQr } from "./utils/printQr"

const identityChecklist = ["URL", "QR", "vCard", "NFC Ready"]

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ companyId: string; employeeId: string }>()
  const navigate = useNavigate()
  const employee = useEmployee(employeeId)
  const company = useCompany(employee.data?.companyId)
  const products = useProductsByCompany(employee.data?.companyId)
  const duplicateEmployee = useDuplicateEmployee()

  const profileUrl =
    employee.data && company.data ? getProfileUrl(employee.data) : undefined

  const qr = useQuery({
    queryKey: ["qr", profileUrl],
    queryFn: () => generateQrDataUrl(profileUrl!),
    enabled: Boolean(profileUrl),
  })

  if (employee.isLoading || company.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!employee.data || !company.data) {
    return <p className="text-muted-foreground">Employee not found.</p>
  }

  const e = employee.data
  const c = company.data
  const profileTheme = getProfileTheme(e.theme)
  const profileData = employeeToProfileData(e, c, products.data ?? [])

  async function handleDuplicate() {
    const copy = await duplicateEmployee.mutateAsync(e.id)
    toast.success("Employee duplicated", { description: copy.name })
    navigate(`/dashboard/companies/${c.id}/employees/${copy.id}`)
  }

  function copyUrl() {
    if (!profileUrl) return
    navigator.clipboard.writeText(profileUrl)
    toast.success("URL copied")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/companies/${c.id}`)}
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={14} /> {c.name}
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">{e.name}</h1>
          <p className="text-sm text-muted-foreground">{e.designation}</p>
        </div>
        <div className="flex gap-2">
          <EmployeeFormDialog
            companyId={c.id}
            employee={e}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil /> Edit
              </Button>
            }
          />
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateEmployee.isPending}>
            <SquareStack /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/dashboard/theme-builder?baseTheme=${e.theme}&fromCompany=${c.id}`)
            }
          >
            <Palette /> Save Current Styling as Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/companies/${c.id}/employees/${e.id}/theme-builder`)}
          >
            <Paintbrush /> Customize Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {(
                  [
                    ["Phone", e.phones.map((p) => p.value).join(", ")],
                    ["WhatsApp", e.whatsapp],
                    ["Email", e.emails.map((entry) => entry.value).join(", ")],
                    ["Website", e.websites.map((entry) => entry.value).join(", ")],
                    ["LinkedIn", e.social.linkedin],
                    ["Instagram", e.social.instagram],
                    ["Address", e.address || c.address],
                    ["Maps", e.mapsUrl],
                    ["Theme", e.theme],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="truncate text-sm capitalize">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Identity Assets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {identityChecklist.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 size={14} className="text-[var(--accent)]" /> {item}
                  </span>
                ))}
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Profile URL</p>
                <div className="flex gap-2">
                  <Input readOnly value={profileUrl} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={copyUrl}>
                    <Copy />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="flex size-32 items-center justify-center rounded-lg border border-[var(--border)] bg-white p-2">
                  {qr.data && <img src={qr.data} alt="Profile QR code" className="size-full" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadVCard(e, c)}>
                    <Download /> vCard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!qr.data}
                    onClick={() => qr.data && printQr(qr.data, e.name)}
                  >
                    <Printer /> Print QR
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/dashboard/companies/${c.id}/employees/${e.id}/nfc-card`)}
                  >
                    <Nfc /> Design NFC Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <EmployeeFormDialog
          companyId={c.id}
          employee={e}
          trigger={
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") ev.currentTarget.click()
              }}
              className="group flex cursor-pointer flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Live preview</p>
                <p className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  Click to edit profile
                </p>
              </div>
              <div className="max-h-[720px] overflow-y-auto rounded-2xl border border-[var(--border)] p-3 transition-shadow group-hover:shadow-md group-hover:ring-1 group-hover:ring-[var(--primary)]/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={e.theme}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeIn}
                  >
                    <ProfileEngine profile={profileData} theme={profileTheme} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
