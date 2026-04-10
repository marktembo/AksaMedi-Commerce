import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Package, ShoppingCart } from "lucide-react";

export default function OrderConfirmation() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const requestNumber = params.get("rn") ?? "—";

  return (
    <div className="bg-muted/10 flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">

        {/* Success Banner */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
          <div className="bg-primary/5 border-b border-border p-8 md:p-12 text-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-3">
              Quote Request Submitted!
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Thank you for choosing Aksantimed. Our medical supply team will review your request and contact you with a proforma invoice within 24–48 hours.
            </p>
          </div>

          <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request Reference</p>
              <p className="text-2xl font-bold text-foreground font-mono">{requestNumber}</p>
            </div>
            <div className="flex gap-3">
              <a
                href="mailto:info@aksantimed.com"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
              >
                <Mail className="h-4 w-4" /> Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-5 text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> What happens next?
          </h2>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Review", desc: "Our team reviews your request and verifies product availability." },
              { step: "2", title: "Proforma Invoice", desc: "We send you a detailed proforma invoice with pricing and lead times." },
              { step: "3", title: "Confirmation", desc: "You confirm and arrange payment — bank transfer, mobile money, or other." },
              { step: "4", title: "Delivery", desc: "We arrange logistics and deliver to your specified location." },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Contact info */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Questions? Reach us directly:</p>
          <a href="mailto:info@aksantimed.com" className="font-semibold text-primary hover:underline">
            info@aksantimed.com
          </a>
        </div>

        <div className="text-center">
          <Link href="/products">
            <Button variant="outline" size="lg" className="h-12 px-8 gap-2">
              <ShoppingCart className="h-4 w-4" /> Continue Browsing
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
