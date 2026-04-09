import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetCart, useCreateOrder } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Lock, Truck } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(8, "Phone number is required"),
  shippingAddress: z.string().min(5, "Complete address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: cart, isLoading: isCartLoading } = useGetCart(
    { sessionId }, 
    { query: { enabled: !!sessionId, queryKey: ["/api/cart", { sessionId }] } }
  );

  // Redirect if cart is empty
  if (cart && cart.items.length === 0) {
    setLocation("/cart");
  }

  const createOrderMutation = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        // Invalidate cart as it's now empty on backend after order creation
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        
        // Generate a new session ID for future carts
        const newSessionId = crypto.randomUUID();
        localStorage.setItem("aksantimed_session_id", newSessionId);
        
        toast({
          title: "Order Placed Successfully",
          description: `Order #${order.orderNumber} has been confirmed.`,
        });
        
        setLocation(`/order-confirmation/${order.id}`);
      },
      onError: () => {
        toast({
          title: "Order Failed",
          description: "There was a problem processing your order. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      country: "",
      notes: "",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    createOrderMutation.mutate({
      data: {
        sessionId,
        ...data,
      }
    });
  };

  const SHIPPING_COST = 25.00;

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl font-bold font-serif mb-8 text-foreground">Secure Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="w-full lg:w-2/3 h-[600px] rounded-2xl" />
          <Skeleton className="w-full lg:w-1/3 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) return null; // Will redirect

  return (
    <div className="bg-muted/10 flex-1 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-col-reverse lg:flex-row">
          
          {/* Checkout Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-4">Shipping Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Full Name / Clinic Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jane Doe / City Hospital" {...field} className="h-11 bg-muted/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@example.com" {...field} className="h-11 bg-muted/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+243 81..." {...field} className="h-11 bg-muted/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Medical Ave, Floor 2" {...field} className="h-11 bg-muted/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">City / Province</FormLabel>
                          <FormControl>
                            <Input placeholder="Kinshasa" {...field} className="h-11 bg-muted/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-muted/20">
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DR Congo">Democratic Republic of Congo</SelectItem>
                              <SelectItem value="South Africa">South Africa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Special delivery instructions, license numbers, etc." 
                            className="resize-none min-h-[100px] bg-muted/20" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-6 border-t border-border mt-8">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold shadow-md"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Processing Order..." : "Place Order & Pay Later"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Aksantimed operates on an invoice-first model. Our team will verify your medical credentials (if required) and send a proforma invoice.
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-foreground font-serif">Order Details</h2>
              
              <ul className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 rounded bg-muted/30 border border-border p-1 flex items-center justify-center relative">
                      {item.productImageUrl && <img src={item.productImageUrl} alt={item.productName} className="max-h-full max-w-full object-contain mix-blend-multiply" />}
                      <span className="absolute -top-2 -right-2 bg-muted text-foreground text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center border border-border">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.productName}</p>
                      <p className="text-sm text-primary font-semibold mt-1">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Logistics</span>
                  <span className="font-medium text-foreground">${SHIPPING_COST.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-end mb-6">
                <span className="font-semibold text-foreground text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">${(cart.total + SHIPPING_COST).toFixed(2)}</span>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p>Quality assured medical supplies from verified sources.</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <p>Specialized cold-chain delivery available for temperature-sensitive items.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
