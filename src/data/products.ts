import type { Product } from "../types/product.ts";

const runtimeProducts = ((globalThis as unknown as { __LUXE_CATALOG__?: { products?: Product[] } }).__LUXE_CATALOG__?.products ?? []) as Product[];

export const products: Product[] = runtimeProducts;
export default products;
