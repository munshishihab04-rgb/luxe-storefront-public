import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "../types/product.ts";
import { toast } from "sonner";

type WishlistContextType = {
  items: Product[];
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        toast.info(`${product.title} rimosso dalla wishlist`);
        return prev.filter((p) => p.id !== product.id);
      }
      toast.success(`${product.title} aggiunto alla wishlist`);
      return [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback((productId: string) => items.some((p) => p.id === productId), [items]);
  const count = items.length;

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
