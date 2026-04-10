import { useParams, Link } from "wouter";
import { useGetProduct, useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronRight, HeartPulse, Activity, ShieldCheck, Info, Factory, FileText, CheckCircle2, MessageSquare, Phone, Mail, ShoppingCart, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuoteCart } from "@/contexts/QuoteCartContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id, 10);
  const { addItem, isInCart } = useQuoteCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });

  const { data: relatedData } = useListProducts(
    { categoryId: product?.categoryId || undefined, limit: 4 },
    { query: { enabled: !!product?.categoryId } }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <Skeleton className="w-full lg:w-1/2 aspect-square rounded-2xl" />
          <div className="w-full lg:w-1/2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 text-center">
        <HeartPulse className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-3xl font-bold mb-4 font-serif text-foreground">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products">
          <Button size="lg">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const handleAddToCart = () => {
    addItem(product);
    toast({ title: inCart ? "Quantity updated" : "Added to quote cart", description: product.name });
  };

  return (
    <div className="bg-background flex-1">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          {product.categoryName && (
            <>
              <Link href={`/products?category=${product.categoryId}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Product Image */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-2xl border border-border aspect-square relative flex items-center justify-center p-8 shadow-sm">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {!product.inStock && (
                  <Badge variant="destructive" className="text-base px-3 py-1 font-semibold shadow-sm">Out of Stock</Badge>
                )}
                {product.featured && product.inStock && (
                  <Badge className="bg-secondary text-secondary-foreground text-sm shadow-sm hover:bg-secondary">Featured</Badge>
                )}
              </div>
              
              {product.prescriptionRequired && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-md border-primary/20 text-primary text-sm px-3 py-1 font-medium flex items-center gap-2 shadow-sm">
                    <Activity className="w-4 h-4" /> Prescription Required
                  </Badge>
                </div>
              )}

              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain mix-blend-multiply" 
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center opacity-30">
                  <HeartPulse className="h-24 w-24 mb-4" />
                  <span className="font-medium text-lg uppercase tracking-widest">Image Coming Soon</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{product.categoryName || 'Medical Supply'}</p>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground leading-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
                  <MessageSquare className="h-4 w-4" />
                  Price on Request
                </span>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 mb-8">
              {product.sku && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">SKU</p>
                    <p className="font-semibold text-foreground">{product.sku}</p>
                  </div>
                </div>
              )}
              {product.manufacturer && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Factory className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Manufacturer</p>
                    <p className="font-semibold text-foreground">{product.manufacturer}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <CheckCircle2 className={`h-5 w-5 ${product.inStock ? "text-green-600" : "text-destructive"}`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Availability</p>
                  <p className={`font-semibold ${product.inStock ? "text-green-600" : "text-destructive"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </div>
            </div>

            {/* Add to Quote Cart Area */}
            <div className="bg-muted/30 p-6 rounded-xl border border-border mt-auto space-y-3">
              <p className="text-sm text-muted-foreground">
                Add to your quote cart, then submit a single request for all selected products.
              </p>
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 w-full h-12 rounded-full font-bold text-base shadow-md transition-all ${
                  inCart
                    ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {inCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {inCart ? "Added to Quote Cart" : "Add to Quote Cart"}
              </button>
              {inCart && (
                <Link href="/cart" className="flex items-center justify-center gap-1.5 w-full h-10 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                  View Quote Cart & Checkout →
                </Link>
              )}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+243000000000"
                  className="flex items-center justify-center gap-2 h-10 rounded-full border border-border bg-white text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
                <a
                  href="mailto:info@aksantimed.com"
                  className="flex items-center justify-center gap-2 h-10 rounded-full border border-border bg-white text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email Us
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-white p-3 rounded-md border border-border">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p>Authentic product sourced directly from verified manufacturers. Quality guaranteed by Aksantimed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white border-t border-border py-16">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="details" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="details" className="rounded-lg text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Product Details
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-lg text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Shipping & Delivery
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-6 mt-4 bg-white rounded-xl border border-border prose max-w-none prose-p:text-muted-foreground">
              <h3>Detailed Information</h3>
              <p>
                {product.description}
              </p>
              {product.prescriptionRequired && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex gap-3 my-6">
                  <Info className="h-6 w-6 shrink-0 text-blue-600" />
                  <div>
                    <h4 className="m-0 text-blue-900 font-bold mb-1">Prescription Required</h4>
                    <p className="m-0 text-sm">
                      This item requires a valid medical prescription from a licensed healthcare professional. You will be required to upload your prescription during checkout or send it to our verification team.
                    </p>
                  </div>
                </div>
              )}
              <ul>
                <li><strong>Manufacturer:</strong> {product.manufacturer || 'Verified Partner'}</li>
                <li><strong>Category:</strong> {product.categoryName}</li>
                {product.sku && <li><strong>SKU:</strong> {product.sku}</li>}
              </ul>
            </TabsContent>
            <TabsContent value="shipping" className="p-6 mt-4 bg-white rounded-xl border border-border prose max-w-none prose-p:text-muted-foreground">
              <h3>Shipping Information</h3>
              <p>Aksantimed provides secure, reliable delivery across the Democratic Republic of Congo and South Africa.</p>
              
              <h4>Delivery Times</h4>
              <ul>
                <li><strong>Kinshasa / Sandton (Local):</strong> 1-2 business days</li>
                <li><strong>DRC Provinces / Rest of SA:</strong> 3-5 business days</li>
                <li><strong>Remote Locations:</strong> 5-7 business days</li>
              </ul>
              
              <h4>Cold Chain Logistics</h4>
              <p>Temperature-sensitive pharmaceuticals are transported using verified cold-chain logistics to ensure product integrity and efficacy upon arrival.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedData && relatedData.products.filter(p => p.id !== product.id).length > 0 && (
        <div className="bg-muted/20 border-t border-border py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold font-serif text-foreground mb-8">Related Medical Supplies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedData.products.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
