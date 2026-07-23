import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../../contexts/CartContext.tsx";
import { formatPrice } from "../../lib/products.ts";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-[201] w-full max-w-md bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
              <h2 className="font-bold text-lg tracking-tight">
                Carrello {totalItems > 0 && <span className="text-muted-foreground font-normal text-sm">({totalItems})</span>}
              </h2>
              <button onClick={closeCart} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 min-w-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Il tuo carrello è vuoto</p>
                    <p className="text-sm text-muted-foreground">Aggiungi prodotti per procedere all&apos;acquisto</p>
                  </div>
                  <button onClick={closeCart} className="text-sm font-semibold underline underline-offset-4">
                    Continua a fare shopping
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const price = item.product.salePrice ?? item.product.price;
                  return (
                    <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-3 sm:gap-4 min-w-0">
                      <Link to={`/product/${item.product.slug}`} onClick={closeCart} className="shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded bg-muted"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{item.product.brand}</p>
                        <Link to={`/product/${item.product.slug}`} onClick={closeCart} className="text-sm font-semibold leading-tight block truncate hover:text-accent transition-colors">
                          {item.product.title}
                        </Link>
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground mt-0.5">Taglia: {item.selectedSize}</p>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-border rounded">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                              className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-sm font-medium min-w-[1.75rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="font-bold text-sm">{formatPrice(price * item.quantity)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="shrink-0 self-start p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-4 sm:px-6 py-4 sm:py-5 space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span className="font-bold text-base">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Spedizione e tasse calcolate al checkout</p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded font-bold text-sm hover:bg-foreground/90 transition-colors"
                >
                  Vai al Checkout <ArrowRight size={16} />
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center py-3 rounded border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Visualizza Carrello
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
