import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { z } from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { urlOrEmpty } from "@/lib/validation"
import { UploadZone } from "@/components/common"
import { useCreateCompany, useUpdateCompany } from "../hooks/useCompanies"
import type { Company } from "../types"

const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),
  logoPath: z.string(),
  website: urlOrEmpty,
  about: z.string().trim().min(1, "Tell clients what this company does"),
  address: z.string().trim().min(1, "Address is required"),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  accentColor: z.string().min(1),
  linkedin: urlOrEmpty,
  instagram: urlOrEmpty,
  facebook: urlOrEmpty,
  twitter: urlOrEmpty,
  youtube: urlOrEmpty,
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

function toFormValues(company?: Company): CompanyFormValues {
  return {
    name: company?.name ?? "",
    logoPath: company?.logoPath ?? "",
    website: company?.website ?? "",
    about: company?.about ?? "",
    address: company?.address ?? "",
    primaryColor: company?.brandColors.primary ?? "#c084fc",
    secondaryColor: company?.brandColors.secondary ?? "#16171d",
    accentColor: company?.brandColors.accent ?? "#f3f4f6",
    linkedin: company?.socialLinks.linkedin ?? "",
    instagram: company?.socialLinks.instagram ?? "",
    facebook: company?.socialLinks.facebook ?? "",
    twitter: company?.socialLinks.twitter ?? "",
    youtube: company?.socialLinks.youtube ?? "",
  }
}

export interface CompanyFormDialogProps {
  trigger: ReactNode
  company?: Company
  onSuccess?: (company: Company) => void
}

export function CompanyFormDialog({ trigger, company, onSuccess }: CompanyFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const isEditing = Boolean(company)
  const isPending = createCompany.isPending || updateCompany.isPending

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toFormValues(company),
  })

  async function onSubmit(values: CompanyFormValues) {
    const input = {
      name: values.name,
      logoPath: values.logoPath,
      website: values.website,
      about: values.about,
      address: values.address,
      brandColors: {
        primary: values.primaryColor,
        secondary: values.secondaryColor,
        accent: values.accentColor,
      },
      socialLinks: {
        linkedin: values.linkedin || undefined,
        instagram: values.instagram || undefined,
        facebook: values.facebook || undefined,
        twitter: values.twitter || undefined,
        youtube: values.youtube || undefined,
      },
      // Not part of this form — managed on the company's Themes/Settings tabs.
      defaultTheme: company?.defaultTheme ?? "luxury",
      brandingMode: company?.brandingMode ?? "powered",
      brand: company?.brand ?? null,
      style: company?.style ?? null,
      typography: company?.typography ?? null,
      motion: company?.motion ?? null,
    }

    try {
      const result = isEditing
        ? await updateCompany.mutateAsync({ id: company!.id, input })
        : await createCompany.mutateAsync(input)
      toast.success(isEditing ? "Company updated" : "Company created", { description: result.name })
      setOpen(false)
      form.reset(toFormValues(result))
      onSuccess?.(result)
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) form.reset(toFormValues(company))
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit company" : "Add company"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="Aadrik Distributors Pvt. Ltd." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoPath"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UploadZone
                      value={field.value}
                      onChange={(path) => field.onChange(path ?? "")}
                      uploadPath={`companies/${company?.id ?? "new"}/logo`}
                      label="Company Logo"
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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="What does this company do?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="142 Spring St, New York, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-2">Brand colors</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    ["primaryColor", "Primary"],
                    ["secondaryColor", "Secondary"],
                    ["accentColor", "Accent"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-normal text-muted-foreground">
                          {label}
                        </FormLabel>
                        <FormControl>
                          <Input type="color" className="h-9 w-full p-1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <FormLabel className="mb-2">
                Social Links
                <span className="font-normal text-muted-foreground"> — inherited by any employee who leaves their own blank</span>
              </FormLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(
                  [
                    ["linkedin", "LinkedIn", "https://linkedin.com/company/…"],
                    ["instagram", "Instagram", "https://instagram.com/…"],
                    ["facebook", "Facebook", "https://facebook.com/…"],
                    ["twitter", "Twitter / X", "https://x.com/…"],
                    ["youtube", "YouTube", "https://youtube.com/…"],
                  ] as const
                ).map(([name, label, placeholder]) => (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEditing ? "Save changes" : "Create company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
