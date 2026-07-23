import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../../contexts/CartContext.tsx";
import { useWishlist } from "../../contexts/WishlistContext.tsx";
import navigation from "../../data/navigation.ts";
import type { NavigationItem } from "../../types/category.ts";
import { searchProducts } from "../../lib/products.ts";
import { cn } from "@/lib/utils.ts";

// ─── Search Overlay ────────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(searchProducts(""));
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchProducts(query).slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm"
    >
      <div className="max-w-2xl mx-auto px-4 pt-16 sm:pt-24">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 sm:gap-4 border-b-2 border-foreground pb-3">
            <Search size={22} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca prodotti, brand, modelli..."
              className="flex-1 min-w-0 text-base sm:text-2xl font-medium bg-transparent outline-none placeholder:text-muted-foreground/50"
            />
            <button type="button" onClick={onClose} className="shrink-0">
              <X size={22} />
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="mt-6 space-y-1">
            {results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted transition-colors min-w-0"
              >
                <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{product.title}</div>
                  <div className="text-xs text-muted-foreground">{product.brand}</div>
                </div>
                <div className="ml-auto text-xs sm:text-sm font-bold shrink-0">
                  {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(product.salePrice ?? product.price)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">Nessun risultato per &ldquo;{query}&rdquo;</p>
        )}

        {query.length < 2 && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-semibold">Ricerche Popolari</p>
            <div className="flex flex-wrap gap-2">
              {["Jordan 1", "Samba OG", "Yeezy", "Dunk Low", "Louis Vuitton", "Golden Goose"].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 border border-border rounded-full text-sm hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Mega Menu ─────────────────────────────────────────────────────────────────
function MegaMenu({ item, isOpen }: { item: NavigationItem; isOpen: boolean }) {
  if (!item.children) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-8">
            {item.children.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.items.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-sm hover:text-accent transition-colors flex items-center gap-2">
                        {link.label}
                        {link.badge && <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">{link.badge}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {item.featured && item.featured.length > 0 && (
              <div className="grid grid-cols-2 gap-4 col-span-1">
                {item.featured.map((feat) => (
                  <Link key={feat.href} to={feat.href} className="group block">
                    <div className="aspect-[3/2] overflow-hidden rounded bg-muted mb-2">
                      <img src={feat.image} alt={feat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide">{feat.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Menu ───────────────────────────────────────────────────────────────
function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed inset-0 z-[150] bg-background flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4 sm:p-5 border-b border-border">
        <Link to="/" onClick={onClose} className="font-black text-2xl tracking-tight">LUXE.</Link>
        <button onClick={onClose} className="p-2 -mr-2" aria-label="Chiudi menu"><X size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => (
          <div key={item.href} className="border-b border-border">
            {item.children ? (
              <>
                <button
                  onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                  className="w-full flex items-center justify-between px-5 py-4 text-base font-semibold"
                >
                  {item.label}
                  <ChevronDown size={16} className={cn("transition-transform", expanded === item.href && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {expanded === item.href && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-muted/30"
                    >
                      {item.children.map((col) => (
                        <div key={col.title} className="px-5 py-3">
                          <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">{col.title}</p>
                          {col.items.map((link) => (
                            <Link key={link.href} to={link.href} onClick={onClose} className="block py-1.5 text-sm hover:text-accent">
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link to={item.href} onClick={onClose} className="block px-5 py-4 text-base font-semibold hover:text-accent">
                {item.label}
              </Link>
            )}
          </div>
        ))}

        <div className="px-5 py-6 space-y-4">
          <Link to="/account" onClick={onClose} className="flex items-center gap-3 text-sm font-medium">
            <User size={18} /> Il mio account
          </Link>
          <Link to="/wishlist" onClick={onClose} className="flex items-center gap-3 text-sm font-medium">
            <Heart size={18} /> Wishlist
          </Link>
          <Link to="/contact" onClick={onClose} className="flex items-center gap-3 text-sm font-medium">
            Contattaci
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] bg-background transition-shadow",
          scrolled && "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 -ml-2 shrink-0" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="font-black text-xl sm:text-2xl tracking-tight shrink-0">
            LUXE.
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navigation.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setActiveMenu(item.href)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors",
                    item.label === "Saldi" && "text-red-500 hover:text-red-600",
                    activeMenu === item.href && "bg-muted"
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown size={13} className={cn("transition-transform", activeMenu === item.href && "rotate-180")} />}
                </Link>
                {item.children && (
                  <div
                    onMouseEnter={() => setActiveMenu(item.href)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <MegaMenu item={item} isOpen={activeMenu === item.href} />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-0 sm:gap-1 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Cerca"
            >
              <Search size={20} />
            </button>
            <Link to="/account" className="hidden lg:flex p-2 rounded-md hover:bg-muted transition-colors" aria-label="Account">
              <User size={20} />
            </Link>
            <Link to="/wishlist" className="relative p-2 rounded-md hover:bg-muted transition-colors hidden min-[360px]:flex" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Carrello"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
