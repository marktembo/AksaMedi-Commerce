import { Link } from "wouter";
import { HeartPulse, Activity, MessageSquare, Plus, Check } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const WHATSAPP_NUMBER = "+243000000000"; // ← Replace with your actual WhatsApp number

interface ProductCardProps {
  product: Product;
  onAddToInquiry?: (product: Product) => void;
  inInquiry?: boolean;
}

export function ProductCard({ product, onAddToInquiry, inInquiry = false }: ProductCardProps) {
  const quoteSubject = encodeURIComponent(`Quote Request: ${product.name} (SKU: ${product.sku || product.id})`);
  const quoteBody = encodeURIComponent(
    `Hello Aksantimed,\n\nI would like to request a quote for:\n\nProduct: ${product.name}\nSKU: ${product.sku || "N/A"}\nManufacturer: ${product.manufacturer || "N/A"}\n\nQuantity required:\nDelivery location:\n\nThank you.`
  );
  const waMsg = encodeURIComponent(
    `Hi Aksantimed, I am interested in *${product.name}*${product.sku ? ` (SKU: ${product.sku})` : ""}. Please share more information.`
  );

  return (
    <div className={`group flex flex-col bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${inInquiry ? "border-primary/40 ring-2 ring-primary/10" : "border-border hover:border-primary/20"}`}>

      {/* Image area — clicking navigates to detail */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square bg-muted/20 p-5 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!product.inStock && (
            <Badge variant="destructive" className="font-semibold shadow-sm text-xs">Out of Stock</Badge>
          )}
          {product.featured && product.inStock && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary shadow-sm text-xs">Featured</Badge>
          )}
        </div>

        {product.prescriptionRequired && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary font-medium flex items-center gap-1 shadow-sm text-xs">
              <Activity className="w-3 h-3" /> Rx
            </Badge>
          </div>
        )}

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <HeartPulse className="h-10 w-10 opacity-15" />
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">Image Coming Soon</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-1.5 w-full h-8 rounded-md bg-white text-primary font-semibold text-xs shadow-md">
            View Details →
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            {product.categoryName || "Medical Supply"}
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
          <span className="text-xs text-muted-foreground">{product.inStock ? "In Stock" : "Out of Stock"}</span>
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
            Request a Quote
          </a>

          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1ebe5d] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>

            {/* Add to Inquiry */}
            <button
              onClick={(e) => { e.stopPropagation(); onAddToInquiry?.(product); }}
              className={`flex items-center justify-center gap-1.5 h-8 rounded-full text-xs font-semibold border transition-all ${
                inInquiry
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {inInquiry ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {inInquiry ? "Added" : "Inquire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
