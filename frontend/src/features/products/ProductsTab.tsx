import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { Reorder, useDragControls } from "framer-motion"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ProductFormDialog } from "./components/ProductFormDialog"
import { useDeleteProduct, useProductsByCompany, useReorderProducts } from "./hooks/useProducts"
import type { Product } from "./types"

export function ProductsTab({ companyId }: { companyId: string }) {
  const products = useProductsByCompany(companyId)
  const deleteProduct = useDeleteProduct()
  const reorderProductsMutation = useReorderProducts()
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Local drag order, re-synced whenever the server data changes (e.g. after add/delete) — kept
  // separate from `products.data`'s own order so dragging feels instant, not round-trip-latency-gated.
  useEffect(() => {
    if (products.data) setOrderedIds(products.data.map((p) => p.id))
  }, [products.data])

  async function handleDelete(id: string, name: string) {
    await deleteProduct.mutateAsync({ id, companyId })
    toast.success("Product deleted", { description: name })
  }

  function persistOrder(nextOrder: string[]) {
    reorderProductsMutation.mutate({ companyId, orderedIds: nextOrder })
  }

  const categories = Array.from(new Set((products.data ?? []).map((p) => p.category).filter(Boolean)))
  const orderedProducts = orderedIds
    .map((id) => products.data?.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
  const visibleProducts =
    categoryFilter === "all" ? orderedProducts : orderedProducts.filter((p) => p.category === categoryFilter)
  const canReorder = categoryFilter === "all"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Shown on every employee's public profile for this company. Drag to reorder.
        </p>
        <ProductFormDialog
          companyId={companyId}
          trigger={
            <Button size="sm">
              <Plus /> Add Product
            </Button>
          }
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {["all", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                categoryFilter === category
                  ? "border-[var(--primary)] bg-accent"
                  : "border-[var(--border)] hover:bg-accent",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {products.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!products.isLoading && visibleProducts.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-muted-foreground">
          {products.data?.length ? "No products in this category." : "No products yet."}
        </div>
      )}

      {!products.isLoading &&
        visibleProducts.length > 0 &&
        (canReorder ? (
          <Reorder.Group
            axis="y"
            values={visibleProducts.map((p) => p.id)}
            onReorder={setOrderedIds}
            className="flex flex-col gap-2"
          >
            {visibleProducts.map((product) => (
              <ProductReorderRow
                key={product.id}
                product={product}
                companyId={companyId}
                onDelete={handleDelete}
                onDragEnd={() => persistOrder(orderedIds)}
              />
            ))}
          </Reorder.Group>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="w-4 shrink-0" />
                <ProductRowContent product={product} companyId={companyId} onDelete={handleDelete} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Switch to "All" to drag and reorder products.</p>
          </div>
        ))}
    </div>
  )
}

function ProductReorderRow({
  product,
  companyId,
  onDelete,
  onDragEnd,
}: {
  product: Product
  companyId: string
  onDelete: (id: string, name: string) => void
  onDragEnd: () => void
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={product.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="flex items-center gap-3 rounded-xl border bg-card p-3"
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>
      <ProductRowContent product={product} companyId={companyId} onDelete={onDelete} />
    </Reorder.Item>
  )
}

function ProductRowContent({
  product,
  companyId,
  onDelete,
}: {
  product: Product
  companyId: string
  onDelete: (id: string, name: string) => void
}) {
  return (
    <>
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {product.imagePaths[0] ? (
          <img src={product.imagePaths[0]} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[10px] text-muted-foreground">{product.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{product.name}</span>
          {product.category && <Badge variant="secondary">{product.category}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{product.price}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <ProductFormDialog
          companyId={companyId}
          product={product}
          trigger={
            <Button variant="ghost" size="icon-sm">
              <Pencil />
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be removed from every employee's profile at this company. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => onDelete(product.id, product.name)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
