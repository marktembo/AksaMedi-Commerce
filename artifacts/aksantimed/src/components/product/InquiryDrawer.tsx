import { useState } from "react";
import { X, Trash2, Send, MessageSquare, HeartPulse, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@workspace/api-client-react";

interface InquiryDrawerProps {
  products: Product[];
  onRemove: (id: number) => void;
  onClear: () => void;
  open: boolean;
  onClose: () => void;
}

export function InquiryDrawer({ products, onRemove, onClear, open, onClose }: InquiryDrawerProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const productList = products.map((p) => `• ${p.name} (SKU: ${p.sku || p.id})`).join("\n");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry – ${products.length} product${products.length > 1 ? "s" : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany / Hospital: ${form.company}\n\nProducts of Interest:\n${productList}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:info@aksantimed.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-primary text-white">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            <div>
              <p className="font-bold text-base">Inquiry List</p>
              <p className="text-white/70 text-xs">{products.length} product{products.length !== 1 ? "s" : ""} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Product list */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <HeartPulse className="h-14 w-14 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-foreground mb-1">No products added yet</p>
              <p className="text-sm text-muted-foreground">Click "Add to Inquiry" on any product card to build your list.</p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-3 border-b border-border">
              {products.map((p) => (
                <div key={p.id} className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HeartPulse className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{p.name}</p>
                    {p.manufacturer && <p className="text-xs text-muted-foreground mt-0.5">{p.manufacturer}</p>}
                    {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2">
                Clear all products
              </button>
            </div>
          )}

          {/* Form */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary mb-4" />
              <p className="font-bold text-lg mb-2">Inquiry Sent!</p>
              <p className="text-sm text-muted-foreground mb-6">Your email client should have opened. We'll get back to you shortly.</p>
              <Button onClick={() => { setSubmitted(false); onClear(); onClose(); }} className="rounded-full">
                Start New Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <p className="text-sm font-semibold text-foreground mb-1">Your Contact Details</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Dr. Jane Mbeki" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="+243..." />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="you@hospital.org" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Hospital / Company</label>
                <input name="company" value={form.company} onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="General Hospital, Kinshasa" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Additional Notes</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                  className="w-full rounded-lg border border-input bg-muted/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  placeholder="Quantity needed, delivery location, timeline..." />
              </div>

              <Button
                type="submit"
                disabled={products.length === 0}
                className="w-full h-11 rounded-full font-bold text-sm gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Inquiry via Email
              </Button>

            </form>
          )}
        </div>
      </div>
    </>
  );
}
