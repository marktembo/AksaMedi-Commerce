import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuoteCart } from "@/contexts/QuoteCartContext";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

export default function CartPage() {
  const { items, totalItems, removeItem, updateQuantity, clearCart } = useQuoteCart();

  const isEmpty = items.length === 0;

  return (
    <div className="bg-muted/10 flex-1 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">Quote Cart</h1>
          {!isEmpty && (
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="bg-white p-12 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Your quote cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Browse our catalog and add products you'd like to request a quote for.
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
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-4 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Remove</div>
                </div>

                <ul className="divide-y divide-border">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="p-4 sm:p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="h-16 w-16 shrink-0 rounded-lg bg-muted/30 border border-border p-2 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          ) : (
                            <HeartPulse className="h-6 w-6 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.id}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm">
                            {product.name}
                          </Link>
                          {product.manufacturer && (
                            <p className="text-xs text-muted-foreground mt-0.5">{product.manufacturer}</p>
                          )}
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-4 flex justify-between md:justify-center items-center w-full md:w-auto">
                        <span className="md:hidden text-xs font-medium text-muted-foreground">Quantity:</span>
                        <div className="flex items-center bg-muted/30 border border-input rounded-md h-9">
                          <button
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-md transition-colors"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                          <button
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-md transition-colors"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-end w-full md:w-auto">
                        <button
                          onClick={() => removeItem(product.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link href="/products" className="text-sm text-primary hover:underline font-medium">
                  ← Continue browsing
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm sticky top-28">
                <h2 className="text-xl font-bold font-serif mb-6 text-foreground">Quote Summary</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total products</span>
                    <span className="font-semibold text-foreground">{items.length} line{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total units</span>
                    <span className="font-semibold text-foreground">{totalItems} unit{totalItems !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="bg-muted/30 rounded-xl p-4 text-xs text-muted-foreground mb-6 leading-relaxed">
                  Aksantimed operates on a <strong className="text-foreground">quote-based model</strong>. After submitting your request, our team will send you a proforma invoice within 24–48 hours.
                </div>

                <Link href="/checkout">
                  <Button size="lg" className="w-full h-12 text-base font-bold shadow-md">
                    Request Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>All inquiries are reviewed by our medical supply team before response.</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
