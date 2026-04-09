import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Microscope,
  TestTube,
  Droplets,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Zap,
} from "lucide-react";

const offerings = [
  {
    icon: Microscope,
    title: "Microscopy & Analysis",
    items: ["Laboratory Microscopes", "Slide Staining Kits", "Haematology Analysers", "Urine Analysers"],
  },
  {
    icon: TestTube,
    title: "Sample Collection",
    items: ["Blood Collection Tubes (EDTA, SST)", "Urine Collection Cups", "Swab Kits", "Lancets & Capillaries"],
  },
  {
    icon: FlaskConical,
    title: "Biochemistry & Reagents",
    items: ["Chemistry Reagent Kits", "Glucose & Cholesterol Strips", "HbA1c Test Kits", "CRP & ESR Kits"],
  },
  {
    icon: Droplets,
    title: "Rapid Diagnostics",
    items: ["Malaria RDT Kits", "HIV Rapid Tests", "Pregnancy Tests", "Dengue & Typhoid RDTs"],
  },
];

const highlights = [
  "Rapid diagnostics certified for tropical disease profiles",
  "Cold-chain logistics available for temperature-sensitive reagents",
  "Compatible with major analyser brands (Mindray, Sysmex, Roche)",
  "EDTA, SST, and lithium heparin tubes in bulk volumes",
  "Dedicated lab supply account managers",
];

const useCases = [
  { label: "Hospital Pathology Labs", desc: "Full suite of analysers, reagents, and sample handling equipment for inpatient and outpatient diagnostics." },
  { label: "Standalone Clinics", desc: "Compact rapid diagnostic kits and point-of-care analysers ideal for lower-volume settings." },
  { label: "Research Institutions", desc: "High-precision laboratory consumables and equipment for academic and applied medical research." },
  { label: "Public Health Programmes", desc: "Bulk reagents and RDT kits for mass screening programmes, including malaria and HIV campaigns." },
];

export default function LaboratoryPage() {
  const quoteSubject = encodeURIComponent("Quote Request: Laboratory Supplies");

  return (
    <div className="bg-background flex-1">

      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
              <FlaskConical className="h-4 w-4" />
              Specialty: Laboratory
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-5">
              Laboratory &<br />Diagnostic Supplies
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
              Precision diagnostics begin with the right tools. Aksantimed supplies pathology labs,
              clinics, and research centres with analysers, reagents, consumables, and rapid test kits
              — calibrated for Africa's disease landscape.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 h-11 text-sm font-bold hover:bg-white/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Request a Quote
              </a>
              <Link href="/products?categorySlug=laboratory">
                <Button variant="outline" className="rounded-full h-11 px-6 border-white/40 text-white bg-white/10 hover:bg-white/20">
                  Browse Lab Products <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80"
              alt="Laboratory diagnostics"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Product range */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Product Range</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">What We Supply</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            From sample collection to result reporting — we cover the full diagnostic workflow.
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

      {/* Use cases */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Who We Serve</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">Built for Every Lab Setting</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((u) => (
              <div key={u.label} className="bg-white rounded-2xl border border-border p-7 shadow-sm flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2">{u.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aksantimed */}
      <section className="container mx-auto px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3 mb-6 leading-tight">
            Reliable Supply for Precision Diagnostics
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
              All reagents and rapid test kits carry batch traceability and meet WHO performance criteria.
            </p>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80"
            alt="Laboratory technician at work"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Equip Your Lab Today</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Speak to our laboratory supply specialist for tailored recommendations and volume pricing.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-8 h-12 text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Request a Quote
            </a>
            <Link href="/products?categorySlug=laboratory">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-white/40 text-white bg-white/10 hover:bg-white/20">
                Browse Lab Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
