import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
// Social icons use ExternalLink placeholder (lucide has no brand icons)

const shopLinks = [
  { label: "Sneakers", href: "/shop/sneakers" },
  { label: "Uomo", href: "/shop/uomo" },
  { label: "Donna", href: "/shop/donna" },
  { label: "Borse", href: "/shop/borse" },
  { label: "Accessori", href: "/shop/accessori" },
  { label: "Saldi", href: "/saldi" },
  { label: "Nuovi Arrivi", href: "/nuovi-arrivi" },
  { label: "Più Venduti", href: "/shop/piu-venduti" },
];

const helpLinks = [
  { label: "Come Ordinare", href: "/faq" },
  { label: "Spedizioni & Consegne", href: "/info/spedizioni" },
  { label: "Resi & Cambi", href: "/info/resi" },
  { label: "Autenticità", href: "/info/autenticita" },
  { label: "Contattaci", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/info/privacy" },
  { label: "Termini & Condizioni", href: "/info/termini" },
  { label: "Cookie Policy", href: "/info/cookie" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-black text-3xl tracking-tight text-background block mb-4">LUXE.</Link>
            <p className="text-sm text-background/60 leading-relaxed mb-6 max-w-xs">
              Il marketplace italiano per sneakers, abbigliamento e accessori di lusso e streetwear. Autenticità garantita su ogni prodotto.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors">
                <ExternalLink size={14} />
              </a>
              <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors">
                <ExternalLink size={14} />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">Shop</p>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aiuto */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">Assistenza</p>
            <ul className="space-y-3">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legale */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-background/40 mb-5">Legale</p>
            <ul className="space-y-3">
              {policyLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-background/40 mb-4">Pagamenti Accettati</p>
              <div className="flex gap-2 flex-wrap">
                {["Visa", "MC", "Amex", "PayPal", "Klarna"].map((pm) => (
                  <span key={pm} className="px-2 py-1 border border-background/20 rounded text-[10px] font-bold text-background/60">
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {year} LUXE. Tutti i diritti riservati. P.IVA: IT01234567890
          </p>
          <p className="text-xs text-background/40">
            Tutti i prodotti sono 100% autentici e originali.
          </p>
        </div>
      </div>
    </footer>
  );
}
