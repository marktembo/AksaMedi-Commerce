import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

export interface QuoteCartItem {
  product: Product;
  quantity: number;
}

interface QuoteCartContextValue {
  items: QuoteCartItem[];
  totalItems: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getQuantity: (productId: number) => number;
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

const STORAGE_KEY = "aksantimed_quote_cart";

function loadFromStorage(): QuoteCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuoteCartItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: QuoteCartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const isInCart = useCallback((productId: number) => items.some((i) => i.product.id === productId), [items]);
  const getQuantity = useCallback((productId: number) => items.find((i) => i.product.id === productId)?.quantity ?? 0, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <QuoteCartContext.Provider value={{
      items, totalItems, addItem, removeItem, updateQuantity, clearCart, isInCart, getQuantity,
    }}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used inside QuoteCartProvider");
  return ctx;
}
