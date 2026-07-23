import { Link } from "react-router-dom";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6 sm:mb-10">Il Mio Account</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="border border-border rounded-xl p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <User size={32} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold">Ospite</p>
              <p className="text-sm text-muted-foreground">Non hai effettuato l&apos;accesso</p>
            </div>
            <Link to="/" className="w-full flex items-center justify-center py-3 bg-foreground text-background rounded font-bold text-sm hover:bg-foreground/90 transition-colors">
              Accedi / Registrati
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="md:col-span-2 grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
          {[
            { icon: Package, title: "I Miei Ordini", desc: "Traccia e gestisci i tuoi ordini", href: "/" },
            { icon: Heart, title: "Wishlist", desc: "I prodotti che hai salvato", href: "/wishlist" },
            { icon: Settings, title: "Impostazioni", desc: "Gestisci il tuo profilo", href: "/" },
            { icon: LogOut, title: "Esci", desc: "Disconnettiti dall'account", href: "/" },
          ].map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="border border-border rounded-xl p-5 hover:border-foreground hover:bg-muted transition-all group"
            >
              <item.icon size={22} className="mb-3 group-hover:text-accent transition-colors" />
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
