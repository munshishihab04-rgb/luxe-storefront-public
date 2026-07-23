import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils.ts";

const faqs = [
  {
    category: "Ordini",
    items: [
      { q: "Come posso effettuare un ordine?", a: "Seleziona il prodotto, scegli la taglia/colore, aggiungilo al carrello e procedi al checkout. Accettiamo carta di credito, PayPal e Klarna." },
      { q: "Posso modificare o annullare un ordine?", a: "Puoi richiedere la modifica o cancellazione entro 2 ore dall'ordine contattandoci via email o WhatsApp. Dopo le 2 ore, l'ordine potrebbe già essere in preparazione." },
      { q: "Come monitoro il mio ordine?", a: "Riceverai una email con il numero di tracking non appena il tuo ordine viene spedito. Puoi tracciare la spedizione in tempo reale sul sito del corriere." },
    ],
  },
  {
    category: "Autenticità",
    items: [
      { q: "Come garantite l'autenticità dei prodotti?", a: "Ogni prodotto viene verificato dal nostro team di esperti prima della spedizione. Controlliamo materiali, costruzione, loghi, numeri seriali e packaging. In caso di dubbio, il prodotto non viene messo in vendita." },
      { q: "Cosa succede se ricevo un prodotto non autentico?", a: "Nel caso estremamente improbabile in cui un prodotto non fosse autentico, ti rimborsiamo l'intero importo pagato più il 10% di compensazione." },
    ],
  },
  {
    category: "Spedizioni",
    items: [
      { q: "Quanto costa la spedizione?", a: "La spedizione standard è gratuita su tutti gli ordini. La spedizione express in Italia (24-48h) costa €12,00." },
      { q: "Quanto tempo ci vuole per ricevere il mio ordine?", a: "In Italia: 1-3 giorni lavorativi con spedizione standard, 24-48h con express. In Europa: 3-7 giorni lavorativi." },
      { q: "Spedite all'estero?", a: "Sì, spediamo in tutta Europa. Per destinazioni fuori UE, contattaci per un preventivo specifico." },
    ],
  },
  {
    category: "Resi",
    items: [
      { q: "Posso restituire un prodotto?", a: "Sì, accettiamo resi entro 14 giorni dalla consegna, purché il prodotto sia nelle condizioni originali con tutti i tag e la scatola intatti." },
      { q: "Come funziona il rimborso?", a: "Il rimborso viene effettuato con lo stesso metodo di pagamento entro 5-7 giorni lavorativi dalla ricezione del reso." },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-2">Domande Frequenti</h1>
      <p className="text-muted-foreground mb-10">Trova risposta alle domande più comuni.</p>

      <div className="space-y-10">
        {faqs.map((category) => (
          <div key={category.category}>
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">{category.category}</h2>
            <div className="space-y-1">
              {category.items.map((item) => (
                <div key={item.q} className="border border-border rounded overflow-hidden">
                  <button
                    onClick={() => setOpen(open === item.q ? null : item.q)}
                    className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    {item.q}
                    <ChevronDown size={16} className={cn("shrink-0 transition-transform ml-4", open === item.q && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {open === item.q && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
