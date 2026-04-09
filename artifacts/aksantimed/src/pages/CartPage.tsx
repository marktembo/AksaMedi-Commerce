import { Link } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveCartItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getSessionId } from "@/lib/session";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart, isLoading } = useGetCart(
    { sessionId }, 
    { query: { enabled: !!sessionId, queryKey: ["/api/cart", { sessionId }] } }
  );

  const updateItemMutation = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    }
  });

  const removeItemMutation = useRemoveCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Item removed",
          description: "The item has been removed from your cart."
        });
      }
    }
  });

  const handleUpdateQuantity = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    
    updateItemMutation.mutate({
      itemId,
      data: {
        sessionId,
        quantity: newQuantity
      }
    });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({ itemId });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 flex-1">
        <h1 className="text-3xl font-bold font-serif mb-8 text-foreground">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="bg-muted/10 flex-1 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-8 text-foreground">Shopping Cart</h1>
        
        {isEmpty ? (
          <div className="bg-white p-12 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Looks like you haven't added any medical supplies to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 font-semibold">
                Browse Medical Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Subtotal</div>
                </div>

                <ul className="divide-y divide-border">
                  {cart.items.map((item) => (
                    <li key={item.id} className="p-4 sm:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg bg-muted/30 border border-border p-2 flex items-center justify-center">
                          {item.productImageUrl ? (
                            <img src={item.productImageUrl} alt={item.productName} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.productId}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 text-lg mb-1">
                            {item.productName}
                          </Link>
                          <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-3 flex justify-between md:justify-center items-center w-full md:w-auto">
                        <span className="md:hidden text-sm font-medium text-muted-foreground">Quantity:</span>
                        <div className="flex items-center bg-muted/30 border border-input rounded-md h-10">
                          <button 
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-md transition-colors"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={updateItemMutation.isPending || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                          <button 
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-md transition-colors"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={updateItemMutation.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-span-3 flex justify-between md:justify-end items-center w-full md:w-auto">
                        <span className="md:hidden text-sm font-medium text-muted-foreground">Subtotal:</span>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg text-foreground">${item.subtotal.toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm sticky top-28">
                <h2 className="text-xl font-bold font-serif mb-6 text-foreground">Order Summary</h2>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items ({cart.itemCount})</span>
                    <span className="font-medium text-foreground">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-end mb-8">
                  <span className="font-semibold text-foreground text-lg">Subtotal</span>
                  <span className="font-bold text-2xl text-primary">${cart.total.toFixed(2)}</span>
                </div>
                
                <Link href="/checkout">
                  <Button size="lg" className="w-full h-12 text-base font-bold shadow-md">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <div className="mt-6 bg-muted/30 p-4 rounded-lg flex gap-3 text-sm text-muted-foreground border border-border">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p>Secure checkout process. Professional medical accounts may be verified before order dispatch.</p>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
