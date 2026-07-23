import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const messages = [
  "Spedizione tracciata su tutti gli ordini — Consegna in 24/48h",
  "Autenticità garantita su ogni prodotto — Certificato di garanzia incluso",
  "Resi gratuiti entro 14 giorni dall'acquisto",
];

export default function PromoBar() {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-foreground text-background text-xs font-medium h-9 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="tracking-wide"
        >
          {messages[current]}
        </motion.span>
      </AnimatePresence>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Chiudi"
      >
        <X size={14} />
      </button>
    </div>
  );
}
