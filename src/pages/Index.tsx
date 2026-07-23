import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, RotateCcw, Headphones } from "lucide-react";
import { motion } from "motion/react";
import ProductCard from "../components/product/ProductCard.tsx";
import { getNewArrivals, getBestSellers, getSaleProducts, getFeaturedProducts } from "../lib/products.ts";

const newArrivals = getNewArrivals(8);
const bestSellers = getBestSellers(8);
const saleProducts = getSaleProducts(4);
const featured = getFeaturedProducts(4);

const categoryHighlights = [
  { label: "Sneakers", href: "/shop/sneakers", image: "https://placehold.co/600x800/1a1a1a/ffffff?text=Sneakers", badge: "500+ Modelli" },
  { label: "Uomo", href: "/shop/uomo", image: "https://placehold.co/600x800/2a2a2a/ffffff?text=Uomo", badge: "Nuova Stagione" },
  { label: "Donna", href: "/shop/donna", image: "https://placehold.co/600x800/3a3a3a/ffffff?text=Donna", badge: "Nuovi Arrivi" },
  { label: "Borse", href: "/shop/borse", image: "https://placehold.co/600x800/1a1a1a/f0f0f0?text=Borse", badge: "Luxury" },
  { label: "Accessori", href: "/shop/accessori", image: "https://placehold.co/600x800/4a4a4a/ffffff?text=Accessori", badge: "" },
  { label: "Saldi", href: "/saldi", image: "https://placehold.co/600x800/cc2200/ffffff?text=Saldi", badge: "Fino al -50%" },
];

const trustItems = [
  { icon: Truck, title: "Spedizione Tracciata", desc: "Su tutti gli ordini — Consegna 24/48h" },
  { icon: Shield, title: "Pagamenti Sicuri", desc: "SSL, Visa, Mastercard, PayPal, Klarna" },
  { icon: RotateCcw, title: "Resi Gratuiti", desc: "Entro 14 giorni dall'acquisto" },
  { icon: Headphones, title: "Supporto Dedicato", desc: "Disponibile 7 giorni su 7" },
];

function SectionHeader({ title, subtitle, cta, ctaHref }: { title: string; subtitle?: string; cta?: string; ctaHref?: string }) {
  return (
    <div className="flex flex-col items-start sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 sm:mb-8 min-w-0">
      <div className="min-w-0">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {cta && ctaHref && (
        <Link to={ctaHref} className="flex items-center gap-1 text-xs sm:text-sm font-semibold hover:text-accent transition-colors shrink-0 text-right">
          {cta} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function Index() {
  return (
    <div>
      {/* ─── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[34rem] h-[78svh] max-h-[900px] bg-[#0a0a0a] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://placehold.co/1920x1080/0a0a0a/1a1a1a?text=."
            alt="Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-4"
            >
              Nuova Collezione 2025
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-balance mb-5 sm:mb-6"
            >
              Il Meglio<br />del Lusso<br /><span className="text-accent">Urbano.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm sm:text-base md:text-lg text-white/70 mb-7 sm:mb-10 max-w-md"
            >
              Sneakers, streetwear e accessori di lusso. Ogni prodotto autenticato e spedito in 24/48 ore.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-black text-sm uppercase tracking-widest rounded hover:bg-white/90 transition-colors"
              >
                Esplora lo Shop <ArrowRight size={14} />
              </Link>
              <Link
                to="/nuovi-arrivi"
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-4 font-bold text-sm uppercase tracking-widest rounded hover:bg-white/10 transition-colors"
              >
                Nuovi Arrivi
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-white animate-pulse" />
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <SectionHeader title="In Evidenza" subtitle="I pezzi più ambiti del momento" cta="Vedi tutto" ctaHref="/shop" />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ─── CATEGORY HIGHLIGHTS ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <SectionHeader title="Esplora le Categorie" />
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryHighlights.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link to={cat.href} className="group block relative overflow-hidden rounded">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {cat.badge && (
                    <span className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">{cat.badge}</span>
                  )}
                  <p className="font-black text-white text-base">{cat.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NEW ARRIVALS ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <SectionHeader title="Nuovi Arrivi" subtitle="Le ultime uscite appena arrivate" cta="Tutti i Nuovi Arrivi" ctaHref="/nuovi-arrivi" />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ─── BANNER ─────────────────────────────────────────────────────────────── */}
      <section className="mx-3 sm:mx-4 md:mx-6 mb-12 sm:mb-16 md:mb-20 bg-foreground text-background rounded overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 py-10 sm:py-14 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 block mb-3">Esclusiva Autenticità</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-4">
              Ogni Prodotto<br /><span className="text-accent">Garantito.</span>
            </h2>
            <p className="text-background/60 mb-8 max-w-sm">
              Il nostro team di esperti verifica l&apos;autenticità di ogni prodotto prima della spedizione. Nessun rischio, solo lusso reale.
            </p>
            <Link to="/info/autenticita" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded text-sm font-bold hover:bg-white/10 transition-colors">
              Scopri come funziona <ArrowRight size={14} />
            </Link>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {featured.slice(0, 2).map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group block">
                <div className="aspect-square overflow-hidden rounded bg-white/5">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEST SELLERS ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <SectionHeader title="Più Venduti" subtitle="I pezzi che non passano mai di moda" cta="Vedi tutti" ctaHref="/shop/piu-venduti" />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ─── SALE ────────────────────────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="bg-muted py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeader title="In Saldo" subtitle="Offerte limitate — approfitta ora" cta="Tutti i Saldi" ctaHref="/saldi" />
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUST ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <item.icon size={22} />
              </div>
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Accesso Anticipato ai Drop</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Iscriviti alla newsletter e ricevi notifiche sui nuovi drop prima di tutti, offerte esclusive e contenuti premium.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
          >
            <input
              type="email"
              placeholder="La tua email"
              className="flex-1 px-4 py-3 rounded border border-border bg-background text-sm outline-none focus:border-foreground transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-foreground text-background rounded font-bold text-sm hover:bg-foreground/90 transition-colors shrink-0"
            >
              Iscriviti
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">Nessuno spam. Cancellazione in qualsiasi momento.</p>
        </div>
      </section>
    </div>
  );
}
