import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");
  const xpayOrder = searchParams.get("order");
  const orderNumber = xpayOrder || `LX${Date.now().toString().slice(-8)}`;
  const isXpay = provider === "xpay";

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle size={40} className="text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-black tracking-tight">Ordine Confermato!</h1>
        <p className="text-muted-foreground">
          {isXpay
            ? "Pagamento Nexi XPay ricevuto correttamente. Prepariamo ora il tuo ordine."
            : "Grazie per il tuo acquisto. Hai ricevuto una conferma via email con tutti i dettagli del tuo ordine."}
        </p>

        <div className="inline-flex items-center gap-2 bg-muted rounded-lg px-6 py-3 mt-4">
          <Package size={18} className="text-muted-foreground" />
          <span className="text-sm font-bold">Ordine #{orderNumber}</span>
        </div>

        <div className="bg-muted rounded-xl p-6 mt-6 text-left space-y-3">
          <h3 className="font-bold text-sm">Cosa succede ora?</h3>
          {[
            { step: "1", text: "Autenticiamo e prepariamo il tuo ordine (1-2 giorni)" },
            { step: "2", text: "Riceviamo la conferma di pagamento" },
            { step: "3", text: "Spediamo il tuo ordine con tracking" },
            { step: "4", text: "Ricevi la tua spedizione in 24/48h" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-black flex items-center justify-center shrink-0">{item.step}</span>
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to="/shop" className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded font-bold text-sm hover:bg-foreground/90 transition-colors">
            Continua lo Shopping <ArrowRight size={14} />
          </Link>
          <Link to="/account" className="flex-1 flex items-center justify-center py-3.5 rounded border border-border font-semibold text-sm hover:bg-muted transition-colors">
            Vai al Profilo
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
