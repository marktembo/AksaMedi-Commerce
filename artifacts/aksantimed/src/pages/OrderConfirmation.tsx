import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, Mail, MapPin, Calendar, Receipt } from "lucide-react";
import { format } from "date-fns";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id, 10);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 flex-1 max-w-3xl">
        <Skeleton className="h-40 w-full rounded-2xl mb-8" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-24 text-center flex-1">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the details for this order.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Success Banner */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
          <div className="bg-primary/5 border-b border-border p-8 md:p-12 text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">Order Received!</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Thank you for choosing Aksantimed. Your order has been successfully placed and is pending processing.
            </p>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-2xl font-bold text-foreground font-mono">{order.orderNumber}</p>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <Receipt className="h-4 w-4" /> Download Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Shipping Details
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">{order.customerName}</p>
                <p className="flex items-center gap-2 mt-1 text-sm"><Mail className="h-4 w-4" /> {order.customerEmail}</p>
              </div>
              <Separator />
              <div>
                <p>{order.shippingAddress}</p>
                <p>{order.city}, {order.country}</p>
                {order.customerPhone && <p className="mt-2">{order.customerPhone}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" /> Order Status
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">Date Placed</span>
                <span className="font-medium text-foreground">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                Our medical team will review your order. A proforma invoice will be sent to your email for final payment processing.
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-primary" /> Ordered Supplies
            </h2>
          </div>
          
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground text-lg mb-1">{item.productName}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                </div>
                <div className="font-bold text-lg text-foreground">
                  ${item.subtotal.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
          
          <div className="bg-muted/10 p-6 md:p-8 border-t border-border">
            <div className="space-y-3 max-w-xs ml-auto">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-foreground">${order.shippingCost.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-lg">Total Due</span>
                <span className="font-bold text-2xl text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
