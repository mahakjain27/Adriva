import { zodResolver } from "@hookform/resolvers/zod"
import { Info, Plus, X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { useFieldArray, useForm, type Control, type FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useCompanies, useCompany } from "@/features/companies/hooks/useCompanies"
import { CUSTOM_BUTTON_ICON_KEYS, type CustomButtonIcon } from "@/features/profiles/quickActionIcons"
import { profileThemeNames, type ProfileThemeName } from "@/features/profiles/theme"
import { CollapsibleSection } from "@/features/theme-builder/sections/CollapsibleSection"
import { emailOrEmpty, urlOrEmpty } from "@/lib/validation"
import { UploadZone } from "@/components/common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPicker } from "./IconPicker"
import { useCreateEmployee, useUpdateEmployee } from "../hooks/useEmployees"
import type { Employee } from "../types"

const contactEntrySchema = z.object({
  id: z.string(),
  label: z.string().trim(),
  value: z.string().trim(),
})

const emailEntrySchema = z.object({
  id: z.string(),
  label: z.string().trim(),
  value: emailOrEmpty,
})

const websiteEntrySchema = z.object({
  id: z.string(),
  label: z.string().trim(),
  value: urlOrEmpty,
})

const workingHoursEntrySchema = z.object({
  day: z.string().trim(),
  hours: z.string().trim(),
})

/** A row is either untouched (drop it) or must be a real label + URL — no half-filled buttons. */
const customButtonSchema = z
  .object({
    id: z.string(),
    label: z.string().trim(),
    url: z.string().trim(),
    icon: z.enum(CUSTOM_BUTTON_ICON_KEYS),
  })
  .refine(
    (button) =>
      (button.label === "" && button.url === "") ||
      (button.label !== "" && z.string().url().safeParse(button.url).success),
    { message: "Custom buttons need a label and a valid URL", path: ["url"] },
  )

const employeeFormSchema = z.object({
  companyId: z.string().min(1, "Select a company"),
  name: z.string().trim().min(1, "Name is required"),
  designation: z.string().trim().min(1, "Designation is required"),
  photoPath: z.string(),
  // Rows the admin added but never filled in (e.g. an extra "+ Add phone number" click) are
  // dropped rather than blocking submission — only ending up with zero real phone numbers is an error.
  phones: z
    .array(contactEntrySchema)
    .transform((rows) => rows.filter((row) => row.value !== ""))
    .refine((rows) => rows.length > 0, "At least one phone number is required"),
  whatsapp: z.string().trim(),
  emails: z.array(emailEntrySchema).transform((rows) => rows.filter((row) => row.value !== "")),
  websites: z.array(websiteEntrySchema).transform((rows) => rows.filter((row) => row.value !== "")),
  social: z.object({
    linkedin: urlOrEmpty,
    instagram: urlOrEmpty,
    facebook: urlOrEmpty,
    twitter: urlOrEmpty,
    youtube: urlOrEmpty,
  }),
  address: z.string().trim(),
  mapsUrl: urlOrEmpty,
  workingHours: z
    .array(workingHoursEntrySchema)
    .transform((rows) => rows.filter((row) => row.day !== "" || row.hours !== "")),
  customButtons: z
    .array(customButtonSchema)
    .transform((rows) => rows.filter((row) => !(row.label === "" && row.url === ""))),
  theme: z.enum(profileThemeNames as [ProfileThemeName, ...ProfileThemeName[]]),
})

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

/** Which top-level form fields live inside which numbered `CollapsibleSection` — used to force a section open when it contains a validation error the user can't otherwise see, since a collapsed section unmounts its fields (and their error messages) entirely. */
const SECTION_FIELDS: Record<number, (keyof EmployeeFormValues)[]> = {
  1: ["phones", "whatsapp"],
  2: ["emails"],
  3: ["websites"],
  4: ["social"],
  5: ["address", "mapsUrl", "workingHours"],
  6: ["customButtons"],
}

function toFormValues(
  employee?: Employee,
  companyId?: string,
  defaultTheme: ProfileThemeName = "luxury",
): EmployeeFormValues {
  return {
    companyId: employee?.companyId ?? companyId ?? "",
    name: employee?.name ?? "",
    designation: employee?.designation ?? "",
    photoPath: employee?.photoPath ?? "",
    phones: employee?.phones ?? [{ id: crypto.randomUUID(), label: "", value: "" }],
    whatsapp: employee?.whatsapp ?? "",
    emails: employee?.emails ?? [],
    websites: employee?.websites ?? [],
    social: employee?.social ?? { linkedin: "", instagram: "", facebook: "", twitter: "", youtube: "" },
    address: employee?.address ?? "",
    mapsUrl: employee?.mapsUrl ?? "",
    workingHours: employee?.workingHours ?? [],
    customButtons: employee?.customButtons ?? [],
    theme: employee?.theme ?? defaultTheme,
  }
}

/** Shared row UI for the three repeatable contact lists (phones/emails/websites) — same {id, label, value} shape. */
function ContactEntryFieldArray({
  control,
  name,
  addLabel,
  placeholder,
}: {
  control: Control<EmployeeFormValues>
  name: "phones" | "emails" | "websites"
  addLabel: string
  placeholder: string
}) {
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`${name}.${index}.label`}
            render={({ field: f }) => (
              <Input placeholder="Label" className="w-24 shrink-0" {...f} />
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.value`}
            render={({ field: f }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder={placeholder} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
            <X />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => append({ id: crypto.randomUUID(), label: "", value: "" })}
      >
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}

function WorkingHoursFieldArray({ control }: { control: Control<EmployeeFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "workingHours" })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <FormField
            control={control}
            name={`workingHours.${index}.day`}
            render={({ field: f }) => <Input placeholder="Monday" className="w-28 shrink-0" {...f} />}
          />
          <FormField
            control={control}
            name={`workingHours.${index}.hours`}
            render={({ field: f }) => (
              <Input placeholder="9:00 AM – 6:00 PM, or Closed" className="flex-1" {...f} />
            )}
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
            <X />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => append({ day: "", hours: "" })}
      >
        <Plus /> Add day
      </Button>
    </div>
  )
}

function CustomButtonsFieldArray({ control }: { control: Control<EmployeeFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "customButtons" })

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-3">
          <div className="flex items-start gap-2">
            <FormField
              control={control}
              name={`customButtons.${index}.label`}
              render={({ field: f }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Book a Meeting" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
              <X />
            </Button>
          </div>
          <FormField
            control={control}
            name={`customButtons.${index}.url`}
            render={({ field: f }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="https://…" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`customButtons.${index}.icon`}
            render={({ field: f }) => (
              <IconPicker value={f.value as CustomButtonIcon} onChange={f.onChange} />
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          append({ id: crypto.randomUUID(), label: "", url: "", icon: CUSTOM_BUTTON_ICON_KEYS[0] })
        }
      >
        <Plus /> Add button
      </Button>
    </div>
  )
}

/** Shown under a field whenever the employee has left it blank and the company has a value to fall back to — `ProfileEngine`/the vCard export apply the exact same fallback (see `resolveInheritedContact.ts`), this just makes it visible in the form instead of looking like the field is simply empty. */
function InheritedHint({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <Info size={12} className="shrink-0" />
      Using company {label}: <span className="truncate">{value}</span>
    </p>
  )
}

export interface EmployeeFormDialogProps {
  trigger: ReactNode
  /** Fixed when adding/editing from within a company's own pages. Omit to show a company picker (e.g. the cross-company directory). */
  companyId?: string
  employee?: Employee
  onSuccess?: (employee: Employee) => void
}

export function EmployeeFormDialog({
  trigger,
  companyId: fixedCompanyId,
  employee,
  onSuccess,
}: EmployeeFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Partial<Record<number, boolean>>>({})
  const showCompanyPicker = !employee && !fixedCompanyId
  const companies = useCompanies()
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const isEditing = Boolean(employee)
  const isPending = createEmployee.isPending || updateEmployee.isPending

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: toFormValues(employee, fixedCompanyId),
  })

  const selectedCompanyId = form.watch("companyId")
  // Fetched regardless of create/edit mode now — the inheritance hints below need the company's
  // website/address/social values whenever a company is known, not just while creating.
  const company = useCompany(employee?.companyId ?? selectedCompanyId)
  const watchedWebsites = form.watch("websites")
  const watchedAddress = form.watch("address")
  const watchedSocial = form.watch("social")
  const hasCustomWebsite = watchedWebsites.some((w) => w.value)

  // Keep the theme field pointed at the selected company's default until the
  // user deliberately overrides it — matters most for the company picker,
  // where the default isn't known until a company is chosen.
  useEffect(() => {
    if (!isEditing && company.data && !form.formState.dirtyFields.theme) {
      form.setValue("theme", company.data.defaultTheme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.data])

  async function onSubmit(values: EmployeeFormValues) {
    // Not part of this form — designed separately via the NFC Card Designer, carried forward untouched.
    const input = { ...values, nfcCard: employee?.nfcCard ?? null }
    try {
      const result = isEditing
        ? await updateEmployee.mutateAsync({ id: employee!.id, input })
        : await createEmployee.mutateAsync(input)
      toast.success(isEditing ? "Employee updated" : "Employee added", { description: result.name })
      setOpen(false)
      form.reset(toFormValues(result))
      onSuccess?.(result)
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  /** Runs when Zod validation fails — without this, an invalid field hidden inside a collapsed section (Emails/Websites/Social/Custom Buttons all default closed) blocks submission with zero visible feedback, which just looks like the button doesn't work. Force those sections open, then scroll to the first invalid field (its red border/message already exist via `FormControl`'s `aria-invalid` — they just weren't visible while collapsed and off-screen). */
  function onInvalid(errors: FieldErrors<EmployeeFormValues>) {
    const invalidSections = Object.entries(SECTION_FIELDS)
      .filter(([, fields]) => fields.some((field) => field in errors))
      .map(([index]) => Number(index))
    if (invalidSections.length > 0) {
      setOpenSections((prev) => ({ ...prev, ...Object.fromEntries(invalidSections.map((i) => [i, true])) }))
    }
    toast.error("Please fix the highlighted fields before saving.")
    // Wait for the section(s) to mount/expand (CollapsibleSection's own transition is 250ms) before scrolling.
    setTimeout(() => {
      document
        .querySelector('[data-slot="dialog-content"] [aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          form.reset(toFormValues(employee, fixedCompanyId))
          setOpenSections({})
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit employee" : "Add employee"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
            {showCompanyPicker && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.data?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Aditya Kothari" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Business Development Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoPath"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UploadZone
                      value={field.value}
                      onChange={(path) => field.onChange(path ?? "")}
                      uploadPath={`companies/${selectedCompanyId || fixedCompanyId || "unassigned"}/employees/photo`}
                      label="Employee Photo"
                      shape="circle"
                      cropAspectRatio={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile theme</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profileThemeNames.map((name) => (
                        <SelectItem key={name} value={name} className="capitalize">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CollapsibleSection
              index={1}
              title="Phone Numbers"
              open={openSections[1]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 1: o }))}
            >
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 000 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ContactEntryFieldArray
                  control={form.control}
                  name="phones"
                  addLabel="Add phone number"
                  placeholder="+1 000 000 0000"
                />
                {/* A whole-array refine (not a per-index error) lands at .root.message in
                    react-hook-form v7.44+, not .message directly — reading .message here
                    silently swallowed this error, so the toast fired with nothing visibly
                    highlighted to explain why. */}
                {form.formState.errors.phones?.root?.message && (
                  <p className="text-sm text-destructive">{form.formState.errors.phones.root.message}</p>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              index={2}
              title="Emails"
              defaultOpen={false}
              open={openSections[2]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 2: o }))}
            >
              <ContactEntryFieldArray
                control={form.control}
                name="emails"
                addLabel="Add email"
                placeholder="name@company.com"
              />
            </CollapsibleSection>

            <CollapsibleSection
              index={3}
              title="Websites"
              defaultOpen={false}
              open={openSections[3]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 3: o }))}
            >
              <div className="flex flex-col gap-2">
                <ContactEntryFieldArray
                  control={form.control}
                  name="websites"
                  addLabel="Add website"
                  placeholder="https://…"
                />
                {!hasCustomWebsite && <InheritedHint label="website" value={company.data?.website} />}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              index={4}
              title="Social"
              defaultOpen={false}
              open={openSections[4]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 4: o }))}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(
                  [
                    ["social.linkedin", "LinkedIn", "https://linkedin.com/in/…", "linkedin"],
                    ["social.instagram", "Instagram", "https://instagram.com/…", "instagram"],
                    ["social.facebook", "Facebook", "https://facebook.com/…", "facebook"],
                    ["social.twitter", "Twitter / X", "https://x.com/…", "twitter"],
                    ["social.youtube", "YouTube", "https://youtube.com/…", "youtube"],
                  ] as const
                ).map(([name, label, placeholder, platform]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input placeholder={placeholder} {...field} />
                        </FormControl>
                        {!watchedSocial[platform] && (
                          <InheritedHint label={label} value={company.data?.socialLinks[platform]} />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              index={5}
              title="Address & Hours"
              open={openSections[5]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 5: o }))}
            >
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder={company.data?.address || "142 Spring St, New York, NY"} {...field} />
                      </FormControl>
                      {!watchedAddress && <InheritedHint label="address" value={company.data?.address} />}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maps link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel className="mb-2">Working Hours</FormLabel>
                  <WorkingHoursFieldArray control={form.control} />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              index={6}
              title="Custom Buttons"
              defaultOpen={false}
              open={openSections[6]}
              onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, 6: o }))}
            >
              <CustomButtonsFieldArray control={form.control} />
            </CollapsibleSection>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEditing ? "Save changes" : "Add employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
