import { useState, useEffect } from "react";
import { X, Trash2, Send, MessageSquare, HeartPulse, CheckCircle2, LogIn, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useInquiry } from "@/contexts/InquiryContext";
import { apiSubmitBulkInquiry } from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";

function generateSubmissionId(): string {
  return `inq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function InquiryDrawer() {
  const { inquiryProducts, removeFromInquiry, clearInquiry, inquiryOpen, closeInquiry } = useInquiry();
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToAccount, setSavedToAccount] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.fullName,
        email: f.email || user.email,
        phone: f.phone || user.phone || "",
        company: f.company || user.companyName,
      }));
    }
  }, [isAuthenticated, user, inquiryOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const productList = inquiryProducts.map((p) => `• ${p.name} (SKU: ${p.sku || p.id})`).join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const subject = encodeURIComponent(`Inquiry – ${inquiryProducts.length} product${inquiryProducts.length > 1 ? "s" : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany / Hospital: ${form.company}\n\nProducts of Interest:\n${productList}\n\nMessage:\n${form.message}`
    );

    if (isAuthenticated && token) {
      try {
        const submissionId = generateSubmissionId();
        const message = form.message.trim() ||
          `Inquiry for ${inquiryProducts.length} product${inquiryProducts.length > 1 ? "s" : ""}:\n${productList}`;

        await apiSubmitBulkInquiry(token, {
          submissionId,
          products: inquiryProducts.map((p) => ({
            productId: p.id,
            productName: p.name,
            productSku: p.sku ?? undefined,
          })),
          message,
          contactName: form.name || undefined,
          contactPhone: form.phone || undefined,
          contactCompany: form.company || undefined,
        });

        setSavedToAccount(true);
        toast({ title: "Inquiry saved to your account", description: "Check your dashboard for inquiry history." });
      } catch {
        toast({ title: "Could not save to account", description: "Your email inquiry will still be sent.", variant: "destructive" });
      }
    }

    window.location.href = `mailto:info@aksantimed.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setSaving(false);
  };

  if (!inquiryOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeInquiry} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-primary text-white shrink-0">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            <div>
              <p className="font-bold text-base">Inquiry List</p>
              <p className="text-white/70 text-xs">{inquiryProducts.length} product{inquiryProducts.length !== 1 ? "s" : ""} selected</p>
            </div>
          </div>
          <button onClick={closeInquiry} className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Auth nudge for guests */}
          {!isAuthenticated && (
            <div className="mx-6 mt-4 flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <LogIn className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <Link href="/login" onClick={closeInquiry} className="font-semibold text-primary hover:underline">Sign in</Link>
                {" "}to save this inquiry to your account and track its status in your dashboard.
              </p>
            </div>
          )}

          {/* Product list */}
          {inquiryProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <HeartPulse className="h-14 w-14 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-foreground mb-1">No products added yet</p>
              <p className="text-sm text-muted-foreground">Click "Add to Inquiry" on any product card to build your list.</p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-3 border-b border-border">
              {inquiryProducts.map((p) => (
                <div key={p.id} className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-contain bg-white border border-border shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <HeartPulse className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{p.name}</p>
                    {p.manufacturer && <p className="text-xs text-muted-foreground mt-0.5">{p.manufacturer}</p>}
                    {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                  </div>
                  <button
                    onClick={() => removeFromInquiry(p.id)}
                    className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={clearInquiry} className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2">
                Clear all products
              </button>
            </div>
          )}

          {/* Success state */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary mb-4" />
              <p className="font-bold text-lg mb-2">Inquiry Sent!</p>
              {savedToAccount ? (
                <p className="text-sm text-muted-foreground mb-6">
                  Your inquiry has been sent via email and <span className="text-primary font-medium">saved to your account</span>. Track it in your dashboard.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">Your email client should have opened. We'll get back to you shortly.</p>
              )}
              <div className="flex gap-2">
                <Button onClick={() => { setSubmitted(false); setSavedToAccount(false); clearInquiry(); closeInquiry(); }} variant="outline" className="rounded-full">
                  New Inquiry
                </Button>
                {savedToAccount && (
                  <Link href="/account" onClick={closeInquiry}>
                    <Button className="rounded-full gap-2">
                      <Package className="h-4 w-4" />
                      View Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Your Contact Details</p>
                {isAuthenticated && (
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    Pre-filled from account
                  </span>
                )}
              </div>

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
                  readOnly={isAuthenticated}
                  className={`h-10 w-full rounded-lg border border-input bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${isAuthenticated ? "opacity-70 cursor-default" : ""}`}
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
                disabled={inquiryProducts.length === 0 || saving}
                className="w-full h-11 rounded-full font-bold text-sm gap-2"
              >
                {saving ? (
                  <><div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="h-4 w-4" /> {isAuthenticated ? "Submit & Save to Account" : "Submit Inquiry via Email"}</>
                )}
              </Button>

              {isAuthenticated && (
                <p className="text-center text-xs text-muted-foreground">
                  This inquiry will be saved to your dashboard for easy follow-up.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
