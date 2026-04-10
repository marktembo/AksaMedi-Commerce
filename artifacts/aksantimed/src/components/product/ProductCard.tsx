import { Link, useLocation } from "wouter";
import { HeartPulse, Activity, MessageSquare, Plus, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedProducts } from "@/contexts/SavedProductsContext";
import { useInquiry } from "@/contexts/InquiryContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useSavedProducts();
  const { addToInquiry, isInInquiry, openInquiry } = useInquiry();
  const [, navigate] = useLocation();

  const inInquiry = isInInquiry(product.id);

  const saved = isSaved(product.id);

  const quoteSubject = encodeURIComponent(`Quote Request: ${product.name} (SKU: ${product.sku || product.id})`);
  const quoteBody = encodeURIComponent(
    `Hello Aksantimed,\n\nI would like to request a quote for:\n\nProduct: ${product.name}\nSKU: ${product.sku || "N/A"}\nManufacturer: ${product.manufacturer || "N/A"}\n\nQuantity required:\nDelivery location:\n\nThank you.`
  );

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleSave(product);
  };

  return (
    <div className={`group flex flex-col bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${inInquiry ? "border-primary/40 ring-2 ring-primary/10" : "border-border hover:border-primary/20"}`}>

      {/* Image area — clicking navigates to detail */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-muted/20 p-5 overflow-hidden">

        {/* Left badges: out-of-stock / featured */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!product.inStock && (
            <Badge variant="destructive" className="font-semibold shadow-sm text-xs">{t("productCard.outOfStock")}</Badge>
          )}
          {product.featured && product.inStock && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary shadow-sm text-xs">{t("productCard.featured")}</Badge>
          )}
        </div>

        {/* Right-side stack: Rx badge + Save button */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          {product.prescriptionRequired && (
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary font-medium flex items-center gap-1 shadow-sm text-xs">
              <Activity className="w-3 h-3" /> Rx
            </Badge>
          )}
          <button
            onClick={handleSave}
            title={saved ? t("productCard.unsave") : t("productCard.saveForLater")}
            className={`flex items-center justify-center h-7 w-7 rounded-full shadow-md border transition-all duration-200 hover:scale-110 active:scale-95 ${
              saved
                ? "bg-primary border-primary text-white"
                : "bg-white/90 backdrop-blur-sm border-white/60 text-gray-400 hover:text-primary hover:border-primary/40"
            }`}
          >
            {saved
              ? <BookmarkCheck className="w-3.5 h-3.5" />
              : <Bookmark className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <HeartPulse className="h-10 w-10 opacity-15" />
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">{t("productCard.imageSoon")}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-1.5 w-full h-8 rounded-md bg-white text-primary font-semibold text-xs shadow-md">
            {t("productCard.viewDetails")}
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            {product.categoryName || t("productCard.medicalSupply")}
          </span>
          {product.manufacturer && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{product.manufacturer}</span>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-foreground text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer hover:underline">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-grow">
          {product.description}
        </p>

        {/* Availability indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className={`h-2 w-2 rounded-full shrink-0 ${product.inStock ? "bg-green-500" : "bg-red-400"}`} />
          <span className="text-xs text-muted-foreground">
            {product.inStock ? t("productCard.inStock") : t("productCard.outOfStock")}
          </span>
          {product.sku && <span className="text-xs text-muted-foreground ml-auto">SKU: {product.sku}</span>}
        </div>

        {/* Action buttons */}
        <div className="space-y-2 mt-auto">
          {/* Primary: Request a Quote */}
          <a
            href={`mailto:info@aksantimed.com?subject=${quoteSubject}&body=${quoteBody}`}
            className="flex items-center justify-center gap-2 w-full h-9 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {t("productCard.requestQuote")}
          </a>

          {/* Add to Inquiry + Save row */}
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); addToInquiry(product); if (!inInquiry) openInquiry(); }}
              className={`flex items-center justify-center gap-1.5 flex-1 h-8 rounded-full text-xs font-semibold border transition-all ${
                inInquiry
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {inInquiry ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {inInquiry ? t("productCard.addedToInquiry") : t("productCard.addToInquiry")}
            </button>

            {/* Save for later */}
            <button
              onClick={handleSave}
              title={saved ? t("productCard.unsave") : t("productCard.saveForLater")}
              className={`flex items-center justify-center h-8 w-8 rounded-full border shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 ${
                saved
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
