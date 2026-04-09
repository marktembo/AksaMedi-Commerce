import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, Search, X, MessageSquare } from "lucide-react";
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
    { href: "/products?categorySlug=general-medicine", label: "General Medicine" },
    { href: "/products?categorySlug=laboratory", label: "Laboratory" },
    { href: "/products?categorySlug=surgery", label: "Surgery" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between gap-6">

          {/* Logo — always left */}
          <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90">
            <img src="/aksantimed-logo.png" alt="Aksantimed" className="h-11" />
          </Link>

          {/* Right-hand cluster: nav + search + quote + cart */}
          <div className="hidden md:flex items-center gap-5 flex-1 justify-end">

            {/* Nav links */}
            <nav className="flex items-center gap-5 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-primary ${
                    location === link.href ? "text-primary font-bold" : "text-foreground/75"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-6 w-px bg-border shrink-0" />

            {/* Search — integrated with actions */}
            <form onSubmit={handleSearch} className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-40 rounded-full border border-input bg-muted/40 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:w-52 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Request a Quote CTA */}
            <a
              href="mailto:info@aksantimed.com?subject=Quote Request"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 h-9 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              Request a Quote
            </a>

            {/* Cart icon */}
            <Link href="/cart" className="relative group shrink-0">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <ShoppingCart className="h-4 w-4" />
              </div>
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-white">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile toggle */}
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white p-4 shadow-lg animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="h-12 w-full rounded-md border border-input bg-muted/20 pl-10 pr-4 text-base focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <nav className="flex flex-col gap-1 mb-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors ${
                  location === link.href ? "text-primary bg-primary/5" : "text-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <a
            href="mailto:info@aksantimed.com?subject=Quote Request"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-primary h-12 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <MessageSquare className="h-5 w-5" />
            Request a Quote
          </a>
        </div>
      )}
    </header>
  );
}
