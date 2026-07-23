export type Brand = { id: string; name: string };

export const brands: Brand[] = ((globalThis as unknown as { __LUXE_CATALOG__?: { brands?: Brand[] } }).__LUXE_CATALOG__?.brands ?? []) as Brand[];

export default brands;
