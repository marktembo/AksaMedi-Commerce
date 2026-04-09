import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { InquiryDrawer } from "@/components/product/InquiryDrawer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@workspace/api-client-react";
import {
  Search, SlidersHorizontal, ChevronRight, MessageSquare,
  ShieldCheck, Truck, HeadphonesIcon, Award, PackageSearch,
  ClipboardList,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const trustPoints = [
  { icon: ShieldCheck, title: "Verified Sources", desc: "Every product sourced from accredited, WHO-approved manufacturers." },
  { icon: Award, title: "Quality Guaranteed", desc: "Batch-certified products meeting international medical standards." },
  { icon: Truck, title: "Pan-African Delivery", desc: "Reliable supply chain to the DRC, South Africa and beyond." },
  { icon: HeadphonesIcon, title: "Expert Support", desc: "Dedicated account managers for hospitals, clinics and procurement teams." },
];

export default function ProductsPage() {
  const [location] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("categorySlug") || searchParams.get("category");
  const initialSearch = searchParams.get("search");

  const [search, setSearch] = useState(initialSearch || "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || "");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || "all");
  const [sortOrder, setSortOrder] = useState<string>("featured");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Inquiry system
  const [inquiryProducts, setInquiryProducts] = useState<Product[]>([]);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const addToInquiry = (product: Product) => {
    setInquiryProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromInquiry = (id: number) => setInquiryProducts((prev) => prev.filter((p) => p.id !== id));
  const clearInquiry = () => setInquiryProducts([]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categorySlug") || params.get("category");
    const q = params.get("search");
    if (cat) setCategoryFilter(cat);
    if (q) { setSearch(q); setDebouncedSearch(q); }
  }, [location]);

  const { data: categoriesData, isLoading: categoriesLoading } = useListCategories();
  const selectedCategoryId = categoriesData?.find((c) => c.slug === categoryFilter)?.id;
  const selectedCategoryName = categoriesData?.find((c) => c.slug === categoryFilter)?.name;

  const { data: productsData, isLoading: productsLoading } = useListProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryFilter !== "all" ? selectedCategoryId : undefined,
    page,
    limit: 12,
  });

  const handleCategoryChange = (slug: string) => {
    setCategoryFilter(slug);
    setPage(1);
    const url = new URL(window.location.href);
    if (slug === "all") { url.searchParams.delete("category"); url.searchParams.delete("categorySlug"); }
    else { url.searchParams.set("categorySlug", slug); url.searchParams.delete("category"); }
    window.history.pushState({}, "", url.toString());
  };

  const sortedProducts = [...(productsData?.products || [])].filter((p) => {
    if (availabilityFilter === "in-stock") return p.inStock;
    if (availabilityFilter === "out-of-stock") return !p.inStock;
    return true;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
    if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const SidebarContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4">Categories</h3>
        {categoriesLoading ? (
          <div className="space-y-2">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === "all" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                All Products
              </button>
            </li>
            {categoriesData?.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat.slug ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs font-normal ${categoryFilter === cat.slug ? "text-white/70" : "text-muted-foreground/60"}`}>{cat.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Availability quick filter */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground mb-4">Availability</h3>
        <div className="space-y-0.5">
          {[["all", "All Items"], ["in-stock", "In Stock Only"], ["out-of-stock", "Out of Stock"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setAvailabilityFilter(val)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${availabilityFilter === val ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-muted/20">

      {/* Page Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-4 gap-1">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Products</span>
            {selectedCategoryName && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">{selectedCategoryName}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
                {selectedCategoryName ? `${selectedCategoryName} Supplies` : "Medical Catalog"}
              </h1>
              <p className="text-muted-foreground text-base max-w-xl">
                {selectedCategoryName
                  ? `Browse our verified ${selectedCategoryName.toLowerCase()} products. Contact us for pricing and availability.`
                  : "Browse our comprehensive range of verified medical supplies, pharmaceuticals, and equipment."}
              </p>
              {!productsLoading && productsData && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold text-foreground">{productsData.total}</span> product{productsData.total !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {/* Inquiry summary button */}
            {inquiryProducts.length > 0 && (
              <button
                onClick={() => setInquiryOpen(true)}
                className="flex items-center gap-2.5 rounded-full bg-primary text-white px-5 h-10 text-sm font-bold shadow-lg hover:bg-primary/90 transition-colors shrink-0 animate-in slide-in-from-right-4"
              >
                <ClipboardList className="h-4 w-4" />
                Inquiry List ({inquiryProducts.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="bg-white border-b border-border/60">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/40">
            {trustPoints.map((t) => (
              <div key={t.title} className="flex items-center gap-3 py-4 px-4 md:px-6">
                <t.icon className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground leading-tight hidden md:block">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-28 bg-white p-5 rounded-xl border border-border shadow-sm">
              <SidebarContent />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="bg-white px-4 py-3 rounded-xl border border-border shadow-sm mb-6 flex flex-wrap justify-between items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by name, SKU, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 border-input bg-muted/30 text-sm"
                />
              </div>

              <div className="flex items-center gap-2.5">
                {/* Mobile filter sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden h-9 gap-2">
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[360px]">
                    <SheetHeader>
                      <SheetTitle>Filter Products</SheetTitle>
                      <SheetDescription>Narrow down your product search.</SheetDescription>
                    </SheetHeader>
                    <div className="py-6"><SidebarContent /></div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="name-asc">Name: A → Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z → A</SelectItem>
                  </SelectContent>
                </Select>

                {/* Inquiry list trigger */}
                <button
                  onClick={() => setInquiryOpen(true)}
                  className={`relative flex items-center gap-1.5 h-9 rounded-lg px-3 text-sm font-medium border transition-colors ${inquiryProducts.length > 0 ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Inquiry</span>
                  {inquiryProducts.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                      {inquiryProducts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-8 w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white p-16 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                <PackageSearch className="h-16 w-16 text-muted-foreground/20 mb-5" />
                <h3 className="text-xl font-bold font-serif mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  We couldn't find products matching your current filters. Try adjusting your search or category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setSearch(""); setDebouncedSearch(""); handleCategoryChange("all"); setAvailabilityFilter("all"); }}
                  className="rounded-full"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToInquiry={addToInquiry}
                      inInquiry={inquiryProducts.some((p) => p.id === product.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {productsData && productsData.total > productsData.limit && (
                  <div className="mt-12 flex justify-center items-center gap-3">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full">
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                      <span className="font-semibold text-foreground">{Math.ceil(productsData.total / productsData.limit)}</span>
                    </span>
                    <Button variant="outline" disabled={page >= Math.ceil(productsData.total / productsData.limit)} onClick={() => setPage((p) => p + 1)} className="rounded-full">
                      Next
                    </Button>
                  </div>
                )}

                {/* Mid-page CTA */}
                <div className="mt-12 bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center">
                  <h3 className="font-bold text-lg font-serif mb-2">Can't find what you need?</h3>
                  <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                    Our catalog is growing. Contact us and our specialists will source the exact product you need.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <a
                      href="mailto:info@aksantimed.com?subject=Product Sourcing Request"
                      className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-6 h-10 text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" /> Contact Us
                    </a>
                    <Link href="/about">
                      <Button variant="outline" className="rounded-full h-10">Learn About Us</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Drawer */}
      <InquiryDrawer
        products={inquiryProducts}
        onRemove={removeFromInquiry}
        onClear={clearInquiry}
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />

      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}
