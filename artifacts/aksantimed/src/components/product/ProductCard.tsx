import { Link } from "wouter";
import { HeartPulse, Activity, MessageSquare } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-muted/20 p-6 flex items-center justify-center overflow-hidden">
        {/* Left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {!product.inStock && (
            <Badge variant="destructive" className="font-semibold shadow-sm">Out of Stock</Badge>
          )}
          {product.featured && product.inStock && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary shadow-sm">Featured</Badge>
          )}
        </div>

        {/* Rx badge */}
        {product.prescriptionRequired && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary font-medium flex items-center gap-1 shadow-sm">
              <Activity className="w-3 h-3" /> Rx
            </Badge>
          </div>
        )}

        {/* Product image or placeholder */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <HeartPulse className="h-12 w-12 opacity-20" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-50">Image Coming Soon</span>
          </div>
        )}

        {/* Hover overlay — "View Details" */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-2 w-full h-10 rounded-md bg-white text-primary font-semibold text-sm shadow-md">
            View Details
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
          {product.categoryName || "Medical Supply"}
        </div>
        <h3 className="font-bold text-foreground text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Request a Quote CTA */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 justify-center w-full h-9 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-semibold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors duration-200">
            <MessageSquare className="w-4 h-4" />
            Request a Quote
          </div>
        </div>
      </div>
    </Link>
  );
}
