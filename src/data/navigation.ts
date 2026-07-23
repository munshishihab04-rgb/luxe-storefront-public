import type { NavigationItem } from "../types/category.ts";

export const navigation: NavigationItem[] = [
  {
    label: "Sneakers",
    href: "/shop/sneakers",
    children: [
      {
        title: "Nike",
        items: [
          { label: "Air Jordan 1", href: "/shop/jordan-1" },
          { label: "Air Jordan 3", href: "/shop/jordan-3" },
          { label: "Air Jordan 4", href: "/shop/jordan-4" },
          { label: "Air Jordan 5", href: "/shop/jordan-5" },
          { label: "Air Force 1", href: "/shop/air-force" },
          { label: "Air Max", href: "/shop/air-max" },
          { label: "Nike Dunk", href: "/shop/nike-dunk" },
        ],
      },
      {
        title: "Adidas",
        items: [
          { label: "Samba OG", href: "/shop/samba-og" },
          { label: "Campus 00s", href: "/shop/campus" },
          { label: "Gazelle Indoor", href: "/shop/gazelle-indoor" },
          { label: "Yeezy 350", href: "/shop/yeezy-350" },
          { label: "Yeezy 700", href: "/shop/yeezy-700" },
          { label: "Yeezy Slide", href: "/shop/yeezy-slide" },
        ],
      },
      {
        title: "Luxury",
        items: [
          { label: "Balenciaga", href: "/shop/balenciaga" },
          { label: "Golden Goose", href: "/shop/golden-goose" },
          { label: "Alexander McQueen", href: "/shop/alexander-mcqueen" },
          { label: "Dior", href: "/shop/dior-shoes" },
          { label: "Louis Vuitton", href: "/shop/louis-vuitton-shoes" },
          { label: "Maison Margiela", href: "/shop/maison-margiela" },
          { label: "Lanvin", href: "/shop/lanvin" },
        ],
      },
      {
        title: "Altro",
        items: [
          { label: "Versace", href: "/shop/versace-shoes" },
          { label: "Hermès", href: "/shop/hermes-shoes" },
          { label: "Loro Piana", href: "/shop/loro-piana" },
          { label: "Burberry", href: "/shop/burberry" },
          { label: "Timberland", href: "/shop/timberland" },
          { label: "UGG", href: "/shop/ugg" },
        ],
      },
    ],
    featured: [
      { title: "Nuovi Arrivi", href: "/nuovi-arrivi", image: "https://placehold.co/300x200/1a1a1a/ffffff?text=New+Arrivals" },
      { title: "Più Venduti", href: "/shop/piu-venduti", image: "https://placehold.co/300x200/2a2a2a/ffffff?text=Best+Sellers" },
    ],
  },
  {
    label: "Uomo",
    href: "/shop/uomo",
    children: [
      {
        title: "Calzature",
        items: [
          { label: "Tutte le Calzature", href: "/shop/calzature-uomo" },
          { label: "Sneakers Uomo", href: "/shop/sneakers?gender=uomo" },
        ],
      },
      {
        title: "Abbigliamento",
        items: [
          { label: "T-Shirt", href: "/shop/t-shirt" },
          { label: "Felpe & Hoodie", href: "/shop/felpe" },
          { label: "Pantaloni & Jeans", href: "/shop/pantaloni-uomo" },
          { label: "Giacche", href: "/shop/giacche" },
          { label: "Completi", href: "/shop/completi-uomo" },
          { label: "Maglioni", href: "/shop/maglioni" },
        ],
      },
      {
        title: "Accessori",
        items: [
          { label: "Cinture", href: "/shop/cinture" },
          { label: "Cappelli", href: "/shop/cappelli" },
          { label: "Portafogli", href: "/shop/portafogli" },
          { label: "Calzini", href: "/shop/calzini" },
        ],
      },
    ],
  },
  {
    label: "Donna",
    href: "/shop/donna",
    children: [
      {
        title: "Calzature",
        items: [
          { label: "Tutte le Calzature", href: "/shop/calzature-donna" },
          { label: "Tacchi", href: "/shop/tacchi" },
          { label: "Stivali", href: "/shop/stivali" },
          { label: "Ciabatte & Slides", href: "/shop/ciabatte-slides" },
          { label: "Sneakers Donna", href: "/shop/sneakers?gender=donna" },
        ],
      },
      {
        title: "Abbigliamento",
        items: [
          { label: "Abbigliamento Donna", href: "/shop/abbigliamento-donna" },
          { label: "Pantaloni & Jeans", href: "/shop/pantaloni-donna" },
          { label: "Completi", href: "/shop/completi-donna" },
          { label: "Costumi da Bagno", href: "/shop/costumi" },
        ],
      },
      {
        title: "Accessori",
        items: [
          { label: "Borse", href: "/shop/borse" },
          { label: "Cappelli", href: "/shop/cappelli" },
          { label: "Borselli", href: "/shop/borselli" },
        ],
      },
    ],
  },
  {
    label: "Borse",
    href: "/shop/borse",
    children: [
      {
        title: "Brand",
        items: [
          { label: "Chanel", href: "/shop/chanel" },
          { label: "Dior", href: "/shop/dior" },
          { label: "Louis Vuitton", href: "/shop/louis-vuitton" },
          { label: "Hermès", href: "/shop/hermes" },
          { label: "Prada", href: "/shop/prada" },
          { label: "Goyard", href: "/shop/goyard" },
          { label: "Saint Laurent", href: "/shop/saint-laurent" },
        ],
      },
      {
        title: "Tipologia",
        items: [
          { label: "Valigie & Viaggi", href: "/shop/valigie" },
          { label: "Borselli", href: "/shop/borselli" },
          { label: "Portafogli", href: "/shop/portafogli" },
        ],
      },
    ],
  },
  {
    label: "Accessori",
    href: "/shop/accessori",
    children: [
      {
        title: "Tipologia",
        items: [
          { label: "Cinture", href: "/shop/cinture" },
          { label: "Cappelli", href: "/shop/cappelli" },
          { label: "Borselli", href: "/shop/borselli" },
          { label: "Portafogli", href: "/shop/portafogli" },
          { label: "Calzini", href: "/shop/calzini" },
        ],
      },
      {
        title: "Brand",
        items: [
          { label: "Chrome Hearts", href: "/shop/chrome-hearts" },
          { label: "Dior", href: "/shop/dior-accessories" },
          { label: "Prada", href: "/shop/prada-accessories" },
          { label: "Corteiz", href: "/shop/corteiz" },
        ],
      },
    ],
  },
  {
    label: "Saldi",
    href: "/saldi",
  },
];

export default navigation;
