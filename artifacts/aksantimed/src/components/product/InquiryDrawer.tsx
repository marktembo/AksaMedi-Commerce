import { useState } from "react";
import { X, Trash2, Send, MessageSquare, ChevronRight, HeartPulse, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@workspace/api-client-react";

interface InquiryDrawerProps {
  products: Product[];
  onRemove: (id: number) => void;
  onClear: () => void;
  open: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "+243000000000"; // ← Replace with your actual WhatsApp number

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

  const whatsappMsg = encodeURIComponent(
    `Hello Aksantimed, I am interested in the following products:\n${productList}\n\nPlease share pricing and availability.`
  );

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

              {products.length > 0 && (
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#1ebe5d] transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send via WhatsApp
                </a>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
