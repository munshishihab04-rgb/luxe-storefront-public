import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Shield, Lock, Loader2, CreditCard } from "lucide-react";
import { useCart } from "../../contexts/CartContext.tsx";
import { formatPrice } from "../../lib/products.ts";
import { createXPayPayment } from "../../lib/xpay.ts";
import { cn } from "@/lib/utils.ts";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  address: z.string().min(5, "Indirizzo richiesto"),
  city: z.string().min(2, "Città richiesta"),
  zip: z.string().min(4, "CAP richiesto"),
  country: z.string().min(2, "Paese richiesto"),
  shippingMethod: z.string(),
  paymentMethod: z.string(),
  promoCode: z.string().optional(),
  terms: z.boolean().refine((v) => v, "Accetta i termini per continuare"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "shipping" | "payment">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "Italia",
      shippingMethod: "standard",
      paymentMethod: "xpay",
    },
  });

  const shippingMethod = watch("shippingMethod");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="font-bold text-lg">Il tuo carrello è vuoto</p>
        <Link to="/shop" className="text-accent underline underline-offset-4 text-sm">Vai allo shop</Link>
      </div>
    );
  }

  const shippingCost = shippingMethod === "express" ? 12 : 0;
  const finalTotal = totalPrice + shippingCost;

  const onSubmit = async (data: CheckoutFormData) => {
    setPaymentError(null);
    setIsSubmitting(true);

    try {
      if (data.paymentMethod === "transfer") {
        clearCart();
        navigate("/ordine-confermato?provider=bank-transfer");
        return;
      }

      const response = await createXPayPayment({
        amountCents: Math.round(finalTotal * 100),
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        shipping: {
          address: data.address,
          city: data.city,
          zip: data.zip,
          country: data.country,
          method: data.shippingMethod,
        },
        items,
      });

      if (response.codTrans) {
        localStorage.setItem("luxe:lastOrder", response.codTrans);
      }
      window.location.href = response.paymentUrl!;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Errore durante l'avvio del pagamento");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <Link to="/cart" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        ← Torna al carrello
      </Link>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-3 space-y-8">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            {(["info", "shipping", "payment"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-border" />}
                <button
                  type="button"
                  onClick={() => setStep(s)}
                  className={cn("px-3 py-1.5 rounded", step === s ? "bg-foreground text-background" : "text-muted-foreground")}
                >
                  {i + 1}. {s === "info" ? "Dati" : s === "shipping" ? "Spedizione" : "Pagamento"}
                </button>
              </div>
            ))}
          </div>

          {/* Customer Info */}
          <div className="space-y-5">
            <h2 className="text-xl font-black tracking-tight">Informazioni di Contatto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Nome *</label>
                <input {...register("firstName")} placeholder="Mario" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.firstName && "border-red-500")} />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Cognome *</label>
                <input {...register("lastName")} placeholder="Rossi" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.lastName && "border-red-500")} />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Email *</label>
              <input {...register("email")} type="email" placeholder="mario.rossi@email.it" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.email && "border-red-500")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Telefono *</label>
              <input {...register("phone")} type="tel" placeholder="+39 340 000 0000" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.phone && "border-red-500")} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-5">
            <h2 className="text-xl font-black tracking-tight">Indirizzo di Spedizione</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Indirizzo *</label>
              <input {...register("address")} placeholder="Via Roma, 1" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.address && "border-red-500")} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Città *</label>
                <input {...register("city")} placeholder="Milano" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.city && "border-red-500")} />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">CAP *</label>
                <input {...register("zip")} placeholder="20100" className={cn("w-full px-4 py-3 border rounded text-sm outline-none bg-background focus:border-foreground transition-colors", errors.zip && "border-red-500")} />
                {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Paese *</label>
              <select {...register("country")} className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground cursor-pointer">
                <option value="Italia">Italia</option>
                <option value="Germania">Germania</option>
                <option value="Francia">Francia</option>
                <option value="Spagna">Spagna</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="space-y-3">
            <h2 className="text-xl font-black tracking-tight">Metodo di Spedizione</h2>
            {[
              { id: "standard", label: "Spedizione Standard", desc: "3-5 giorni lavorativi", price: "Gratuita" },
              { id: "express", label: "Spedizione Express", desc: "1-2 giorni lavorativi", price: "€12,00" },
            ].map((method) => (
              <label key={method.id} className={cn("flex items-center justify-between p-4 border rounded cursor-pointer transition-colors", shippingMethod === method.id ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground")}>
                <div className="flex items-center gap-3">
                  <input type="radio" {...register("shippingMethod")} value={method.id} className="accent-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                </div>
                <span className={cn("text-sm font-bold", method.price === "Gratuita" && "text-green-600")}>{method.price}</span>
              </label>
            ))}
          </div>

          {/* Payment */}
          <div className="space-y-3">
            <h2 className="text-xl font-black tracking-tight">Metodo di Pagamento</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "xpay", label: "Carta — Nexi XPay" },
                { id: "paypal", label: "PayPal — prossimamente" },
                { id: "klarna", label: "Klarna — prossimamente" },
                { id: "transfer", label: "Bonifico Bancario" },
              ].map((pm) => (
                <label key={pm.id} className={cn("flex items-center gap-2.5 p-3 border rounded cursor-pointer transition-colors text-sm", watch("paymentMethod") === pm.id ? "border-foreground bg-muted font-semibold" : "border-border hover:border-muted-foreground")}>
                  <input type="radio" {...register("paymentMethod")} value={pm.id} disabled={pm.id === "paypal" || pm.id === "klarna"} className="accent-foreground" />
                  {pm.label}
                </label>
              ))}
            </div>
            {watch("paymentMethod") === "xpay" && (
              <div className="p-4 bg-muted rounded border border-border text-sm text-muted-foreground flex items-center gap-2">
                <Lock size={14} />
                Pagamento sicuro tramite Nexi XPay. Inserirai i dati carta solo sulla pagina protetta Nexi: nessun dato carta viene salvato su LUXE.
              </div>
            )}
            {watch("paymentMethod") === "transfer" && (
              <div className="p-4 bg-muted rounded border border-border text-sm text-muted-foreground flex items-center gap-2">
                <CreditCard size={14} />
                Riceverai le istruzioni per completare il bonifico. L'ordine verrà preparato dopo conferma pagamento.
              </div>
            )}
          </div>

          {paymentError && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-sm">
              {paymentError}
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" {...register("terms")} className="mt-1 accent-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accetto i <Link to="/info/termini" className="text-foreground underline underline-offset-2">Termini e Condizioni</Link> e la <Link to="/info/privacy" className="text-foreground underline underline-offset-2">Privacy Policy</Link>. Confermo di avere almeno 18 anni.
            </p>
          </label>
          {errors.terms && <p className="text-xs text-red-500 -mt-4">{errors.terms.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded font-black text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
            {isSubmitting ? "Avvio pagamento sicuro..." : `Paga con Nexi XPay — ${formatPrice(finalTotal)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="sticky top-24 border border-border rounded p-6 space-y-5">
            <h2 className="font-black text-lg">Riepilogo Ordine</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-3">
                    <div className="relative shrink-0">
                      <img src={item.product.images[0]} alt={item.product.title} className="w-16 h-16 object-cover rounded bg-muted" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted-foreground text-background text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                      <p className="text-sm font-semibold line-clamp-1">{item.product.title}</p>
                      {item.selectedSize && <p className="text-xs text-muted-foreground">Taglia: {item.selectedSize}</p>}
                    </div>
                    <p className="text-sm font-bold shrink-0">{formatPrice(price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotale ({totalItems})</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spedizione</span>
                <span className={cn("font-semibold", shippingCost === 0 && "text-green-600")}>
                  {shippingCost === 0 ? "Gratuita" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-black">Totale</span>
                <span className="font-black text-xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
