import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import AppLayout from "./components/layout/AppLayout.tsx";
import { CartProvider } from "./contexts/CartContext.tsx";
import { WishlistProvider } from "./contexts/WishlistContext.tsx";
import Index from "./pages/Index.tsx";
import ShopPage from "./pages/shop/ShopPage.tsx";
import ProductPage from "./pages/product/ProductPage.tsx";
import CartPage from "./pages/cart/CartPage.tsx";
import CheckoutPage from "./pages/checkout/CheckoutPage.tsx";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage.tsx";
import WishlistPage from "./pages/wishlist/WishlistPage.tsx";
import AccountPage from "./pages/account/AccountPage.tsx";
import SalePage from "./pages/shop/SalePage.tsx";
import NewArrivalsPage from "./pages/shop/NewArrivalsPage.tsx";
import { ShippingInfoPage, ReturnsPage, PrivacyPage, TermsPage, AuthenticityPage } from "./pages/info/ShippingInfoPage.tsx";
import ContactPage from "./pages/info/ContactPage.tsx";
import FaqPage from "./pages/info/FaqPage.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:category" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/ordine-confermato" element={<OrderConfirmationPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/saldi" element={<SalePage />} />
                <Route path="/nuovi-arrivi" element={<NewArrivalsPage />} />
                <Route path="/info/spedizioni" element={<ShippingInfoPage />} />
                <Route path="/info/resi" element={<ReturnsPage />} />
                <Route path="/info/privacy" element={<PrivacyPage />} />
                <Route path="/info/termini" element={<TermsPage />} />
                <Route path="/info/autenticita" element={<AuthenticityPage />} />
                <Route path="/info/cookie" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </DefaultProviders>
  );
}
