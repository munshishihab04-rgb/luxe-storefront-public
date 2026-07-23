import type { Product, FilterState, SortOption } from "../types/product.ts";
import products from "../data/products.ts";

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categories.includes(categorySlug));
}

export function getNewArrivals(limit?: number): Product[] {
  const filtered = products.filter((p) => p.isNew);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getBestSellers(limit?: number): Product[] {
  const filtered = products.filter((p) => p.isBestSeller);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getFeaturedProducts(limit?: number): Product[] {
  const filtered = products.filter((p) => p.isFeatured);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getSaleProducts(limit?: number): Product[] {
  const filtered = products.filter((p) => p.isSale);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getProntaConsegna(limit?: number): Product[] {
  const filtered = products.filter((p) => p.isProntaConsegna);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getCollectionProducts(collection: string, limit?: number): Product[] {
  const filtered = products.filter((p) => p.collection === collection);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && (p.brand === product.brand || p.categories.some((c) => product.categories.includes(c))))
    .slice(0, limit);
}

export function getDiscountPercent(product: Product): number {
  if (!product.salePrice || product.salePrice >= product.regularPrice) return 0;
  return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
}

export function getEffectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

export function applyFilters(productList: Product[], filters: FilterState): Product[] {
  return productList.filter((p) => {
    if (filters.brands.length > 0 && !filters.brands.some((b) => p.brand.toLowerCase().includes(b.toLowerCase()))) return false;
    if (filters.sizes.length > 0 && !p.variants.some((v) => v.size && filters.sizes.includes(v.size) && v.available)) return false;
    if (filters.minPrice > 0 && getEffectivePrice(p) < filters.minPrice) return false;
    if (filters.maxPrice > 0 && getEffectivePrice(p) > filters.maxPrice) return false;
    if (filters.gender && p.gender !== "unisex" && p.gender !== filters.gender) return false;
    if (filters.onSale && !p.isSale) return false;
    if (filters.isNew && !p.isNew) return false;
    if (filters.inStock && p.stockStatus === "out_of_stock") return false;
    if (filters.prontaConsegna && !p.isProntaConsegna) return false;
    return true;
  });
}

export function sortProducts(productList: Product[], sort: SortOption): Product[] {
  const sorted = [...productList];
  switch (sort) {
    case "newest":
      return sorted.filter((p) => p.isNew).concat(sorted.filter((p) => !p.isNew));
    case "price_asc":
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case "price_desc":
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case "best_sellers":
      return sorted.filter((p) => p.isBestSeller).concat(sorted.filter((p) => !p.isBestSeller));
    case "discount":
      return sorted.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    default:
      return sorted;
  }
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency, minimumFractionDigits: 0 }).format(price);
}

export default products;
