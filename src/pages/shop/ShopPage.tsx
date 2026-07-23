import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "../../components/product/ProductCard.tsx";
import ProductCardSkeleton from "../../components/product/ProductCardSkeleton.tsx";
import products from "../../data/products.ts";
import categories, { getCategoryBySlug } from "../../data/categories.ts";
import brands from "../../data/brands.ts";
import { applyFilters, sortProducts } from "../../lib/products.ts";
import type { FilterState, SortOption } from "../../types/product.ts";
import { cn } from "@/lib/utils.ts";

const defaultFilters: FilterState = {
  brands: [],
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 0,
  gender: "",
  onSale: false,
  isNew: false,
  inStock: false,
  prontaConsegna: false,
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Più Recenti" },
  { value: "price_asc", label: "Prezzo Crescente" },
  { value: "price_desc", label: "Prezzo Decrescente" },
  { value: "best_sellers", label: "Più Venduti" },
  { value: "discount", label: "Maggiore Sconto" },
];

const allSizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

function FilterPanel({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const [expanded, setExpanded] = useState<string[]>(["brand", "size"]);

  const toggle = (section: string) => {
    setExpanded((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const toggleBrand = (brand: string) => {
    onChange({
      ...filters,
      brands: filters.brands.includes(brand) ? filters.brands.filter((b) => b !== brand) : [...filters.brands, brand],
    });
  };

  const toggleSize = (size: string) => {
    onChange({
      ...filters,
      sizes: filters.sizes.includes(size) ? filters.sizes.filter((s) => s !== size) : [...filters.sizes, size],
    });
  };

  const sections = [
    {
      id: "brand", label: "Brand",
      content: (
        <div className="space-y-2">
          {brands
            .filter((b, index) => index < 48 || filters.brands.includes(b.name))
            .map((b) => (
            <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brands.includes(b.name)}
                onChange={() => toggleBrand(b.name)}
                className="rounded border-border accent-foreground"
              />
              <span className="text-sm group-hover:text-accent transition-colors">{b.name}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "size", label: "Taglia",
      content: (
        <div className="flex flex-wrap gap-1.5">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "px-2.5 py-1 border rounded text-xs font-medium transition-colors",
                filters.sizes.includes(size)
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "availability", label: "Disponibilità",
      content: (
        <div className="space-y-2.5">
          {[
            { key: "inStock", label: "In Stock" },
            { key: "isNew", label: "Nuovi Arrivi" },
            { key: "onSale", label: "In Saldo" },
            { key: "prontaConsegna", label: "Pronta Consegna" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[key as keyof FilterState] as boolean}
                onChange={() => onChange({ ...filters, [key]: !filters[key as keyof FilterState] })}
                className="rounded border-border accent-foreground"
              />
              <span className="text-sm group-hover:text-accent transition-colors">{label}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "gender", label: "Genere",
      content: (
        <div className="space-y-2">
          {[{ value: "", label: "Tutti" }, { value: "uomo", label: "Uomo" }, { value: "donna", label: "Donna" }, { value: "unisex", label: "Unisex" }].map((g) => (
            <label key={g.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={filters.gender === g.value}
                onChange={() => onChange({ ...filters, gender: g.value as FilterState["gender"] })}
                className="accent-foreground"
              />
              <span className="text-sm">{g.label}</span>
            </label>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-1">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-border last:border-b-0">
          <button
            onClick={() => toggle(section.id)}
            className="w-full flex items-center justify-between py-3.5 text-sm font-bold hover:text-accent transition-colors"
          >
            {section.label}
            <ChevronDown size={14} className={cn("transition-transform", expanded.includes(section.id) && "rotate-180")} />
          </button>
          <AnimatePresence>
            {expanded.includes(section.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                {section.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(48);

  const categoryData = category ? getCategoryBySlug(category) : undefined;

  const baseProducts = useMemo(() => {
    let list = [...products];
    if (category === "piu-venduti") return list.filter((p) => p.isBestSeller);
    if (searchQuery) return list.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (category) list = list.filter((p) => p.categories.includes(category));
    return list;
  }, [category, searchQuery]);

  const filteredProducts = useMemo(() => {
    return sortProducts(applyFilters(baseProducts, filters), sort);
  }, [baseProducts, filters, sort]);

  useEffect(() => {
    setVisibleCount(48);
  }, [category, searchQuery, filters, sort]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const hasActiveFilters = filters.brands.length > 0 || filters.sizes.length > 0 || filters.onSale || filters.isNew || filters.inStock || filters.prontaConsegna || filters.gender !== "";

  const pageTitle = categoryData?.nameIt ?? (searchQuery ? `Risultati per "${searchQuery}"` : "Tutti i Prodotti");
  const parentCategory = categoryData?.parentId ? categories.find((c) => c.id === categoryData.parentId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        {parentCategory && (
          <>
            <Link to={`/shop/${parentCategory.slug}`} className="hover:text-foreground transition-colors">{parentCategory.nameIt}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">{pageTitle}</span>
      </nav>

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredProducts.length} prodotti</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="hidden md:block text-sm border border-border rounded px-3 py-2 bg-background font-medium outline-none focus:border-foreground cursor-pointer"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border border-border rounded px-4 py-2 text-sm font-semibold hover:border-foreground transition-colors md:hidden"
          >
            <SlidersHorizontal size={15} /> Filtri
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-xs text-muted-foreground font-semibold">Filtri attivi:</span>
          {filters.brands.map((b) => (
            <button key={b} onClick={() => setFilters({ ...filters, brands: filters.brands.filter((x) => x !== b) })} className="flex items-center gap-1 text-xs border border-border rounded-full px-3 py-1 hover:bg-muted">
              {b} <X size={11} />
            </button>
          ))}
          {filters.sizes.map((s) => (
            <button key={s} onClick={() => setFilters({ ...filters, sizes: filters.sizes.filter((x) => x !== s) })} className="flex items-center gap-1 text-xs border border-border rounded-full px-3 py-1 hover:bg-muted">
              {s} <X size={11} />
            </button>
          ))}
          {filters.onSale && <button onClick={() => setFilters({ ...filters, onSale: false })} className="flex items-center gap-1 text-xs border border-red-300 text-red-600 rounded-full px-3 py-1 hover:bg-red-50">Saldi <X size={11} /></button>}
          {filters.isNew && <button onClick={() => setFilters({ ...filters, isNew: false })} className="flex items-center gap-1 text-xs border border-border rounded-full px-3 py-1 hover:bg-muted">Nuovi <X size={11} /></button>}
          <button onClick={() => setFilters(defaultFilters)} className="text-xs text-accent font-semibold ml-2">Cancella tutto</button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest">Filtra</h3>
              {hasActiveFilters && (
                <button onClick={() => setFilters(defaultFilters)} className="text-xs text-accent font-semibold">
                  Reset
                </button>
              )}
            </div>
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <span className="text-sm text-muted-foreground">{filteredProducts.length} prodotti</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm border border-border rounded px-3 py-2 bg-background font-medium outline-none"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-bold text-lg mb-2">Nessun prodotto trovato</p>
              <p className="text-muted-foreground text-sm mb-6">Prova a modificare i filtri o la ricerca</p>
              <button onClick={() => setFilters(defaultFilters)} className="text-sm font-semibold underline underline-offset-4">
                Rimuovi tutti i filtri
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {displayedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setVisibleCount((count) => count + 48)}
                    className="rounded border-2 border-foreground px-6 py-3 text-sm font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
                  >
                    Carica altri prodotti
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-[100] bg-black/40" />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween" }}
              className="fixed inset-y-0 left-0 z-[101] w-[min(20rem,calc(100vw-2rem))] bg-background p-5 sm:p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-widest text-sm">Filtra</h3>
                <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
              </div>
              <FilterPanel filters={filters} onChange={setFilters} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
