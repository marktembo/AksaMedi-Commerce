import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Globe2,
  ShieldCheck,
  Lightbulb,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      icon: ShieldCheck,
      title: t("about.value1Title"),
      body: t("about.value1Body"),
    },
    {
      icon: Globe2,
      title: t("about.value2Title"),
      body: t("about.value2Body"),
    },
    {
      icon: Lightbulb,
      title: t("about.value3Title"),
      body: t("about.value3Body"),
    },
    {
      icon: Users,
      title: t("about.value4Title"),
      body: t("about.value4Body"),
    },
  ];

  const stats = [
    { value: "128+", label: t("about.stat1Label"), icon: HeartPulse },
    { value: "24", label: t("about.stat2Label"), icon: Target },
    { value: "2", label: t("about.stat3Label"), icon: Globe2 },
    { value: "100%", label: t("about.stat4Label"), icon: Award },
  ];

  const milestones = [
    {
      year: t("about.milestone1Year"),
      title: t("about.milestone1Title"),
      body: t("about.milestone1Body"),
    },
    {
      year: t("about.milestone2Year"),
      title: t("about.milestone2Title"),
      body: t("about.milestone2Body"),
    },
    {
      year: t("about.milestone3Year"),
      title: t("about.milestone3Title"),
      body: t("about.milestone3Body"),
    },
    {
      year: t("about.milestone4Year"),
      title: t("about.milestone4Title"),
      body: t("about.milestone4Body"),
    },
    {
      year: t("about.milestone5Year"),
      title: t("about.milestone5Title"),
      body: t("about.milestone5Body"),
    },
  ];

  return (
    <div className="bg-background flex-1">

      {/* Hero */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 md:px-6 py-24 md:py-36 flex flex-col items-center text-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <HeartPulse className="h-4 w-4" />
            {t("about.pageTitle")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-serif max-w-4xl leading-tight">
            Empowering Health,<br />Enriching Lives
          </h1>
          <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
            {t("about.pageSubtitle")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="rounded-full font-bold px-8">
                Browse Our Catalog
              </Button>
            </Link>
            <a
              href="mailto:info@aksantimed.com?subject=Partnership Inquiry"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 h-11 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              {t("about.contactTitle")}
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-10 gap-2 px-6">
                <s.icon className="h-7 w-7 text-primary mb-1" />
                <span className="text-4xl font-bold text-foreground font-serif">{s.value}</span>
                <span className="text-sm text-muted-foreground font-medium text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div>
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3 mb-6 leading-tight">
            Built to Serve Africa's Healthcare Revolution
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-base">
            <p>{t("about.missionBody")}</p>
            <p>{t("about.missionBody2")}</p>
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
            alt="Medical professionals at work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="font-semibold text-lg font-serif">Trusted by healthcare professionals</p>
            <p className="text-white/80 text-sm">across the DRC and South Africa</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 border-y border-border py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">{t("about.valuesTitle")}</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">
              The Principles That Guide Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-7 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3 font-serif text-foreground">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">{t("about.timelineTitle")}</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">
            Milestones That Shaped Us
          </h2>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          <div className="space-y-10">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex gap-6 md:gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="hidden md:flex flex-col items-center flex-1 justify-start pt-2">
                  {i % 2 === 1 && (
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm w-full">
                      <span className="text-primary font-bold text-sm uppercase tracking-widest">{m.year}</span>
                      <h3 className="font-bold text-lg font-serif mt-1 mb-2">{m.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{m.body}</p>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-start justify-center pt-3 shrink-0">
                  <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 ring-offset-2" />
                </div>
                <div className="flex flex-col flex-1 justify-start pt-2">
                  {i % 2 === 0 && (
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm w-full">
                      <span className="text-primary font-bold text-sm uppercase tracking-widest">{m.year}</span>
                      <h3 className="font-bold text-lg font-serif mt-1 mb-2">{m.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{m.body}</p>
                    </div>
                  )}
                  <div className="md:hidden bg-white rounded-2xl border border-border p-6 shadow-sm w-full">
                    <span className="text-primary font-bold text-sm uppercase tracking-widest">{m.year}</span>
                    <h3 className="font-bold text-lg font-serif mt-1 mb-2">{m.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Where We Are</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-3">{t("about.headquartersTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">Kinshasa</p>
                  <p className="text-white/60 text-sm">Democratic Republic of Congo</p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                123 Boulevard du 30 Juin<br />Gombe, Kinshasa, DRC
              </p>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +243 81 234 5678</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> kinshasa@aksantimed.com</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">Johannesburg</p>
                  <p className="text-white/60 text-sm">South Africa</p>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                45 Nelson Mandela Square<br />Sandton, Johannesburg, ZA
              </p>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +27 11 234 5678</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> joburg@aksantimed.com</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 py-20 text-center">
        <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">Ready to Work Together?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base leading-relaxed">
          {t("about.contactSubtitle")}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="mailto:info@aksantimed.com?subject=Partnership Inquiry"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 h-12 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            {t("about.contactTitle")} <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/products">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12">
              Browse Products
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
