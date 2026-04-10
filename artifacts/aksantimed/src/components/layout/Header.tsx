import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ShoppingCart, Menu, Search, X, MessageSquare,
  ChevronDown, FlaskConical, Stethoscope, Scissors,
  Pill, ShieldCheck, Heart, Activity, Microscope,
  Layers, HeartPulse, Zap, Package, Wind, Eye,
  Baby, Star, Syringe, Building, ArrowRight,
  User, LogOut, LayoutDashboard, LogIn, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/contexts/QuoteCartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const shopColumns = [
  {
    heading: "Essentials",
    items: [
      { label: "Pharmaceuticals", slug: "pharmaceuticals", icon: Pill },
      { label: "First Aid", slug: "first-aid", icon: ShieldCheck },
      { label: "Health & Wellness", slug: "health-wellness", icon: Heart },
      { label: "Personal Protective Equip.", slug: "ppe", icon: ShieldCheck },
      { label: "Medical Devices", slug: "medical-devices", icon: Activity },
    ],
  },
  {
    heading: "Diagnostics",
    items: [
      { label: "Laboratory", slug: "laboratory", icon: FlaskConical },
      { label: "Diagnostics & Lab", slug: "diagnostics-lab", icon: Microscope },
      { label: "Radiology & Imaging", slug: "radiology-imaging", icon: Layers },
      { label: "Patient Monitoring", slug: "patient-monitoring", icon: HeartPulse },
    ],
  },
  {
    heading: "Surgery & Procedures",
    items: [
      { label: "Surgery", slug: "surgery", icon: Scissors },
      { label: "Surgical Supplies", slug: "surgical-supplies", icon: Package },
      { label: "Sterilization", slug: "sterilization", icon: Star },
      { label: "Emergency & Trauma", slug: "emergency-trauma", icon: Zap },
    ],
  },
  {
    heading: "Specialties",
    items: [
      { label: "Cardiology", slug: "cardiology", icon: HeartPulse },
      { label: "Pediatrics", slug: "pediatrics", icon: Baby },
      { label: "Gynecology & Obstetrics", slug: "gynecology-obstetrics", icon: Heart },
      { label: "Ophthalmology", slug: "ophthalmology", icon: Eye },
      { label: "ENT", slug: "ent", icon: Activity },
      { label: "Dentistry", slug: "dentistry", icon: Syringe },
      { label: "Respiratory Care", slug: "respiratory-care", icon: Wind },
      { label: "Physiotherapy", slug: "physiotherapy", icon: Activity },
    ],
  },
  {
    heading: "Facilities",
    items: [
      { label: "Hospital Furniture", slug: "hospital-furniture", icon: Building },
      { label: "Maternal & Child Health", slug: "maternal-child-health", icon: Baby },
      { label: "General Medicine", slug: "general-medicine", icon: Stethoscope },
    ],
  },
];

const specialtiesLinks = [
  { href: "/general-medicine", label: "General Medicine", desc: "Diagnostics, monitoring & consumables", icon: Stethoscope },
  { href: "/laboratory", label: "Laboratory", desc: "Reagents, analysers & rapid diagnostics", icon: FlaskConical },
  { href: "/surgery", label: "Surgery", desc: "Instruments, disposables & anaesthesia", icon: Scissors },
];

type OpenMenu = "shop" | "specialties" | "account" | null;

