import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Scissors,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Zap,
  Package,
  Layers,
  Wind,
} from "lucide-react";

const offerings = [
  {
    icon: Scissors,
    title: "Surgical Instruments",
    items: ["Scalpels & Blades", "Forceps & Clamps", "Retractors", "Needle Holders & Scissors"],
  },
  {
    icon: Package,
    title: "Disposable Supplies",
    items: ["Surgical Drapes & Gowns", "Gloves (sterile & non-sterile)", "Sutures & Staples", "Surgical Sponges"],
  },
  {
    icon: Layers,
    title: "Sterilisation",
    items: ["Autoclave Pouches", "Sterilisation Wraps", "Sterilisation Indicators", "Instrument Trays"],
  },
  {
    icon: Wind,
    title: "Anaesthesia & Airway",
    items: ["Laryngoscopes", "Endotracheal Tubes", "Anaesthesia Masks", "Breathing Circuits"],
  },
];

const highlights = [
  "Single-use instruments available in sterile packaging",
  "Instruments compatible with standard surgical trays",
  "CE-marked and ISO 13485 certified suppliers",
  "Sutures in absorbable and non-absorbable options",
  "Emergency surgical kits available for field hospitals",
];

const theatreTypes = [
  { label: "General Surgery", desc: "Full instrument sets and disposables for laparotomy, appendectomy, hernia repair, and more." },
  { label: "Orthopaedic Surgery", desc: "Bone saws, drills, retractors, and fixation systems for orthopaedic procedures." },
  { label: "Gynaecological Surgery", desc: "Dilators, specula, curettage sets, and laparoscopic instruments for gynaecology." },
  { label: "Paediatric Surgery", desc: "Paediatric-sized instruments and low-volume consumables for neonatal and paediatric theatres." },
];

export default function SurgeryPage() {
  const quoteSubject = encodeURIComponent("Quote Request: Surgical Supplies");

  return (
    <div className="bg-background flex-1">

      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
              <Scissors className="h-4 w-4" />
              Specialty: Surgery
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-5">
              Surgical<br />Supplies & Instruments
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
              The operating theatre demands zero compromise. Aksantimed supplies surgical teams across
              Africa with precision instruments, sterile disposables, and anaesthesia equipment
              — dependably, on time, every time.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-6 h-11 text-sm font-bold hover:bg-white/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Request a Quote
              </a>
              <Link href="/products?categorySlug=surgery">
                <Button variant="outline" className="rounded-full h-11 px-6 border-white/40 text-white bg-white/10 hover:bg-white/20">
                  Browse Surgical Products <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80"
              alt="Surgical team in operating theatre"
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
            From the first incision to wound closure — comprehensive surgical supply coverage.
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

      {/* Theatre types */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Theatre Types</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">Specialties We Cover</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {theatreTypes.map((t) => (
              <div key={t.label} className="bg-white rounded-2xl border border-border p-7 shadow-sm flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2">{t.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aksantimed */}
      <section className="container mx-auto px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"
            alt="Surgical instruments sterile tray"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3 mb-6 leading-tight">
            Theatre-Ready. Every Time.
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
              All surgical instruments and disposables are supplied with batch certificates and
              comply with international sterility standards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Outfit Your Operating Theatre</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            From single-use kits to complete instrument sets — our surgical supply team is ready to
            build a solution around your theatre's needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`mailto:info@aksantimed.com?subject=${quoteSubject}`}
              className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-8 h-12 text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Request a Quote
            </a>
            <Link href="/products?categorySlug=surgery">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-white/40 text-white bg-white/10 hover:bg-white/20">
                Browse Surgical Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
