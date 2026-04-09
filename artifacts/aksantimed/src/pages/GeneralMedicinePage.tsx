import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  HeartPulse,
  Thermometer,
  Activity,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

const offerings = [
  {
    icon: Stethoscope,
    title: "Diagnostic Instruments",
    items: ["Stethoscopes", "Sphygmomanometers", "Otoscopes & Ophthalmoscopes", "Reflex Hammers"],
  },
  {
    icon: HeartPulse,
    title: "Patient Monitoring",
    items: ["Digital Blood Pressure Monitors", "Pulse Oximeters", "ECG Machines", "Glucometers"],
  },
  {
    icon: Thermometer,
    title: "Temperature & Vitals",
    items: ["Digital Thermometers", "Infrared Thermometers", "Peak Flow Meters", "SpO₂ Sensors"],
  },
  {
    icon: Activity,
    title: "Wound & Consumables",
    items: ["Wound Dressings & Bandages", "Gloves & Protective Gear", "IV Sets & Cannulas", "Syringes & Needles"],
  },
];

const highlights = [
  "All products sourced from WHO-approved manufacturers",
  "Suitable for primary care clinics, GP practices, and hospitals",
  "Competitive pricing with bulk-order discounts",
  "Fast delivery across DR Congo and South Africa",
  "Dedicated account manager for institutional buyers",
];

export default function GeneralMedicinePage() {
  const quoteSubject = encodeURIComponent("Quote Request: General Medicine Supplies");

  return (
    <div className="bg-background flex-1">

      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
              <Stethoscope className="h-4 w-4" />
              Specialty: General Medicine
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-5">
              General Medicine<br />Supplies
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
              From the stethoscope to the IV drip, Aksantimed equips primary care practitioners
              and general hospitals with everything needed to deliver high-quality, consistent patient care.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 h-11 text-sm font-bold hover:bg-white/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Request a Quote
              </a>
              <Link href="/products?categorySlug=general-medicine">
                <Button variant="outline" className="rounded-full h-11 px-6 border-white/40 text-white bg-white/10 hover:bg-white/20">
                  Browse Products <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80"
              alt="General medicine consultation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Product Range</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">What We Supply</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A comprehensive selection of general medicine equipment and consumables for every clinical setting.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((o) => (
            <div
              key={o.title}
              className="bg-white rounded-2xl border border-border p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <o.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-base font-serif mb-3">{o.title}</h3>
              <ul className="space-y-2">
                {o.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why Aksantimed */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80"
              alt="Medical equipment quality"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3 mb-6 leading-tight">
              The Aksantimed Difference
            </h2>
            <ul className="space-y-4">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                All Aksantimed products come with authenticity guarantees and are backed by our
                supplier quality assurance programme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Need General Medicine Supplies?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Contact our team for a personalised quote, bulk pricing, or to discuss a standing supply arrangement.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 h-12 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Request a Quote
          </a>
          <Link href="/products?categorySlug=general-medicine">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12">
              Browse All Products
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
