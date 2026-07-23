import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../types/product.ts";
import type { Category } from "../../types/category.ts";

type Catalog = { products: Product[]; categories: Category[]; brands: { id: string; name: string }[]; updatedAt?: string };

const emptyCatalog: Catalog = { products: [], categories: [], brands: [] };

function euro(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value || 0);
}

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("luxeAdminToken") || "");
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [status, setStatus] = useState("Caricamento...");

  async function api(path: string, options: RequestInit = {}) {
    const res = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", "x-admin-token": token, ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
    return data;
  }

  async function load() {
    try {
      const data = await api("/api/admin/catalog");
      setCatalog(data.catalog);
      setStatus(`Catalogo caricato: ${data.catalog.products.length} prodotti, ${data.catalog.categories.length} categorie`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Errore caricamento");
    }
  }

  useEffect(() => { load(); }, []);

  const products = useMemo(() => {
    const q = query.toLowerCase();
    return catalog.products.filter((p) => !q || p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 250);
  }, [catalog.products, query]);

  const categories = useMemo(() => {
    const q = query.toLowerCase();
    return catalog.categories.filter((c) => !q || c.nameIt.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)).slice(0, 300);
  }, [catalog.categories, query]);

  async function saveProduct() {
    if (!selected) return;
    const data = await api(`/api/admin/products/${encodeURIComponent(selected.id)}`, { method: "PUT", body: JSON.stringify(selected) });
    setCatalog(data.catalog); setSelected(null); setStatus("Prodotto salvato");
  }

  async function deleteProduct(id: string) {
    if (!confirm("Eliminare prodotto?")) return;
    const data = await api(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    setCatalog(data.catalog); setStatus("Prodotto eliminato");
  }

  async function saveCategory() {
    if (!category) return;
    const data = await api(`/api/admin/categories/${encodeURIComponent(category.id)}`, { method: "PUT", body: JSON.stringify(category) });
    setCatalog(data.catalog); setCategory(null); setStatus("Categoria salvata");
  }

  async function deleteCategory(id: string) {
    if (!confirm("Eliminare categoria?")) return;
    const data = await api(`/api/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
    setCatalog(data.catalog); setStatus("Categoria eliminata");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">LUXE Admin</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Catalogo & Categorie</h1>
            <p className="text-neutral-400 mt-2">Gestione runtime JSON: modifiche attive dopo salvataggio e reload storefront.</p>
          </div>
          <a href="/" className="border border-white/20 rounded px-4 py-2 text-sm font-bold hover:bg-white hover:text-black">Vedi sito</a>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/10 p-4"><p className="text-neutral-400 text-xs">Prodotti</p><p className="text-3xl font-black">{catalog.products.length}</p></div>
          <div className="rounded-xl bg-white/10 p-4"><p className="text-neutral-400 text-xs">Categorie</p><p className="text-3xl font-black">{catalog.categories.length}</p></div>
          <div className="rounded-xl bg-white/10 p-4"><p className="text-neutral-400 text-xs">Brand</p><p className="text-3xl font-black">{catalog.brands.length}</p></div>
          <div className="rounded-xl bg-white/10 p-4"><p className="text-neutral-400 text-xs">Aggiornato</p><p className="text-sm font-bold">{catalog.updatedAt || "-"}</p></div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row gap-3 md:items-center">
          <input value={token} onChange={(e)=>{setToken(e.target.value); localStorage.setItem("luxeAdminToken", e.target.value)}} placeholder="Admin token" className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm flex-1" />
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cerca prodotto, SKU, brand, categoria..." className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm flex-[2]" />
          <button onClick={load} className="bg-cyan-300 text-black rounded px-4 py-2 font-black text-sm">Ricarica</button>
          <a href={`/api/admin/export?token=${encodeURIComponent(token)}`} target="_blank" className="border border-white/20 rounded px-4 py-2 text-sm font-bold">Export JSON</a>
        </div>

        <p className="text-sm text-cyan-200">{status}</p>

        <div className="flex gap-2">
          <button onClick={()=>setTab("products")} className={`px-4 py-2 rounded font-bold ${tab==='products'?'bg-white text-black':'bg-white/10'}`}>Prodotti</button>
          <button onClick={()=>setTab("categories")} className={`px-4 py-2 rounded font-bold ${tab==='categories'?'bg-white text-black':'bg-white/10'}`}>Categorie</button>
        </div>

        {tab === "products" ? (
          <div className="grid lg:grid-cols-[1fr_420px] gap-4">
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-white/10 text-left"><tr><th className="p-3">Prodotto</th><th>Brand</th><th>Prezzo</th><th>Stock</th><th></th></tr></thead><tbody>
                {products.map(p=><tr key={p.id} className="border-t border-white/10"><td className="p-3"><b>{p.title}</b><br/><span className="text-neutral-400">{p.sku}</span></td><td>{p.brand}</td><td>{euro(p.salePrice || p.price)}</td><td>{p.stockStatus}</td><td className="text-right pr-3"><button onClick={()=>setSelected({...p})} className="text-cyan-300 font-bold mr-3">Edit</button><button onClick={()=>deleteProduct(p.id)} className="text-red-300 font-bold">Del</button></td></tr>)}
              </tbody></table>
            </div>
            <Editor product={selected} setProduct={setSelected} save={saveProduct} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_420px] gap-4">
            <div className="rounded-xl border border-white/10 overflow-hidden"><table className="w-full text-sm"><thead className="bg-white/10 text-left"><tr><th className="p-3">Categoria</th><th>Slug</th><th>Parent</th><th></th></tr></thead><tbody>
              {categories.map(c=><tr key={c.id} className="border-t border-white/10"><td className="p-3 font-bold">{c.nameIt}</td><td>{c.slug}</td><td>{c.parentId || '-'}</td><td className="text-right pr-3"><button onClick={()=>setCategory({...c})} className="text-cyan-300 font-bold mr-3">Edit</button><button onClick={()=>deleteCategory(c.id)} className="text-red-300 font-bold">Del</button></td></tr>)}
            </tbody></table></div>
            <CategoryEditor category={category} setCategory={setCategory} save={saveCategory} />
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ product, setProduct, save }: { product: Product | null; setProduct: (p: Product | null) => void; save: () => void }) {
  if (!product) return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-neutral-400">Seleziona un prodotto da modificare.</div>;
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 sticky top-4 h-fit">
    <h2 className="text-xl font-black">Modifica prodotto</h2>
    <input className="field" value={product.title} onChange={e=>setProduct({...product,title:e.target.value})} />
    <input className="field" value={product.brand} onChange={e=>setProduct({...product,brand:e.target.value})} />
    <div className="grid grid-cols-2 gap-2"><input className="field" type="number" value={product.price} onChange={e=>setProduct({...product,price:Number(e.target.value)})} /><input className="field" type="number" value={product.regularPrice} onChange={e=>setProduct({...product,regularPrice:Number(e.target.value)})} /></div>
    <textarea className="field h-24" value={product.shortDescription} onChange={e=>setProduct({...product,shortDescription:e.target.value})} />
    <textarea className="field h-32" value={product.longDescription} onChange={e=>setProduct({...product,longDescription:e.target.value})} />
    <input className="field" value={product.categories.join(', ')} onChange={e=>setProduct({...product,categories:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
    <input className="field" value={product.images.join(', ')} onChange={e=>setProduct({...product,images:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
    <div className="flex gap-2"><button onClick={save} className="bg-cyan-300 text-black rounded px-4 py-2 font-black">Salva</button><button onClick={()=>setProduct(null)} className="border border-white/20 rounded px-4 py-2">Chiudi</button></div>
  </div>;
}

function CategoryEditor({ category, setCategory, save }: { category: Category | null; setCategory: (c: Category | null) => void; save: () => void }) {
  if (!category) return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-neutral-400">Seleziona una categoria.</div>;
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 sticky top-4 h-fit">
    <h2 className="text-xl font-black">Modifica categoria</h2>
    <input className="field" value={category.nameIt} onChange={e=>setCategory({...category,nameIt:e.target.value,name:e.target.value})} />
    <input className="field" value={category.slug} onChange={e=>setCategory({...category,slug:e.target.value,id:e.target.value})} />
    <input className="field" value={category.parentId || ''} onChange={e=>setCategory({...category,parentId:e.target.value || undefined})} />
    <textarea className="field h-24" value={category.description || ''} onChange={e=>setCategory({...category,description:e.target.value})} />
    <div className="flex gap-2"><button onClick={save} className="bg-cyan-300 text-black rounded px-4 py-2 font-black">Salva</button><button onClick={()=>setCategory(null)} className="border border-white/20 rounded px-4 py-2">Chiudi</button></div>
  </div>;
}
