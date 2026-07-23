import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  subject: z.string().min(3, "Oggetto richiesto"),
  message: z.string().min(10, "Messaggio troppo breve"),
  orderNumber: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (_data: ContactForm) => {
    setSent(true);
    toast.success("Messaggio inviato! Ti risponderemo entro 24 ore.");
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-7 sm:py-12 min-w-0">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">Contattaci</h1>
        <p className="text-muted-foreground">Siamo qui per aiutarti. Rispondiamo entro 24 ore.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-7 sm:gap-10 min-w-0">
        {/* Info */}
        <div className="md:col-span-2 space-y-6">
          {[
            { icon: Mail, title: "Email", text: "info@luxe.it", sub: "Rispondiamo entro 24 ore" },
            { icon: MessageSquare, title: "WhatsApp", text: "+39 340 000 0000", sub: "Lun-Dom 9:00 - 21:00" },
            { icon: Clock, title: "Orari di Supporto", text: "Lun - Dom", sub: "9:00 - 21:00" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <CheckCircle size={48} className="text-green-500" />
              <p className="font-bold text-xl">Messaggio Inviato!</p>
              <p className="text-muted-foreground text-sm">Ti risponderemo via email entro 24 ore.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Nome *</label>
                  <input {...register("name")} placeholder="Mario Rossi" className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Email *</label>
                  <input {...register("email")} type="email" placeholder="mario@email.it" className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Numero Ordine (opzionale)</label>
                <input {...register("orderNumber")} placeholder="LX12345678" className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Oggetto *</label>
                <input {...register("subject")} placeholder="Come possiamo aiutarti?" className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground" />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground block mb-1.5">Messaggio *</label>
                <textarea {...register("message")} rows={5} placeholder="Scrivi il tuo messaggio..." className="w-full px-4 py-3 border border-border rounded text-sm outline-none bg-background focus:border-foreground resize-none" />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" className="w-full py-4 bg-foreground text-background rounded font-black text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors">
                Invia Messaggio
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
