import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiGetSavedProducts, apiSaveProduct, apiUnsaveProduct, type SavedProduct } from "@/lib/auth-api";
import type { Product } from "@workspace/api-client-react";

interface SavedProductsContextValue {
  savedRecords: SavedProduct[];
  isSaved: (productId: number) => boolean;
  toggleSave: (product: Product) => Promise<void>;
  removeSaved: (id: number) => Promise<void>;
  isLoading: boolean;
}

const SavedProductsContext = createContext<SavedProductsContextValue | null>(null);

export function SavedProductsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [savedRecords, setSavedRecords] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      setIsLoading(true);
      apiGetSavedProducts(token)
        .then(setSavedRecords)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setSavedRecords([]);
    }
  }, [isAuthenticated, token]);

  const isSaved = useCallback(
    (productId: number) => savedRecords.some((r) => r.productId === productId),
    [savedRecords]
  );

  const toggleSave = useCallback(
    async (product: Product) => {
      if (!token) return;
      const existing = savedRecords.find((r) => r.productId === product.id);

      if (existing) {
        setSavedRecords((prev) => prev.filter((r) => r.id !== existing.id));
        await apiUnsaveProduct(token, existing.id);
      } else {
        const tempId = -Date.now();
        const optimistic: SavedProduct = {
          id: tempId,
          userId: 0,
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl ?? null,
          productCategory: product.categoryName ?? null,
          createdAt: new Date().toISOString(),
        };
        setSavedRecords((prev) => [...prev, optimistic]);
        try {
          const confirmed = await apiSaveProduct(token, {
            productId: product.id,
            productName: product.name,
            productImageUrl: product.imageUrl ?? undefined,
            productCategory: product.categoryName ?? undefined,
          });
          setSavedRecords((prev) => prev.map((r) => (r.id === tempId ? confirmed : r)));
        } catch {
          setSavedRecords((prev) => prev.filter((r) => r.id !== tempId));
        }
      }
    },
    [token, savedRecords]
  );

  const removeSaved = useCallback(
    async (id: number) => {
      if (!token) return;
      setSavedRecords((prev) => prev.filter((r) => r.id !== id));
      await apiUnsaveProduct(token, id);
    },
    [token]
  );

  return (
    <SavedProductsContext.Provider value={{ savedRecords, isSaved, toggleSave, removeSaved, isLoading }}>
      {children}
    </SavedProductsContext.Provider>
  );
}

export function useSavedProducts() {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) throw new Error("useSavedProducts must be used within SavedProductsProvider");
  return ctx;
}
