import React from "react";
import { Link } from "wouter";
import { ShoppingCart, HeartPulse, Activity } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddToCart } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  
  const addToCartMutation = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    
    addToCartMutation.mutate({
      data: {
        sessionId,
        productId: product.id,
        quantity: 1
      }
    });
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square bg-muted/20 p-6 flex items-center justify-center overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {!product.inStock && (
            <Badge variant="destructive" className="font-semibold shadow-sm">Out of Stock</Badge>
          )}
          {product.featured && product.inStock && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary shadow-sm">Featured</Badge>
          )}
          {discountPercentage > 0 && product.inStock && (
            <Badge className="bg-destructive text-white hover:bg-destructive shadow-sm">-{discountPercentage}%</Badge>
          )}
        </div>
        
        {product.prescriptionRequired && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-primary/20 text-primary font-medium flex items-center gap-1 shadow-sm">
              <Activity className="w-3 h-3" /> Rx
            </Badge>
          </div>
        )}

        {/* Image */}
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
        
        {/* Quick Add Overlay */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
            <Button 
              className="w-full shadow-md" 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
          {product.categoryName || 'Medical Supply'}
        </div>
        <h3 className="font-bold text-foreground text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-bold text-lg text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
