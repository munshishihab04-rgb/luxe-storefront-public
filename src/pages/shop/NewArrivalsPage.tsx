import ProductCard from "../../components/product/ProductCard.tsx";
import { getNewArrivals } from "../../lib/products.ts";

const newArrivals = getNewArrivals();

export default function NewArrivalsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-10">
        <span className="text-xs font-black uppercase tracking-widest text-accent block mb-2">Stagione 2025</span>
        <h1 className="text-4xl font-black tracking-tight">Nuovi Arrivi</h1>
        <p className="text-muted-foreground mt-2">{newArrivals.length} nuovi prodotti</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
