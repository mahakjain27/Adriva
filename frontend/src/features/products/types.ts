export interface Product {
  id: string
  companyId: string
  name: string
  price: string
  /** Relative paths to the uploaded images (`blob:` URLs until a real backend exists) — never pasted external URLs. First entry is the cover shown on the profile card. */
  imagePaths: string[]
  /** Free text, blank = uncategorized. */
  category: string
  /** Controls display/carousel order — lower first. Maintained by drag-to-reorder in ProductsTab, not user-editable directly. */
  sortOrder: number
  createdAt: string
}

export type ProductInput = Omit<Product, "id" | "createdAt">
