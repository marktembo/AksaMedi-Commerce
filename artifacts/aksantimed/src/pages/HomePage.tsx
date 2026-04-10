import { Link } from "wouter";
import { useGetFeaturedCategories, useListProducts, useGetStoreSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { ShieldCheck, Truck, Clock, HeartHandshake, ArrowRight, Activity, Pill, Stethoscope, BriefcaseMedical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  const { data: featuredCategories, isLoading: categoriesLoading } = useGetFeaturedCategories();
  const { data: productsData, isLoading: productsLoading } = useListProducts({ featured: true, limit: 8 });
  const { data: storeSummary } = useGetStoreSummary();

  const trustIcons = [
    { icon: ShieldCheck, title: t("home.trust1Title"), desc: t("home.trust1Desc") },
    { icon: Truck, title: t("home.trust2Title"), desc: t("home.trust2Desc") },
    { icon: HeartHandshake, title: t("home.trust3Title"), desc: t("home.trust3Desc") },
    { icon: Clock, title: t("home.trust4Title"), desc: t("home.trust4Desc") },
  ];

  return (
    <div className="w-full flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[680px] flex items-center bg-primary py-10">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-banner.png" 
            alt="Aksantimed Medical Professional"
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              <span>{t("home.tagline")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.1]">
              {t("home.title")}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl leading-relaxed">
              {t("home.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold h-12 px-8">
                  {t("home.ctaShop")}
                </Button>
              </Link>
              <Link href="/products?category=pharmaceuticals">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 h-12 px-8">
                  {t("home.ctaPharm")}
                </Button>
              </Link>
            </div>
            
            {storeSummary && (
              <div className="flex gap-8 pt-8 border-t border-white/20 mt-8">
                <div>
                  <p className="text-3xl font-bold text-white">{storeSummary.totalProducts}+</p>
                  <p className="text-sm text-white/70 uppercase tracking-wider font-semibold">{t("home.productsLabel")}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">1000+</p>
                  <p className="text-sm text-white/70 uppercase tracking-wider font-semibold">{t("home.ordersLabel")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIcons.map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-foreground mb-4 font-serif">{t("home.categoriesTitle")}</h2>
              <p className="text-muted-foreground text-lg">{t("home.categoriesSubtitle")}</p>
            </div>
            <Link href="/products" className="text-primary font-semibold hover:underline flex items-center gap-2 group">
              {t("home.viewAllCategories")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl w-full" />
              ))
            ) : featuredCategories?.map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category=${category.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden bg-white border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between p-6"
              >
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    {category.slug.includes('pharm') ? <Pill className="h-6 w-6" /> : 
                     category.slug.includes('device') ? <Stethoscope className="h-6 w-6" /> : 
                     <BriefcaseMedical className="h-6 w-6" />}
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{category.description}</p>
                    <div className="mt-4 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                      {t("home.exploreProducts")} <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">{t("home.featuredTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("home.featuredSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl w-full" />
              ))
            ) : productsData?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white h-12 px-8 font-semibold">
                {t("home.viewEntireCatalog")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-banner.png')] opacity-10 mix-blend-overlay object-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <HeartHandshake className="h-16 w-16 mx-auto text-white/80" />
            <h2 className="text-3xl md:text-4xl font-bold font-serif">{t("home.networkTitle")}</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {t("home.networkSubtitle")}
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 pt-6" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t("home.networkPlaceholder")} 
                className="flex-1 h-12 rounded-lg px-4 text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
              <Button type="submit" size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 font-bold px-8">
                {t("home.subscribe")}
              </Button>
            </form>
            <p className="text-xs text-white/50 pt-2">
              {t("home.networkPrivacy")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