export function Header() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const { totalItems: cartItemCount } = useQuoteCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const openWith = (menu: OpenMenu) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const closeAll = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(null);
  };

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 pl-2 transition-opacity hover:opacity-90" onClick={closeAll}>
            <img src="/aksantimed-logo.png" alt="Aksantimed" className="h-10 w-10 rounded-lg object-contain" />
            <span className="font-bold text-[#8B0000] text-lg tracking-tight leading-none font-serif hidden sm:block">
              Aksantimed
            </span>
          </Link>

          {/* Desktop nav — right-aligned, close to actions */}
          <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium ml-auto">

              {/* Home */}
              <Link
                href="/"
                onClick={closeAll}
                className={`px-3.5 py-2 rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-primary/5 ${location === "/" ? "text-primary font-semibold" : "text-foreground/70"}`}
              >
                {t("nav.home")}
              </Link>

              {/* Shop mega menu trigger */}
              <div
                className="relative"
                onMouseEnter={() => openWith("shop")}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-primary/5 ${openMenu === "shop" ? "text-primary bg-primary/5" : "text-foreground/70"}`}
                  onClick={() => setOpenMenu(openMenu === "shop" ? null : "shop")}
                >
                  {t("nav.shop")}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === "shop" ? "rotate-180" : ""}`} />
                </button>

                {/* Mega menu panel — full-width fixed below header */}
                {openMenu === "shop" && (
                  <div
                    className="fixed left-0 right-0 top-16 z-50 shadow-2xl border-t border-border"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="flex">

                      {/* Left: maroon feature panel */}
                      <div className="w-64 shrink-0 bg-primary text-white flex flex-col p-7 gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Browse</p>
                          <h3 className="text-xl font-bold font-serif leading-tight">Medical Supply Catalog</h3>
                          <p className="text-white/60 text-xs mt-2 leading-relaxed">128+ verified products across 24 specialty categories.</p>
                        </div>

                        {/* Featured picks */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Popular</p>
                          {specialtiesLinks.map((s) => (
                            <Link
                              key={s.href}
                              href={s.href}
                              onClick={closeAll}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                            >
                              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                                <s.icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{s.label}</p>
                                <p className="text-[10px] text-white/50 leading-tight">{s.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>

                        <Link
                          href="/products"
                          onClick={closeAll}
                          className="mt-auto flex items-center justify-center gap-2 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-colors border border-white/20"
                        >
                          View All Products <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {/* Right: category columns */}
                      <div className="flex-1 bg-white px-8 py-7">
                        <div className="grid grid-cols-5 gap-6 max-w-6xl">
                          {shopColumns.map((col) => (
                            <div key={col.heading}>
                              {/* Column heading with accent bar */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-3.5 w-1 rounded-full bg-primary shrink-0" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{col.heading}</p>
                              </div>
                              <ul className="space-y-0.5">
                                {col.items.map((item) => (
                                  <li key={item.slug}>
                                    <Link
                                      href={`/products?categorySlug=${item.slug}`}
                                      onClick={closeAll}
                                      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-150"
                                    >
                                      <div className="h-6 w-6 rounded-md bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors">
                                        <item.icon className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary" />
                                      </div>
                                      <span className="leading-tight font-medium">{item.label}</span>
                                      <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Bottom bar */}
                        <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified manufacturers</span>
                            <span className="flex items-center gap-1.5"><HeartPulse className="h-3.5 w-3.5 text-primary" /> 128+ products</span>
                            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Pan-African delivery</span>
                          </div>
                          <a
                            href="mailto:info@aksantimed.com?subject=Quote Request"
                            onClick={closeAll}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 rounded-full px-4 h-7 hover:bg-primary hover:text-white transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" /> Request a Quote
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Specialties dropdown trigger */}
              <div
                className="relative"
                onMouseEnter={() => openWith("specialties")}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-primary/5 ${openMenu === "specialties" ? "text-primary bg-primary/5" : "text-foreground/70"}`}
                  onClick={() => setOpenMenu(openMenu === "specialties" ? null : "specialties")}
                >
                  {t("nav.specialties")}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === "specialties" ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown panel */}
                {openMenu === "specialties" && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-border rounded-2xl shadow-2xl p-3 z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    {specialtiesLinks.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={closeAll}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-primary/5 group ${isActive(s.href) ? "bg-primary/5" : ""}`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <s.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isActive(s.href) ? "text-primary" : "text-foreground"}`}>{s.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* About Us */}
              <Link
                href="/about"
                onClick={closeAll}
                className={`px-3.5 py-2 rounded-md whitespace-nowrap transition-colors hover:text-primary hover:bg-primary/5 ${isActive("/about") ? "text-primary font-semibold" : "text-foreground/70"}`}
              >
                {t("nav.aboutUs")}
              </Link>
            </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">

            {/* Search — icon toggle */}
            {searchOpen ? (
              <form onSubmit={(e) => { handleSearch(e); setSearchOpen(false); }} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  autoFocus
                  type="search"
                  placeholder={t("nav.searchPlaceholder")}
                  className="h-9 w-52 rounded-full border border-input bg-muted/40 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Separator */}
            <div className="h-5 w-px bg-gray-200 mx-0.5" />

            {/* Request a Quote */}
            <Link
              href="/cart"
              className="inline-flex items-center whitespace-nowrap rounded-full bg-primary px-4 h-9 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {t("nav.requestQuote")}
            </Link>

            {/* Account — authenticated or Sign Up dropdown */}
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => openWith("account")}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-[#8B0000] text-white text-sm font-bold hover:bg-[#6d0000] transition-colors"
                  title={user?.fullName}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? <User className="h-4 w-4" />}
                </button>
                {openMenu === "account" && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.companyName}</p>
                    </div>
                    <Link href="/account" onClick={closeAll}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> {t("nav.myDashboard")}
                    </Link>
                    <Link href="/account" onClick={closeAll}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <User className="w-4 h-4" /> {t("nav.profile")}
                    </Link>
                    <button
                      onClick={() => { logout(); closeAll(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> {t("nav.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sign Up dropdown */
              <div
                className="relative"
                onMouseEnter={() => openWith("account")}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-full border border-primary/40 text-sm font-semibold text-primary hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  {t("nav.signUp")}
                  <ChevronDown className={`w-3 h-3 transition-transform ${openMenu === "account" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "account" && (
                  <div
                    className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 z-50"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <Link href="/login" onClick={closeAll}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <LogIn className="w-4 h-4" /> {t("nav.signIn")}
                    </Link>
                    <Link href="/signup" onClick={closeAll}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      <UserPlus className="w-4 h-4" /> {t("nav.createAccount")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative group" onClick={closeAll}>
              <div className="flex items-center justify-center h-9 w-9 rounded-full text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors duration-200">
                <ShoppingCart className="h-4 w-4" />
              </div>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-white">
                  {cartItemCount}
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
        <div className="md:hidden border-t border-border bg-white shadow-lg">
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("nav.searchProductsPlaceholder")}
                className="h-11 w-full rounded-md border border-input bg-muted/20 pl-10 pr-4 text-base focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <nav className="flex flex-col gap-1 mb-4">
              <Link href="/" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{t("nav.home")}</Link>
              <Link href="/products" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{t("nav.allProducts")}</Link>

              <p className="text-xs font-bold uppercase tracking-widest text-primary px-3 pt-3 pb-1">{t("nav.specialties")}</p>
              {specialtiesLinks.map((s) => (
                <Link key={s.href} href={s.href} className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {s.label}
                </Link>
              ))}

              <Link href="/about" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{t("nav.aboutUs")}</Link>

              <div className="border-t border-gray-100 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary px-3 pt-1 pb-1">{t("nav.account")}</p>
                    <Link href="/account" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> {t("nav.myDashboard")}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full text-left text-base font-medium px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> {t("nav.signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="w-4 h-4" /> {t("nav.signIn")}
                    </Link>
                    <Link href="/signup" className="text-base font-medium px-3 py-2 rounded-md hover:bg-muted hover:text-primary transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="w-4 h-4" /> {t("nav.createAccount")}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile language picker */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <LanguageSwitcher variant="mobile" />
              </div>
            </nav>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-primary h-12 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              {t("nav.requestQuote")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
