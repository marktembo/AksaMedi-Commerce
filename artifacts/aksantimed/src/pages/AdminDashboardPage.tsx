import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  HeartPulse, LogOut, LayoutDashboard, Package, PlusCircle,
  Warehouse, ClipboardList, Search, RefreshCw, Edit2, Trash2,
  Check, X, ChevronDown, ChevronRight, Star, Eye, EyeOff,
  CheckCircle, AlertCircle, BarChart3, Users, Upload, Save,
  Mail, Phone, Building2, ImageIcon, ShieldCheck, Loader2,
  ToggleLeft, ToggleRight, AlertTriangle, Menu
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string | null;
  imageUrl: string | null;
  categoryId: number | null;
  categoryName: string | null;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  published: boolean;
  prescriptionRequired: boolean;
  manufacturer: string | null;
  sku: string | null;
  createdAt: string;
}

interface AdminCategory { id: number; name: string; slug: string; }

interface QuoteItem {
  id: number;
  productName: string;
  productSku: string | null;
  quantity: number;
}

interface AdminQuote {
  id: number;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  companyName: string | null;
  deliveryCity: string | null;
  message: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  items: QuoteItem[];
}

interface AdminCustomer { id: number; fullName: string; email: string; }

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  categoryId: string;
  manufacturer: string;
  sku: string;
  stockQuantity: string;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  prescriptionRequired: boolean;
  imageUrl: string;
}

type AdminSection = "overview" | "products" | "add-product" | "edit-product" | "inventory" | "requests";

// ─── Helpers ────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API_BASE = `${BASE}/api`;

