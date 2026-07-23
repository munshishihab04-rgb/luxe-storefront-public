import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem, Product } from "../types/product.ts";
import { toast } from "sonner";
import { parseStoredCart } from "./cart-storage.ts";

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size?: string, color?: string, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_STORAGE_KEY = "luxe:cart";

function getItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => typeof window === "undefined" ? [] : parseStoredCart(localStorage.getItem(CART_STORAGE_KEY)));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((product: Product, size?: string, color?: string, variantId?: string) => {
    setItems((prev) => {
      const key = getItemKey(product.id, variantId);
      const existing = prev.find((i) => getItemKey(i.productId, i.variantId) === key);
      if (existing) {
        return prev.map((i) =>
          getItemKey(i.productId, i.variantId) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { productId: product.id, variantId, quantity: 1, product, selectedSize: size, selectedColor: color }];
    });
    toast.success(`${product.title} aggiunto al carrello`);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = getItemKey(productId, variantId);
    setItems((prev) => prev.filter((i) => getItemKey(i.productId, i.variantId) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const key = getItemKey(productId, variantId);
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getItemKey(i.productId, i.variantId) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => getItemKey(i.productId, i.variantId) === key ? { ...i, quantity } : i)
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const price = i.product.salePrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
