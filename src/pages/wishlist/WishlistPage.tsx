import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import ProductCard from "../../components/product/ProductCard.tsx";
import { useWishlist } from "../../contexts/WishlistContext.tsx";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-3xl font-black tracking-tight mb-2">Wishlist</h1>
      <p className="text-muted-foreground text-sm mb-10">{items.length} {items.length === 1 ? "prodotto salvato" : "prodotti salvati"}</p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Heart size={36} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-xl mb-2">La tua wishlist è vuota</p>
            <p className="text-muted-foreground text-sm">Salva i prodotti che ami per ritrovarli facilmente</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded font-bold text-sm hover:bg-foreground/90 transition-colors">
            Vai allo Shop <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
