import type { Category } from "../types/category.ts";

export const categories: Category[] = ((globalThis as unknown as { __LUXE_CATALOG__?: { categories?: Category[] } }).__LUXE_CATALOG__?.categories ?? []) as Category[];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getChildCategories(parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

export function getFeaturedCategories(): Category[] {
  return categories.filter((c) => c.featured && !c.parentId);
}

export default categories;
