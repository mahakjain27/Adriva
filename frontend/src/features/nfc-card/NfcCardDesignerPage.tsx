import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, Copy, Download, FileText } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { useCompany } from "@/features/companies/hooks/useCompanies"
import { useEmployee, useUpdateEmployee } from "@/features/employees/hooks/useEmployees"
import { generateQrDataUrl } from "@/features/employees/utils/qrcode"
import { getProfileUrl } from "@/features/employees/utils/profileUrl"
import { CollapsibleSection } from "@/features/theme-builder/sections/CollapsibleSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { BackgroundControls } from "./components/BackgroundControls"
import { CardCanvas, CARD_HEIGHT_PX, CARD_WIDTH_PX } from "./components/CardCanvas"
import { ElementsPanel } from "./components/ElementsPanel"
import { buildDefaultCardDesign } from "./defaultCardDesign"
import { exportCardPng, exportCardsPdf } from "./utils/exportCard"
import type { NfcCardDesign, NfcCardSideName, NfcElementConfig, NfcElementId } from "./types"

/**
 * Split-screen card designer, same shell language as the Theme Builder
 * (`CollapsibleSection`) but a purpose-built canvas instead of a phone
 * preview — the thing being designed here is a physical 85.6×54mm card,
 * not a profile page. Both Front and Back canvases stay mounted at all
 * times (the inactive one pushed off-screen, never `display:none`) so
 * export can capture either side at any moment regardless of which tab is
 * showing.
 */
