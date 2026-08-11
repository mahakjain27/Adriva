import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { useFieldArray, useForm, type Control } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
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
import { useCreateProduct, useProductsByCompany, useUpdateProduct } from "../hooks/useProducts"
import type { Product } from "../types"

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  price: z.string().trim().min(1, "Price is required"),
  category: z.string().trim(),
  images: z.array(z.object({ path: z.string() })),
})

type ProductFormValues = z.infer<typeof productFormSchema>

function toFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    price: product?.price ?? "",
    category: product?.category ?? "",
    images: (product?.imagePaths ?? []).map((path) => ({ path })),
  }
}

/** Repeatable image list — first entry is the cover shown on the profile card. Each slot is a full UploadZone, not a plain path input. */
function ProductImagesFieldArray({
  control,
  companyId,
}: {
  control: Control<ProductFormValues>
  companyId: string
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "images" })

  return (
    <div className="flex flex-col gap-2">
      <FormLabel>Images</FormLabel>
      <div className="flex flex-wrap gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="relative">
            {index === 0 && (
              <span className="absolute -top-2 -left-2 z-10 rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--primary-foreground)]">
                Cover
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute -top-2 -right-2 z-10 size-5 rounded-full"
              onClick={() => remove(index)}
            >
              <X size={11} />
            </Button>
            <FormField
              control={control}
              name={`images.${index}.path`}
              render={({ field: f }) => (
                <UploadZone
                  value={f.value}
                  onChange={(path) => f.onChange(path ?? "")}
                  uploadPath={`companies/${companyId}/products/image`}
                  shape="square"
                />
              )}
            />
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => append({ path: "" })}>
        <Plus /> Add image
      </Button>
    </div>
  )
}

export interface ProductFormDialogProps {
  trigger: ReactNode
  companyId: string
  product?: Product
  onSuccess?: (product: Product) => void
}

export function ProductFormDialog({
  trigger,
  companyId,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const siblingProducts = useProductsByCompany(companyId)
  const isEditing = Boolean(product)
  const isPending = createProduct.isPending || updateProduct.isPending

  const existingCategories = Array.from(
    new Set((siblingProducts.data ?? []).map((p) => p.category).filter(Boolean)),
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toFormValues(product),
  })

  async function onSubmit(values: ProductFormValues) {
    const input = {
      name: values.name,
      price: values.price,
      category: values.category,
      imagePaths: values.images.map((i) => i.path).filter(Boolean),
      companyId,
      // New products get their real position from createProduct itself; edits keep their existing spot — reordering happens only via drag in ProductsTab.
      sortOrder: product?.sortOrder ?? 0,
    }

    try {
      const result = isEditing
        ? await updateProduct.mutateAsync({ id: product!.id, input })
        : await createProduct.mutateAsync(input)
      toast.success(isEditing ? "Product updated" : "Product added", { description: result.name })
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
        if (next) form.reset(toFormValues(product))
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product name</FormLabel>
                  <FormControl>
                    <Input placeholder="CO₂ Wire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Custom quote, or $49" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input list="product-category-options" placeholder="e.g. Wires, Tools, Safety" {...field} />
                  </FormControl>
                  <datalist id="product-category-options">
                    {existingCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ProductImagesFieldArray control={form.control} companyId={companyId} />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEditing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
