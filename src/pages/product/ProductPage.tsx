import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Share2, ChevronLeft, ChevronRight, Shield, Truck, RotateCcw, Award, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { getProductBySlug, getRelatedProducts, formatPrice, getDiscountPercent } from "../../lib/products.ts";
import { useCart } from "../../contexts/CartContext.tsx";
import { useWishlist } from "../../contexts/WishlistContext.tsx";
import ProductCard from "../../components/product/ProductCard.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import { canPurchaseSelection, serializeJsonLd } from "./product-utils.ts";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = slug ? getProductBySlug(slug) : undefined;
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="font-bold text-lg">Prodotto non trovato</p>
        <Link to="/shop" className="text-sm text-accent underline underline-offset-4">Torna allo shop</Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product, 4);
  const discountPercent = getDiscountPercent(product);
  const effectivePrice = product.salePrice ?? product.price;
  const wishlisted = isWishlisted(product.id);
  const selectedVariantData = product.variants.find((v) => v.id === selectedVariant);
  const uniqueSizes = product.variants.filter((v) => v.size);

  const handleAddToCart = () => {
    if (!canPurchaseSelection(product, selectedVariant)) {
      toast.error("Seleziona una taglia prima di procedere");
      return false;
    }
    addItem(product, selectedVariantData?.size, selectedVariantData?.color, selectedVariant ?? undefined);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) navigate("/checkout");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.title, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
      toast.success("Link prodotto condiviso");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Impossibile condividere il link");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 min-w-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mb-4 sm:mb-8 min-w-0 overflow-hidden whitespace-nowrap">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate min-w-0">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-16 min-w-0">
        {/* ─── IMAGE GALLERY ─────────────────────────────────────────────────────── */}
        <div className="space-y-2 sm:space-y-3 min-w-0 max-w-full">
          {/* Main image */}
          <div className="relative aspect-square overflow-hidden rounded bg-muted group">
            <motion.img
              key={activeImage}
              src={product.images[activeImage]}
              alt={product.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && <span className="bg-foreground text-background text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm">Nuovo</span>}
              {discountPercent > 0 && <span className="bg-red-500 text-white text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm">-{discountPercent}%</span>}
            </div>
            {/* Nav arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Immagine precedente"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % product.images.length)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/85 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Immagine successiva"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Mostra immagine ${i + 1} di ${product.title}`}
                  className={cn(
                    "shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden border-2 transition-colors",
                    i === activeImage ? "border-foreground" : "border-transparent hover:border-muted-foreground"
                  )}
                >
                  <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── PRODUCT INFO ───────────────────────────────────────────────────────── */}
        <div className="md:sticky md:top-24 space-y-4 sm:space-y-6 min-w-0">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{product.brand}</p>
              <button
                onClick={handleShare}
                className="p-2 rounded hover:bg-muted transition-colors"
                aria-label="Condividi"
              >
                <Share2 size={16} />
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2 sm:mb-3 break-words">{product.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.shortDescription}</p>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={cn("text-2xl sm:text-3xl font-black", discountPercent > 0 && "text-red-500")}>
              {formatPrice(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-base sm:text-lg text-muted-foreground line-through">{formatPrice(product.regularPrice)}</span>
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">-{discountPercent}%</span>
              </>
            )}
          </div>

          {/* Size Selector */}
          {uniqueSizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">Seleziona Taglia</p>
                <button className="text-xs text-accent font-semibold underline underline-offset-4">
                  Guida alle taglie
                </button>
              </div>
              <div className="grid grid-cols-3 min-[380px]:grid-cols-4 sm:grid-cols-5 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    disabled={!variant.available}
                    onClick={() => setSelectedVariant(variant.id === selectedVariant ? null : variant.id)}
                    className={cn(
                      "min-h-11 px-1 py-2.5 text-sm font-semibold rounded border transition-all relative",
                      !variant.available && "opacity-30 cursor-not-allowed line-through",
                      variant.id === selectedVariant
                        ? "bg-foreground text-background border-foreground"
                        : variant.available
                        ? "border-border hover:border-foreground"
                        : "border-border"
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full min-h-12 flex items-center justify-center gap-2 bg-foreground text-background px-3 py-3.5 sm:py-4 rounded font-black text-xs sm:text-sm uppercase tracking-wide sm:tracking-widest hover:bg-foreground/90 transition-colors"
            >
              <ShoppingBag size={16} />
              Aggiungi al Carrello
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full min-h-12 flex items-center justify-center gap-2 border-2 border-foreground px-3 py-3.5 sm:py-4 rounded font-black text-xs sm:text-sm uppercase tracking-wide sm:tracking-widest hover:bg-foreground hover:text-background transition-all"
            >
              Acquista Subito <ArrowRight size={16} />
            </button>
            <button
              onClick={() => toggle(product)}
              className={cn(
                "w-full min-h-11 min-[420px]:col-span-2 flex items-center justify-center gap-2 py-3 rounded border text-sm font-semibold transition-all",
                wishlisted
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Nella Wishlist" : "Aggiungi alla Wishlist"}
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 py-4 border-y border-border">
            {[
              { icon: Truck, text: "Spedizione Tracciata", sub: "Consegna 24/48h" },
              { icon: Shield, text: "Pagamento Sicuro", sub: "SSL certificato" },
              { icon: Award, text: "Autenticità Garantita", sub: "Verificato dagli esperti" },
              { icon: RotateCcw, text: "Reso Gratuito", sub: "Entro 14 giorni" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <item.icon size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">{item.text}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-bold mb-2">Descrizione</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.longDescription}</p>
          </div>

          {/* SKU */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground pt-2">
            <span>SKU: {product.sku}</span>
            <span>Categoria: {product.productType}</span>
            {product.collection && <span>Collezione: {product.collection}</span>}
          </div>
        </div>
      </div>

      {/* ─── RELATED PRODUCTS ─────────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 sm:mt-16 md:mt-20">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-5 sm:mb-8">Potrebbe Piacerti</h2>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: serializeJsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.shortDescription,
          brand: { "@type": "Brand", name: product.brand },
          sku: product.sku,
          offers: {
            "@type": "Offer",
            price: effectivePrice,
            priceCurrency: "EUR",
            availability: product.availability === "in stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }),
      }} />
    </div>
  );
}
