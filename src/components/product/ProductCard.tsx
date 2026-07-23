import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../../types/product.ts";
import { useCart } from "../../contexts/CartContext.tsx";
import { useWishlist } from "../../contexts/WishlistContext.tsx";
import { formatPrice, getDiscountPercent } from "../../lib/products.ts";
import { cn } from "@/lib/utils.ts";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discountPercent = getDiscountPercent(product);
  const effectivePrice = product.salePrice ?? product.price;
  const availableSizes = product.variants.filter((v) => v.available && v.size).slice(0, 5);
  const hasOneSize = product.variants.length === 1 && product.variants[0]?.size === "Taglia Unica";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const firstAvailable = product.variants.find((v) => v.available);
    if (firstAvailable) {
      addItem(product, firstAvailable.size, firstAvailable.color, firstAvailable.id);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.025, ease: "easeOut" }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-muted rounded">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                Nuovo
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isProntaConsegna && !product.isNew && discountPercent === 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                Pronta
              </span>
            )}
            {product.stockStatus === "out_of_stock" && (
              <span className="bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
                Esaurito
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-2">
            <button
              onClick={handleWishlist}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all",
                wishlisted
                  ? "bg-foreground text-background"
                  : "bg-background/90 text-foreground hover:bg-foreground hover:text-background"
              )}
              aria-label={wishlisted ? "Rimuovi dalla wishlist" : "Aggiungi alla wishlist"}
            >
              <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 inset-x-0 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stockStatus === "out_of_stock"}
              className="w-full bg-foreground/95 backdrop-blur-sm text-background py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground transition-colors"
            >
              <ShoppingBag size={13} />
              {product.stockStatus === "out_of_stock" ? "Esaurito" : "Aggiungi al Carrello"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-2.5 sm:pt-3 space-y-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">{product.brand}</p>
          <p className="text-sm font-semibold leading-snug line-clamp-2 break-words min-h-[2.5rem]">{product.title}</p>

          {/* Sizes preview */}
          {!hasOneSize && availableSizes.length > 0 && (
            <div className="hidden sm:flex gap-1 flex-wrap">
              {availableSizes.map((v) => (
                <span key={v.id} className="text-[10px] text-muted-foreground font-medium border border-border rounded px-1.5 py-0.5">
                  {v.size}
                </span>
              ))}
              {product.variants.filter((v) => v.available).length > 5 && (
                <span className="text-[10px] text-muted-foreground">+{product.variants.filter((v) => v.available).length - 5}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
            <span className={cn("font-bold text-sm", discountPercent > 0 && "text-red-500")}>
              {formatPrice(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
