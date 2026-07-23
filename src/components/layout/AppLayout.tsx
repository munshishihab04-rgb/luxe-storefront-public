import { Outlet } from "react-router-dom";
import PromoBar from "./PromoBar.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import CartDrawer from "../cart/CartDrawer.tsx";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full min-w-0">
      <PromoBar />
      <Header />
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
