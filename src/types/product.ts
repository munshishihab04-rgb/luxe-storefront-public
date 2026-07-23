export type Gender = "uomo" | "donna" | "unisex" | "bambini";
export type AgeGroup = "adulto" | "bambino";
export type StockStatus = "in_stock" | "out_of_stock" | "preorder";
export type Availability = "in stock" | "out of stock" | "preorder";
export type Condition = "new" | "used" | "refurbished";

export type ProductVariant = {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  price?: number;
  stock: number;
  available: boolean;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  brand: string;
  categories: string[];
  productType: string;
  gender: Gender;
  ageGroup: AgeGroup;
  price: number;
  regularPrice: number;
  salePrice?: number;
  suggestedPrice?: number;
  currency: string;
  availability: Availability;
  stockStatus: StockStatus;
  sku: string;
  itemGroupId: string;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  googleProductCategory: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isSale?: boolean;
  isProntaConsegna?: boolean;
  collection?: string;
};

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
};

export type WishlistItem = {
  productId: string;
  product: Product;
};

export type FilterState = {
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  gender: Gender | "";
  onSale: boolean;
  isNew: boolean;
  inStock: boolean;
  prontaConsegna: boolean;
};

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "best_sellers"
  | "most_wanted"
  | "discount";
