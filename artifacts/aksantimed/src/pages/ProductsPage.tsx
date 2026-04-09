import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
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

export default function ProductsPage() {
  const [location] = useLocation();
  
  // Extract query params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("search");

  const [search, setSearch] = useState(initialSearch || "");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || "");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || "all");
  const [sortOrder, setSortOrder] = useState<string>("featured");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // If URL changes from outside, update state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("search");
    if (cat) setCategoryFilter(cat);
    if (q) {
      setSearch(q);
      setDebouncedSearch(q);
    }
  }, [location]);

  const { data: categoriesData, isLoading: categoriesLoading } = useListCategories();
  
  // Find category ID based on slug
  const selectedCategoryId = categoriesData?.find(c => c.slug === categoryFilter)?.id;
  
  const { data: productsData, isLoading: productsLoading } = useListProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryFilter !== "all" ? selectedCategoryId : undefined,
    page,
    limit: 12,
  });

  const handleCategoryChange = (slug: string) => {
    setCategoryFilter(slug);
    setPage(1);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.pushState({}, "", url.toString());
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg mb-4 text-foreground">Categories</h3>
        {categoriesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  categoryFilter === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All Products
              </button>
            </li>
            {categoriesData?.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    categoryFilter === cat.slug 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs ${categoryFilter === cat.slug ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                    {cat.productCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add more filters here if needed, like Price Range, In Stock only, etc */}
    </div>
  );

  return (
    <div className="flex-1 bg-muted/20">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Medical Catalog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Browse our comprehensive range of verified medical supplies, pharmaceuticals, and equipment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 bg-white p-6 rounded-xl border border-border shadow-sm">
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 w-full border-input bg-background"
                />
              </div>

              <div className="flex items-center w-full sm:w-auto gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden shrink-0">
                      <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filter Products</SheetTitle>
                      <SheetDescription>
                        Narrow down your product search.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                      <SidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl w-full" />
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                <Search className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn't find any products matching your search criteria. Try adjusting your filters or search term.
                </p>
                <Button 
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    handleCategoryChange("all");
                  }}
                  variant="outline"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Note: sorting logic would ideally be handled by API if params existed,
                      doing simple client-side sort for demo purposes based on returned page data */}
                  {[...(productsData?.products || [])].sort((a, b) => {
                    if (sortOrder === "price-asc") return a.price - b.price;
                    if (sortOrder === "price-desc") return b.price - a.price;
                    if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
                  }).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData && productsData.total > productsData.limit && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground mx-4">
                      Page {page} of {Math.ceil(productsData.total / productsData.limit)}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={page >= Math.ceil(productsData.total / productsData.limit)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
