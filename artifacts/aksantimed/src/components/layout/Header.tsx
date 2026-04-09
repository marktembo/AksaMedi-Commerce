import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";

export function Header() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const sessionId = getSessionId();
  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: ["/api/cart", { sessionId }] } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "All Products" },
    { href: "/products?category=pharmaceuticals", label: "Pharmaceuticals" },
    { href: "/products?category=medical-devices", label: "Medical Devices" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm transition-all duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <img src="/aksantimed-logo.png" alt="Aksantimed Logo" className="h-10" />
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`transition-colors hover:text-primary ${location === link.href ? 'text-primary font-bold' : 'text-foreground/80'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="search" 
                  placeholder="Search products..." 
                  className="h-10 w-64 rounded-full border border-input bg-muted/30 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <Link href="/cart" className="relative group p-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <ShoppingCart className="h-5 w-5" />
              </div>
              {cart && cart.itemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-white">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-foreground hover:text-primary hover:bg-primary/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white p-4 shadow-lg animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Search products..." 
              className="h-12 w-full rounded-md border border-input bg-muted/20 px-10 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-base font-medium text-foreground hover:text-primary px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