async function adminFetch<T>(path: string, token: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const QUOTE_STATUSES = ["new", "pending", "contacted", "closed"] as const;
const STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-purple-50 text-purple-700 border-purple-200",
  closed: "bg-green-50 text-green-700 border-green-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

function BoolPill({ val, label }: { val: boolean; label: string }) {
  return val
    ? <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">{label}</span>
    : <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">{label}</span>;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "overview",      label: "Overview",     icon: LayoutDashboard },
  { key: "products",      label: "Products",     icon: Package },
  { key: "add-product",   label: "Add Product",  icon: PlusCircle },
  { key: "inventory",     label: "Inventory",    icon: Warehouse },
  { key: "requests",      label: "Requests",     icon: ClipboardList },
] as const;

function Sidebar({
  section, setSection, logout, newQuotes, mobileOpen, setMobileOpen,
}: {
  section: AdminSection;
  setSection: (s: AdminSection) => void;
  logout: () => void;
  newQuotes: number;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-30 w-64 bg-gray-900 flex flex-col transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="h-9 w-9 rounded-xl bg-[#8B0000] flex items-center justify-center shrink-0">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm font-serif leading-none">Aksantimed</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
          <button className="ml-auto md:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setSection(key as AdminSection); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                section === key || (section === "edit-product" && key === "products")
                  ? "bg-[#8B0000] text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {key === "requests" && newQuotes > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {newQuotes > 9 ? "9+" : newQuotes}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Signed in as admin</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────

function OverviewSection({
  products, quotes, customers, setSection,
}: {
  products: AdminProduct[];
  quotes: AdminQuote[];
  customers: AdminCustomer[];
  setSection: (s: AdminSection) => void;
}) {
  const published = products.filter(p => p.published).length;
  const lowStock = products.filter(p => p.stockQuantity <= 5).length;
  const newQuotes = quotes.filter(q => q.status === "new").length;

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-blue-600 bg-blue-50", action: () => setSection("products") },
    { label: "Published", value: published, icon: Eye, color: "text-green-600 bg-green-50", action: () => setSection("products") },
    { label: "Low Stock (≤5)", value: lowStock, icon: AlertTriangle, color: "text-amber-600 bg-amber-50", action: () => setSection("inventory") },
    { label: "New Requests", value: newQuotes, icon: ClipboardList, color: "text-[#8B0000] bg-red-50", action: () => setSection("requests") },
    { label: "Customers", value: customers.length, icon: Users, color: "text-purple-600 bg-purple-50", action: undefined },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening on Aksantimed.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md transition-shadow disabled:cursor-default"
            disabled={!action}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Add Product", icon: PlusCircle, section: "add-product" as AdminSection, cls: "bg-[#8B0000] text-white hover:bg-[#7a0000]" },
          { label: "Manage Stock", icon: Warehouse, section: "inventory" as AdminSection, cls: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" },
          { label: "View Products", icon: Package, section: "products" as AdminSection, cls: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" },
          { label: "View Requests", icon: ClipboardList, section: "requests" as AdminSection, cls: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" },
        ].map(({ label, icon: Icon, section, cls }) => (
          <button key={label} onClick={() => setSection(section)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${cls}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Recent Requests */}
      {quotes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Requests</h2>
            <button onClick={() => setSection("requests")} className="text-xs text-[#8B0000] hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {quotes.slice(0, 5).map(q => (
              <div key={q.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{q.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono">{q.requestNumber}</p>
                </div>
                <StatusBadge status={q.status} />
                <span className="text-xs text-gray-400 shrink-0">{fmtDate(q.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Products Section ────────────────────────────────────────────────────────

function ProductsSection({
  products, categories, loading, onEdit, onDelete, onToggle, fetchProducts,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  loading: boolean;
  onEdit: (p: AdminProduct) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, field: "inStock" | "featured" | "published") => void;
  fetchProducts: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterPub, setFilterPub] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && String(p.categoryId) !== filterCat) return false;
    if (filterPub === "true" && !p.published) return false;
    if (filterPub === "false" && p.published) return false;
    if (filterStock === "true" && !p.inStock) return false;
    if (filterStock === "false" && p.inStock) return false;
    return true;
  });

  const handleDelete = (id: number) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Products</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {products.length} products</p>
        </div>
        <button onClick={fetchProducts} disabled={loading} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            placeholder="Search name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
          />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <select value={filterPub} onChange={e => setFilterPub(e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
          <option value="">Published: All</option>
          <option value="true">Published</option>
          <option value="false">Hidden</option>
        </select>
        <select value={filterStock} onChange={e => setFilterStock(e.target.value)} className="h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
          <option value="">Stock: All</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-10 w-10 opacity-25 mb-3" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-12"></th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Flags</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain mix-blend-multiply" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </td>

                    {/* Name / SKU */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.categoryName ?? "—"}</td>

                    {/* Brand */}
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.manufacturer ?? "—"}</td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-gray-900">{p.stockQuantity}</span>
                        <button
                          onClick={() => onToggle(p.id, "inStock")}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border transition-colors ${p.inStock ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </div>
                    </td>

                    {/* Flags */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-center">
                        <button onClick={() => onToggle(p.id, "published")} title="Toggle Published">
                          <BoolPill val={p.published} label={p.published ? "Published" : "Hidden"} />
                        </button>
                        <button onClick={() => onToggle(p.id, "featured")} title="Toggle Featured">
                          <BoolPill val={p.featured} label="Featured" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-[#8B0000]/40 hover:text-[#8B0000] transition-colors"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className={`flex items-center gap-1 h-7 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
                            confirmDelete === p.id
                              ? "border-red-400 bg-red-500 text-white"
                              : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                          {confirmDelete === p.id ? "Confirm?" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Form Section ────────────────────────────────────────────────────

const EMPTY_FORM: ProductFormData = {
  name: "", description: "", price: "", originalPrice: "", categoryId: "",
  manufacturer: "", sku: "", stockQuantity: "0",
  inStock: true, featured: false, published: true, prescriptionRequired: false,
  imageUrl: "",
};

function productToForm(p: AdminProduct): ProductFormData {
  return {
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice ?? "",
    categoryId: p.categoryId ? String(p.categoryId) : "",
    manufacturer: p.manufacturer ?? "",
    sku: p.sku ?? "",
    stockQuantity: String(p.stockQuantity),
    inStock: p.inStock,
    featured: p.featured,
    published: p.published,
    prescriptionRequired: p.prescriptionRequired,
    imageUrl: p.imageUrl ?? "",
  };
}

function ProductFormSection({
  editingProduct, categories, onSave, onCancel, token,
}: {
  editingProduct: AdminProduct | null;
  categories: AdminCategory[];
  onSave: () => void;
  onCancel: () => void;
  token: string;
}) {
  const isEdit = !!editingProduct;
  const [form, setForm] = useState<ProductFormData>(editingProduct ? productToForm(editingProduct) : EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editingProduct?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof ProductFormData, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price.trim() || isNaN(parseFloat(form.price))) errs.price = "Valid price is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      // Upload image if a new file was selected
      if (imageFile && imagePreview.startsWith("data:")) {
        const uploadRes = await adminFetch<{ url: string }>("/admin/upload", token, {
          method: "POST",
          body: JSON.stringify({ imageData: imagePreview, fileName: imageFile.name }),
        });
        imageUrl = uploadRes.url;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price.trim(),
        originalPrice: form.originalPrice.trim() || null,
        imageUrl: imageUrl || null,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
        manufacturer: form.manufacturer.trim() || null,
        sku: form.sku.trim() || null,
        stockQuantity: parseInt(form.stockQuantity, 10) || 0,
        inStock: form.inStock,
        featured: form.featured,
        published: form.published,
        prescriptionRequired: form.prescriptionRequired,
      };

      if (isEdit && editingProduct) {
        await adminFetch(`/admin/products/${editingProduct.id}`, token, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/admin/products", token, { method: "POST", body: JSON.stringify(payload) });
      }

      onSave();
    } catch (err) {
      setErrors({ _: err instanceof Error ? err.message : "Failed to save product" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field: string) =>
    `h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] transition-all ${errors[field] ? "border-red-400" : "border-gray-200"}`;

  const ToggleRow = ({ field, label, desc }: { field: keyof ProductFormData; label: string; desc?: string }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={form[field] as boolean}
        onClick={() => set(field, !(form[field] as boolean))}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form[field] ? "bg-[#8B0000]" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form[field] ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
    </label>
  );

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-700">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">{isEdit ? "Edit Product" : "Add New Product"}</h1>
          {isEdit && <p className="text-gray-500 text-sm">Editing: {editingProduct?.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._ && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{errors._}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: main info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Basic Info</h2>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Digital Pulse Oximeter" className={inputCls("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  rows={4}
                  placeholder="Detailed product description…"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] transition-all ${errors.description ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Classification</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                  <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={`${inputCls("categoryId")} bg-white`}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Brand / Manufacturer</label>
                  <input value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} placeholder="e.g. Contec Medical" className={inputCls("manufacturer")} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">SKU</label>
                  <input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="e.g. OXI-PULSE-001" className={inputCls("sku")} />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Pricing (USD)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Price (USD) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" className={inputCls("price")} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Original Price (optional)</label>
                  <input type="number" step="0.01" min="0" value={form.originalPrice} onChange={e => set("originalPrice", e.target.value)} placeholder="0.00" className={inputCls("originalPrice")} />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Inventory</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stock Quantity</label>
                  <input type="number" min="0" value={form.stockQuantity} onChange={e => set("stockQuantity", e.target.value)} className={inputCls("stockQuantity")} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column: settings + image */}
          <div className="space-y-4">

            {/* Image Upload */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Product Image</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative aspect-square w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-[#8B0000]/40 cursor-pointer bg-gray-50 flex flex-col items-center justify-center transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 text-center">Click to upload<br />JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(""); setImageFile(null); set("imageUrl", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove image
                </button>
              )}
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Or paste URL</label>
                <input
                  value={form.imageUrl}
                  onChange={e => { set("imageUrl", e.target.value); if (e.target.value) { setImagePreview(e.target.value); setImageFile(null); } }}
                  placeholder="/products/image.webp"
                  className={inputCls("imageUrl")}
                />
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Settings</h2>
              <ToggleRow field="published" label="Published" desc="Visible on the main site" />
              <ToggleRow field="inStock" label="In Stock" desc="Mark as available" />
              <ToggleRow field="featured" label="Featured" desc="Show in featured section" />
              <ToggleRow field="prescriptionRequired" label="Rx Required" desc="Prescription needed" />
            </div>

            {/* Save */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 bg-[#8B0000] text-white font-bold rounded-xl hover:bg-[#7a0000] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Product"}</>}
              </button>
              <button type="button" onClick={onCancel} className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Inventory Section ───────────────────────────────────────────────────────

function InventorySection({
  products, loading, fetchProducts, token,
}: {
  products: AdminProduct[];
  loading: boolean;
  fetchProducts: () => void;
  token: string;
}) {
  const [search, setSearch] = useState("");
  const [qtys, setQtys] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Set<number>>(new Set());

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const updateStock = async (id: number, updates: { stockQuantity?: number; inStock?: boolean }) => {
    setSaving(s => new Set(s).add(id));
    try {
      await adminFetch(`/admin/products/${id}/stock`, token, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      fetchProducts();
    } catch { /* silent */ } finally {
      setSaving(s => { const next = new Set(s); next.delete(id); return next; });
    }
  };

  const handleQtyBlur = (p: AdminProduct) => {
    const raw = qtys[p.id];
    if (raw === undefined) return;
    const qty = parseInt(raw, 10);
    if (!isNaN(qty) && qty >= 0 && qty !== p.stockQuantity) {
      updateStock(p.id, { stockQuantity: qty });
    }
    setQtys(q => { const n = { ...q }; delete n[p.id]; return n; });
  };

  const lowStock = filtered.filter(p => p.stockQuantity <= 5);
  const outOfStock = filtered.filter(p => !p.inStock);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Inventory</h1>
          <p className="text-gray-500 text-sm">{products.length} products — {outOfStock.length} out of stock, {lowStock.length} low stock</p>
        </div>
        <button onClick={fetchProducts} disabled={loading} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Alert: Low Stock */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong>{lowStock.length}</strong> product{lowStock.length !== 1 ? "s" : ""} have 5 or fewer units.
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const isSaving = saving.has(p.id);
                  const isLow = p.stockQuantity <= 5;
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${isLow ? "bg-amber-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.categoryName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            value={qtys[p.id] !== undefined ? qtys[p.id] : p.stockQuantity}
                            onChange={e => setQtys(q => ({ ...q, [p.id]: e.target.value }))}
                            onBlur={() => handleQtyBlur(p)}
                            className={`w-20 text-center h-8 rounded-lg border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] transition-all ${isLow ? "border-amber-300 text-amber-700" : "border-gray-200"}`}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateStock(p.id, { inStock: !p.inStock })}
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${
                            p.inStock
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
                        ) : (
                          <button
                            onClick={() => {
                              const qty = qtys[p.id] !== undefined ? parseInt(qtys[p.id], 10) : p.stockQuantity;
                              if (!isNaN(qty)) updateStock(p.id, { stockQuantity: qty });
                            }}
                            className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-[#8B0000] hover:text-white text-gray-500 flex items-center justify-center mx-auto transition-colors"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Requests Section ────────────────────────────────────────────────────────

function RequestsSection({ quotes, loading, fetchQuotes, token }: {
  quotes: AdminQuote[];
  loading: boolean;
  fetchQuotes: () => void;
  token: string;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<Set<number>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set());

  const filtered = quotes.filter(q => {
    if (filterStatus && q.status !== filterStatus) return false;
    if (search && !q.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !q.customerEmail.toLowerCase().includes(search.toLowerCase()) &&
      !q.requestNumber.toLowerCase().includes(search.toLowerCase()) &&
      !(q.companyName ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleExpand = (id: number) => setExpanded(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const updateStatus = async (id: number, status: string) => {
    setUpdatingStatus(s => new Set(s).add(id));
    try {
      await adminFetch(`/quote-requests/admin/${id}/status`, token, { method: "PATCH", body: JSON.stringify({ status }) });
      fetchQuotes();
    } catch { /* silent */ } finally {
      setUpdatingStatus(s => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const saveNotes = async (id: number, q: AdminQuote) => {
    const text = notes[id] !== undefined ? notes[id] : (q.adminNotes ?? "");
    setSavingNotes(s => new Set(s).add(id));
    try {
      await adminFetch(`/quote-requests/admin/${id}/notes`, token, { method: "PATCH", body: JSON.stringify({ adminNotes: text }) });
      fetchQuotes();
    } catch { /* silent */ } finally {
      setSavingNotes(s => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Quote Requests</h1>
          <p className="text-gray-500 text-sm">{filtered.length} of {quotes.length} requests</p>
        </div>
        <button onClick={fetchQuotes} disabled={loading} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            placeholder="Search customer, email, ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000]"
          />
        </div>
        <div className="flex gap-2">
          {["", ...QUOTE_STATUSES].map(s => (
            <button
              key={s || "all"}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors capitalize ${
                filterStatus === s
                  ? "bg-[#8B0000] text-white border-[#8B0000]"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {QUOTE_STATUSES.map(s => (
          <div key={s} className={`bg-white rounded-xl border p-3 text-center cursor-pointer transition-all hover:shadow-sm ${filterStatus === s ? "border-[#8B0000]/30 ring-2 ring-[#8B0000]/10" : "border-gray-100"}`} onClick={() => setFilterStatus(filterStatus === s ? "" : s)}>
            <p className="text-xl font-bold text-gray-900">{quotes.filter(q => q.status === s).length}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-16 text-gray-400">
          <ClipboardList className="h-10 w-10 opacity-25 mb-3" />
          <p className="text-sm">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const isExpanded = expanded.has(q.id);
            const noteText = notes[q.id] !== undefined ? notes[q.id] : (q.adminNotes ?? "");
            const isUpdating = updatingStatus.has(q.id);
            const isSavingNote = savingNotes.has(q.id);

            return (
              <div key={q.id} className={`bg-white rounded-xl border transition-shadow ${isExpanded ? "shadow-md" : "shadow-sm"} border-gray-100`}>
                {/* Header */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full flex items-start gap-4 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#8B0000] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {q.requestNumber}
                      </span>
                      <StatusBadge status={q.status} />
                      <span className="text-xs text-gray-400">{fmtDate(q.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="font-semibold text-gray-900">{q.customerName}</span>
                      {q.companyName && <span className="text-gray-500">{q.companyName}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{q.items.length} product{q.items.length !== 1 ? "s" : ""} requested</p>
                  </div>
                  <div className="shrink-0 text-gray-400">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-4">

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Email</p>
                        <a href={`mailto:${q.customerEmail}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 shrink-0" /> {q.customerEmail}
                        </a>
                      </div>
                      {q.customerPhone && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Phone</p>
                          <a href={`tel:${q.customerPhone}`} className="text-sm text-gray-700 flex items-center gap-1 hover:text-blue-600">
                            <Phone className="h-3.5 w-3.5 shrink-0" /> {q.customerPhone}
                          </a>
                        </div>
                      )}
                      {q.companyName && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Company</p>
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {q.companyName}
                          </p>
                        </div>
                      )}
                      {q.deliveryCity && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Delivery</p>
                          <p className="text-sm text-gray-700">{q.deliveryCity}</p>
                        </div>
                      )}
                    </div>

                    {/* Products table */}
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-3 py-2 text-left font-semibold text-gray-500">Product</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-500">SKU</th>
                            <th className="px-3 py-2 text-right font-semibold text-gray-500">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {q.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="px-3 py-2 font-medium text-gray-900">{item.productName}</td>
                              <td className="px-3 py-2 text-gray-400 font-mono">{item.productSku ?? "—"}</td>
                              <td className="px-3 py-2 text-right font-bold text-gray-900">{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Message */}
                    {q.message && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm text-gray-700 italic">
                        "{q.message}"
                      </div>
                    )}

                    {/* Status update */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {QUOTE_STATUSES.map(s => (
                          <button
                            key={s}
                            disabled={q.status === s || isUpdating}
                            onClick={() => updateStatus(q.id, s)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors capitalize ${
                              q.status === s
                                ? "bg-[#8B0000] text-white border-[#8B0000] cursor-default"
                                : "border-gray-200 text-gray-500 hover:border-[#8B0000]/40 hover:text-[#8B0000] disabled:opacity-50"
                            }`}
                          >
                            {isUpdating && q.status !== s ? <Loader2 className="h-3 w-3 animate-spin inline" /> : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Notes</p>
                      <textarea
                        value={noteText}
                        onChange={e => setNotes(n => ({ ...n, [q.id]: e.target.value }))}
                        rows={3}
                        placeholder="Add internal notes, follow-up reminders, pricing info…"
                        className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] resize-none"
                      />
                      <button
                        onClick={() => saveNotes(q.id, q)}
                        disabled={isSavingNote}
                        className="mt-2 flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#8B0000] text-white text-xs font-semibold hover:bg-[#7a0000] transition-colors disabled:opacity-60"
                      >
                        {isSavingNote ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</> : <><Save className="h-3 w-3" /> Save Notes</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { adminToken, adminLogout } = useAdminAuth();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<AdminSection>("overview");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const token = adminToken ?? "";

  const fetchProducts = useCallback(() => {
    if (!token) return;
    setLoadingProducts(true);
    adminFetch<AdminProduct[]>("/admin/products", token)
      .then(setProducts).catch(() => {}).finally(() => setLoadingProducts(false));
  }, [token]);

  const fetchQuotes = useCallback(() => {
    if (!token) return;
    setLoadingQuotes(true);
    adminFetch<AdminQuote[]>("/quote-requests/admin", token)
      .then(setQuotes).catch(() => {}).finally(() => setLoadingQuotes(false));
  }, [token]);

  const fetchCustomers = useCallback(() => {
    if (!token) return;
    setLoadingCustomers(true);
    adminFetch<AdminCustomer[]>("/admin/customers", token)
      .then(setCustomers).catch(() => {}).finally(() => setLoadingCustomers(false));
  }, [token]);

  const fetchCategories = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE}/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data: { categories?: AdminCategory[] }) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchQuotes();
    fetchCustomers();
    fetchCategories();
  }, [fetchProducts, fetchQuotes, fetchCustomers, fetchCategories]);

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminFetch(`/admin/products/${id}`, token, { method: "DELETE" });
      setProducts(ps => ps.filter(p => p.id !== id));
    } catch { /* silent */ }
  };

  const handleToggleProduct = async (id: number, field: "inStock" | "featured" | "published") => {
    try {
      await adminFetch<AdminProduct>(`/admin/products/${id}/toggle`, token, {
        method: "PATCH",
        body: JSON.stringify({ field }),
      });
      fetchProducts();
    } catch { /* silent */ }
  };

  const handleEditProduct = (p: AdminProduct) => {
    setEditingProduct(p);
    setSection("edit-product");
  };

  const handleProductSaved = () => {
    setEditingProduct(null);
    setSection("products");
    fetchProducts();
  };

  const newQuotes = quotes.filter(q => q.status === "new").length;

  const goTo = (s: AdminSection) => {
    if (s !== "edit-product") setEditingProduct(null);
    setSection(s);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        section={section}
        setSection={goTo}
        logout={handleLogout}
        newQuotes={newQuotes}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="font-semibold text-gray-900 text-sm capitalize">
                {section === "edit-product" ? "Edit Product" : section.replace("-", " ")}
              </p>
              {section === "products" && <p className="text-xs text-gray-400">{products.length} products total</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {section !== "add-product" && section !== "edit-product" && (
              <button
                onClick={() => goTo("add-product")}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#8B0000] text-white text-xs font-semibold hover:bg-[#7a0000] transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Product
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {section === "overview" && (
            <OverviewSection products={products} quotes={quotes} customers={customers} setSection={goTo} />
          )}
          {section === "products" && (
            <ProductsSection
              products={products}
              categories={categories}
              loading={loadingProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggle={handleToggleProduct}
              fetchProducts={fetchProducts}
            />
          )}
          {(section === "add-product" || section === "edit-product") && (
            <ProductFormSection
              editingProduct={editingProduct}
              categories={categories}
              onSave={handleProductSaved}
              onCancel={() => goTo(editingProduct ? "products" : "products")}
              token={token}
            />
          )}
          {section === "inventory" && (
            <InventorySection
              products={products}
              loading={loadingProducts}
              fetchProducts={fetchProducts}
              token={token}
            />
          )}
          {section === "requests" && (
            <RequestsSection
              quotes={quotes}
              loading={loadingQuotes}
              fetchQuotes={fetchQuotes}
              token={token}
            />
          )}
        </main>
      </div>
    </div>
  );
}
