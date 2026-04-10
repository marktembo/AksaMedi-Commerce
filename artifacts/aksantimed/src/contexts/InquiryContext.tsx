import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

interface InquiryContextValue {
  inquiryProducts: Product[];
  addToInquiry: (product: Product) => void;
  removeFromInquiry: (id: number) => void;
  clearInquiry: () => void;
  isInInquiry: (id: number) => boolean;
  inquiryOpen: boolean;
  openInquiry: () => void;
  closeInquiry: () => void;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [inquiryProducts, setInquiryProducts] = useState<Product[]>([]);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const addToInquiry = useCallback((product: Product) => {
    setInquiryProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const removeFromInquiry = useCallback((id: number) => {
    setInquiryProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearInquiry = useCallback(() => setInquiryProducts([]), []);
  const isInInquiry = useCallback((id: number) => inquiryProducts.some((p) => p.id === id), [inquiryProducts]);
  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  return (
    <InquiryContext.Provider value={{
      inquiryProducts, addToInquiry, removeFromInquiry, clearInquiry,
      isInInquiry, inquiryOpen, openInquiry, closeInquiry,
    }}>
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside InquiryProvider");
  return ctx;
}
