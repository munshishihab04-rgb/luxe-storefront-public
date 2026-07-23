import ProductCard from "../../components/product/ProductCard.tsx";
import { getSaleProducts } from "../../lib/products.ts";

const saleProducts = getSaleProducts();

export default function SalePage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <span className="text-xs font-black uppercase tracking-widest text-red-500 block mb-2">Offerte Limitate</span>
        <h1 className="text-4xl font-black tracking-tight">Saldi</h1>
        <p className="text-muted-foreground mt-2">{saleProducts.length} prodotti in saldo</p>
      </div>
      {saleProducts.length === 0 ? (
        <p className="text-muted-foreground py-20 text-center">Nessun prodotto in saldo al momento. Torna presto!</p>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {saleProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
