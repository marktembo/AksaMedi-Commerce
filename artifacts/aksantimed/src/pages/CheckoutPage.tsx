import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useQuoteCart } from "@/contexts/QuoteCartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HeartPulse, Lock, ShieldCheck, Truck } from "lucide-react";

const COUNTRIES = ["Democratic Republic of Congo", "South Africa", "Angola", "Zambia", "Kenya", "Tanzania", "Other"];

interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  deliveryCity: string;
  message: string;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, totalItems, clearCart } = useQuoteCart();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // ── Feature 1: gate checkout for guests ────────────────────────────────
  // Cart is already persisted in localStorage by QuoteCartContext, so it
  // survives the auth round-trip automatically. We just redirect.
  useEffect(() => {
    if (authLoading) return;
    if (items.length === 0) {
      setLocation("/cart");
      return;
    }
    if (!isAuthenticated) {
      setLocation("/login?redirect=/checkout&reason=quote");
    }
  }, [authLoading, isAuthenticated, items.length, setLocation]);

  const [form, setForm] = useState<FormState>({
    customerName: user?.fullName ?? "",
    customerEmail: user?.email ?? "",
    customerPhone: user?.phone ?? "",
    companyName: user?.companyName ?? "",
    deliveryCity: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);

  // Keep form synced once auth resolves (in case user was loading)
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.fullName,
        customerEmail: f.customerEmail || user.email,
        customerPhone: f.customerPhone || (user.phone ?? ""),
        companyName: f.companyName || user.companyName,
      }));
    }
  }, [user]);

  if (authLoading || !isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Preparing your checkout…</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.customerName.trim()) newErrors.customerName = "Full name is required";
    if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) newErrors.customerEmail = "Valid email is required";
    if (!form.customerPhone.trim()) newErrors.customerPhone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const authToken = localStorage.getItem("aksantimed_auth_token");
      const response = await fetch(`${BASE}/api/quote-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            productSku: product.sku ?? undefined,
            productImageUrl: product.imageUrl ?? undefined,
            quantity,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Submission failed");
      }

      const data = await response.json();
      clearCart();
      setLocation(`/order-confirmation/${data.id}?rn=${encodeURIComponent(data.requestNumber)}`);
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `h-11 w-full rounded-lg border px-3 text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors[field] ? "border-destructive" : "border-input"}`;

  return (
    <div className="bg-muted/10 flex-1 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">Submit Quote Request</h1>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">

          {/* Checkout Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-4">Your Contact Details</h2>

              {isAuthenticated && (
                <div className="mb-5 flex items-center gap-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Pre-filled from your account. You can edit any field below.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name / Clinic Name *</label>
                    <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Dr. Jane Mbeki" className={inputClass("customerName")} />
                    {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                    <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="+243 81 000 0000" className={inputClass("customerPhone")} />
                    {errors.customerPhone && <p className="text-xs text-destructive mt-1">{errors.customerPhone}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address *</label>
                  <input name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange}
                    readOnly={isAuthenticated}
                    placeholder="you@hospital.org"
                    className={`${inputClass("customerEmail")} ${isAuthenticated ? "opacity-70 cursor-default" : ""}`} />
                  {errors.customerEmail && <p className="text-xs text-destructive mt-1">{errors.customerEmail}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Hospital / Company</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="General Hospital, Kinshasa" className={inputClass("companyName")} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Delivery City / Country</label>
                    <input name="deliveryCity" value={form.deliveryCity} onChange={handleChange} placeholder="Kinshasa, DRC" className={inputClass("deliveryCity")} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Message / Special Notes</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Quantity details, urgency, delivery instructions, license numbers..."
                    className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <Button type="submit" size="lg" className="w-full h-14 text-base font-bold shadow-md" disabled={submitting}>
                    {submitting ? (
                      <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" /> Submitting…</>
                    ) : (
                      "Submit Quote Request"
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Our team will review your request and send a proforma invoice within 24–48 hours.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-5 text-foreground font-serif">Your Request</h2>

              <ul className="space-y-3 mb-5 max-h-[320px] overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3 items-center">
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted/30 border border-border p-1 flex items-center justify-center relative">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                      ) : (
                        <HeartPulse className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{product.name}</p>
                      {product.sku && <p className="text-[10px] text-muted-foreground">SKU: {product.sku}</p>}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground shrink-0">×{quantity}</p>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total products</span>
                <span className="font-semibold text-foreground">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm mb-5">
                <span className="text-muted-foreground">Total units</span>
                <span className="font-semibold text-foreground">{totalItems}</span>
              </div>

              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-xs text-muted-foreground space-y-2.5">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Quality assured from verified manufacturers.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Cold-chain delivery available for temperature-sensitive items.</p>
                </div>
              </div>

              <Link href="/cart" className="block text-center text-xs text-primary hover:underline mt-4">
                ← Edit cart
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