export function NfcCardDesignerPage() {
  const { companyId, employeeId } = useParams<{ companyId: string; employeeId: string }>()
  const navigate = useNavigate()
  const employee = useEmployee(employeeId)
  const company = useCompany(companyId ?? employee.data?.companyId)
  const updateEmployee = useUpdateEmployee()

  const [design, setDesign] = useState<NfcCardDesign | null>(null)
  const [activeSide, setActiveSide] = useState<NfcCardSideName>("front")
  const [selectedElementId, setSelectedElementId] = useState<NfcElementId | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (design || !employee.data || !company.data) return
    setDesign(employee.data.nfcCard ?? buildDefaultCardDesign(company.data, employee.data))
  }, [design, employee.data, company.data])

  const profileUrl = employee.data && company.data ? getProfileUrl(company.data, employee.data) : undefined
  const qr = useQuery({
    queryKey: ["qr", profileUrl],
    queryFn: () => generateQrDataUrl(profileUrl!),
    enabled: Boolean(profileUrl),
  })

  if (employee.isLoading || company.isLoading || !design || !employee.data || !company.data) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    )
  }

  const e = employee.data
  const c = company.data

  function updateElement(sideName: NfcCardSideName, id: NfcElementId, patch: Partial<NfcElementConfig>) {
    setDesign((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [sideName]: {
          ...prev[sideName],
          elements: { ...prev[sideName].elements, [id]: { ...prev[sideName].elements[id], ...patch } },
        },
      }
    })
  }

  function updateSide(sideName: NfcCardSideName, patch: Partial<NfcCardDesign["front"]>) {
    setDesign((prev) => (prev ? { ...prev, [sideName]: { ...prev[sideName], ...patch } } : prev))
  }

  async function handleSave() {
    const { id, slug: _slug, createdAt: _createdAt, ...input } = e
    await updateEmployee.mutateAsync({ id, input: { ...input, nfcCard: design } })
    toast.success("NFC card saved", { description: e.name })
  }

  function copyNfcUrl() {
    if (!profileUrl) return
    navigator.clipboard.writeText(profileUrl)
    toast.success("NFC destination URL copied")
  }

  /** Selection renders a ring plus resize/rotate handles on the live canvas node that `exportCard.ts` captures directly — deselect and let React repaint before snapshotting so exports never include editor chrome. */
  async function deselectAndWaitForRepaint() {
    setSelectedElementId(null)
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  }

  async function handleExportPng() {
    if (!frontRef.current || !backRef.current) return
    const previousSelection = selectedElementId
    setIsExporting(true)
    try {
      await deselectAndWaitForRepaint()
      await exportCardPng(frontRef.current, backRef.current, `${e.slug}-nfc-card.png`)
    } catch (error) {
      console.error("NFC card PNG export failed:", error)
      toast.error("Couldn't export the card. Check the browser console.")
    } finally {
      setIsExporting(false)
      setSelectedElementId(previousSelection)
    }
  }

  async function handleExportPdf() {
    if (!frontRef.current || !backRef.current) return
    const previousSelection = selectedElementId
    setIsExporting(true)
    try {
      await deselectAndWaitForRepaint()
      await exportCardsPdf(frontRef.current, backRef.current, `${e.slug}-nfc-card.pdf`)
    } catch (error) {
      console.error("NFC card PDF export failed:", error)
      toast.error("Couldn't export the card. Check the browser console.")
    } finally {
      setIsExporting(false)
      setSelectedElementId(previousSelection)
    }
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col gap-6 px-5 pt-2 pb-5 md:-m-6 lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 lg:basis-[60%]">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
          {(["front", "back"] as const).map((sideName) => (
            <button
              key={sideName}
              type="button"
              onClick={() => {
                setActiveSide(sideName)
                setSelectedElementId(null)
              }}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium capitalize transition-colors",
                activeSide === sideName ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              {sideName}
            </button>
          ))}
        </div>

        <div className="relative" style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}>
          <div style={activeSide === "front" ? undefined : { position: "absolute", left: -99999, top: 0 }}>
            <CardCanvas
              ref={frontRef}
              side={design.front}
              company={c}
              employee={e}
              qrDataUrl={qr.data}
              selectedElementId={activeSide === "front" ? selectedElementId : null}
              onSelectElement={activeSide === "front" ? setSelectedElementId : () => {}}
              onUpdateElement={(id, patch) => updateElement("front", id, patch)}
            />
          </div>
          <div style={activeSide === "back" ? undefined : { position: "absolute", left: -99999, top: 0 }}>
            <CardCanvas
              ref={backRef}
              side={design.back}
              company={c}
              employee={e}
              qrDataUrl={qr.data}
              selectedElementId={activeSide === "back" ? selectedElementId : null}
              onSelectElement={activeSide === "back" ? setSelectedElementId : () => {}}
              onUpdateElement={(id, patch) => updateElement("back", id, patch)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Drag elements to reposition · click to select</p>
      </div>

      <div className="flex min-h-0 flex-col lg:basis-[40%]">
        <div className="shrink-0 px-6 pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={14} /> {e.name}
          </button>
          {/* not <h1> — a global legacy `h1 { font-size: 56px }` rule in index.css (unlayered, beats Tailwind utilities) would clobber this. */}
          <div role="heading" aria-level={1} className="text-xl font-semibold tracking-tight">
            NFC Card Designer
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-4 pb-6">
            <CollapsibleSection index={1} title="Elements">
              <ElementsPanel
                side={design[activeSide]}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={(id, patch) => updateElement(activeSide, id, patch)}
                defaultTextByElement={{ name: e.name, designation: e.designation, companyName: c.name }}
              />
            </CollapsibleSection>

            <CollapsibleSection index={2} title="Background">
              <BackgroundControls
                side={design[activeSide]}
                uploadPath={`companies/${c.id}/employees/${e.id}/nfc-card/${activeSide}-background`}
                onChange={(patch) => updateSide(activeSide, patch)}
              />
            </CollapsibleSection>

            <CollapsibleSection index={3} title="NFC Destination">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">
                  The physical NFC chip and QR code both resolve to this same profile URL.
                </p>
                <div className="flex gap-2">
                  <Input readOnly value={profileUrl ?? ""} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={copyNfcUrl}>
                    <Copy />
                  </Button>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--border)] p-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" disabled={isExporting} onClick={handleExportPng}>
              <Download /> Export PNG
            </Button>
            <Button variant="outline" size="sm" className="flex-1" disabled={isExporting} onClick={handleExportPdf}>
              <FileText /> Export PDF
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateEmployee.isPending}>
              {updateEmployee.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
