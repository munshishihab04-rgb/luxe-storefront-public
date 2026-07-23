import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext.tsx";
import { formatPrice } from "../../lib/products.ts";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6 sm:mb-8">
        Carrello {totalItems > 0 && <span className="text-muted-foreground font-normal text-lg">({totalItems} articoli)</span>}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag size={36} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-xl mb-2">Il tuo carrello è vuoto</p>
            <p className="text-muted-foreground">Aggiungi prodotti per procedere all&apos;acquisto</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded font-bold text-sm hover:bg-foreground/90 transition-colors">
            Vai allo Shop <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          {/* Items */}
          <div className="md:col-span-2 space-y-6">
            {items.map((item) => {
              const price = item.product.salePrice ?? item.product.price;
              return (
                <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-3 sm:gap-5 pb-5 sm:pb-6 border-b border-border min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded bg-muted" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{item.product.brand}</p>
                        <Link to={`/product/${item.product.slug}`} className="font-semibold text-sm leading-snug line-clamp-2 hover:text-accent transition-colors block">
                          {item.product.title}
                        </Link>
                        {item.selectedSize && <p className="text-xs text-muted-foreground mt-1">Taglia: {item.selectedSize}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="shrink-0 p-1.5 hover:bg-muted rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 sm:mt-4">
                      <div className="flex items-center border border-border rounded overflow-hidden">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="px-2.5 sm:px-3 py-2 hover:bg-muted transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 sm:px-4 text-sm font-semibold min-w-[2.25rem] sm:min-w-[3rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="px-2.5 sm:px-3 py-2 hover:bg-muted transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="font-black text-base">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="border border-border rounded p-4 sm:p-6 space-y-4 md:sticky md:top-24">
              <h2 className="font-black text-lg">Riepilogo Ordine</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotale ({totalItems} articoli)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spedizione</span>
                  <span className="font-semibold text-green-600">Gratuita</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-black">Totale</span>
                <span className="font-black text-xl">{formatPrice(totalPrice)}</span>
              </div>
              <div className="space-y-3">
                {/* Promo code */}
                <div className="flex flex-col min-[380px]:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Codice promozionale"
                    className="flex-1 px-3 py-2 border border-border rounded text-sm outline-none focus:border-foreground bg-background"
                  />
                  <button className="px-4 py-2 border border-border rounded text-sm font-semibold hover:bg-muted transition-colors">
                    Applica
                  </button>
                </div>
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded font-black text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors"
                >
                  Procedi al Checkout <ArrowRight size={14} />
                </Link>
                <Link to="/shop" className="w-full flex items-center justify-center py-3 border border-border rounded text-sm font-semibold hover:bg-muted transition-colors">
                  Continua lo Shopping
                </Link>
              </div>
              {/* Trust */}
              <div className="pt-2 space-y-2">
                {["Pagamento 100% sicuro", "Spedizione tracciata inclusa", "Reso gratuito entro 14 giorni"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
