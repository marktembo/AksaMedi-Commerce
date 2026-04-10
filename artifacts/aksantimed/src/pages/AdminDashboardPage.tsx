import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  HeartPulse, Users, MessageSquare, LogOut, RefreshCw,
  Building2, Mail, Phone, Briefcase, Calendar, ChevronDown,
  ChevronRight, CheckCircle, Clock, Search, ShieldCheck,
  ClipboardList, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API_BASE = `${BASE}/api`;

interface AdminCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string;
  jobTitle: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AdminInquiry {
  id: number;
  userId: number;
  submissionId: string | null;
  productId: number | null;
  productName: string;
  productSku: string | null;
  message: string;
  contactName: string | null;
  contactPhone: string | null;
  contactCompany: string | null;
  status: string;
  createdAt: string;
  customerEmail: string | null;
  customerName: string | null;
  customerCompany: string | null;
}

interface QuoteRequest {
  id: number;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  companyName: string | null;
  deliveryCity: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    productSku: string | null;
    quantity: number;
  }>;
}

type Tab = "customers" | "inquiries" | "quotes";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

export default function AdminDashboardPage() {
  const { adminToken, adminLogout } = useAdminAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("quotes");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [inquirySearch, setInquirySearch] = useState("");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  const fetchCustomers = useCallback(() => {
    if (!adminToken) return;
    setLoadingCustomers(true);
    adminFetch<AdminCustomer[]>("/admin/customers", adminToken)
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoadingCustomers(false));
  }, [adminToken]);

  const fetchInquiries = useCallback(() => {
    if (!adminToken) return;
    setLoadingInquiries(true);
    adminFetch<AdminInquiry[]>("/admin/inquiries", adminToken)
      .then(setInquiries)
      .catch(() => {})
      .finally(() => setLoadingInquiries(false));
  }, [adminToken]);

  const fetchQuotes = useCallback(() => {
    if (!adminToken) return;
    setLoadingQuotes(true);
    adminFetch<QuoteRequest[]>("/quote-requests/admin", adminToken)
      .then(setQuotes)
      .catch(() => {})
      .finally(() => setLoadingQuotes(false));
  }, [adminToken]);

  useEffect(() => { fetchCustomers(); fetchInquiries(); fetchQuotes(); }, [fetchCustomers, fetchInquiries, fetchQuotes]);

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  const updateStatus = async (id: number, status: string) => {
    if (!adminToken) return;
    try {
      await adminFetch(`/admin/inquiries/${id}/status`, adminToken, { method: "PATCH", body: JSON.stringify({ status }) });
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    } catch { /* ignore */ }
  };

  const updateQuoteStatus = async (id: number, status: string) => {
    if (!adminToken) return;
    try {
      await adminFetch(`/quote-requests/admin/${id}/status`, adminToken, { method: "PATCH", body: JSON.stringify({ status }) });
      setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    } catch { /* ignore */ }
  };

  const toggleExpand = (key: string) => {
    setExpandedSubmissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleQuote = (id: number) => {
    setExpandedQuotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const QUOTE_STATUSES = ["new", "pending", "contacted", "closed"] as const;

  const filteredQuotes = quotes.filter((q) =>
    !quoteSearch ||
    q.customerName.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    q.customerEmail.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    q.requestNumber.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    (q.companyName ?? "").toLowerCase().includes(quoteSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    !customerSearch ||
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.companyName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredInquiries = inquiries.filter((i) =>
    !inquirySearch ||
    (i.customerName ?? "").toLowerCase().includes(inquirySearch.toLowerCase()) ||
    (i.customerEmail ?? "").toLowerCase().includes(inquirySearch.toLowerCase()) ||
    i.productName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
    (i.contactCompany ?? "").toLowerCase().includes(inquirySearch.toLowerCase())
  );

  const groupedInquiries = (() => {
    const groups: Record<string, AdminInquiry[]> = {};
    const noGroupKey = "__single__";
    filteredInquiries.forEach((inq) => {
      const key = inq.submissionId ?? `${noGroupKey}_${inq.id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inq);
    });
    return Object.entries(groups).map(([key, items]) => ({
      key,
      items,
      isBulk: !key.startsWith(noGroupKey),
    }));
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#8B0000] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm font-serif">Aksantimed Admin</p>
            <p className="text-white/60 text-xs">Management Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Customers", value: customers.length, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Quote Requests", value: quotes.length, icon: ClipboardList, color: "text-[#8B0000] bg-red-50" },
            { label: "Active Clients", value: customers.filter((c) => c.isActive).length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
            { label: "New Quotes", value: quotes.filter((q) => q.status === "new").length, icon: Clock, color: "text-amber-600 bg-amber-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {([
            { key: "quotes", label: "Quote Requests", icon: ClipboardList },
            { key: "customers", label: "Customers", icon: Users },
            { key: "inquiries", label: "Inquiries", icon: MessageSquare },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-[#8B0000] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {key === "quotes" ? quotes.length : key === "customers" ? customers.length : inquiries.length}
              </span>
            </button>
          ))}
        </div>

        {/* Quotes tab */}
        {activeTab === "quotes" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, ref…"
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <button onClick={fetchQuotes} disabled={loadingQuotes} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                <RefreshCw className={`h-4 w-4 ${loadingQuotes ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingQuotes ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No quote requests yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredQuotes.map((q) => {
                  const isExpanded = expandedQuotes.has(q.id);
                  const statusColors: Record<string, string> = {
                    new: "bg-amber-50 text-amber-700 border-amber-200",
                    pending: "bg-blue-50 text-blue-700 border-blue-200",
                    contacted: "bg-purple-50 text-purple-700 border-purple-200",
                    closed: "bg-green-50 text-green-700 border-green-200",
                  };
                  return (
                    <div key={q.id} className="p-4">
                      {/* Header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#8B0000] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            {q.requestNumber}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${statusColors[q.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(q.createdAt)}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium">{q.customerName}</span>
                        </div>
                        {q.companyName && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            <span>{q.companyName}</span>
                          </div>
                        )}
                        <a href={`mailto:${q.customerEmail}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                          <Mail className="h-3.5 w-3.5" />
                          {q.customerEmail}
                        </a>
                        {q.customerPhone && (
                          <a href={`tel:${q.customerPhone}`} className="flex items-center gap-1.5 text-gray-600 hover:underline">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {q.customerPhone}
                          </a>
                        )}
                      </div>

                      {/* Items preview */}
                      <button
                        onClick={() => toggleQuote(q.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 mb-2"
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        {q.items.length} product{q.items.length !== 1 ? "s" : ""} requested
                      </button>

                      {isExpanded && (
                        <div className="mb-3 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-100 text-gray-500 text-left">
                                <th className="px-3 py-2 font-semibold">Product</th>
                                <th className="px-3 py-2 font-semibold">SKU</th>
                                <th className="px-3 py-2 font-semibold text-right">Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {q.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 font-medium">{item.productName}</td>
                                  <td className="px-3 py-2 text-gray-400">{item.productSku ?? "—"}</td>
                                  <td className="px-3 py-2 text-right font-bold">{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {q.message && (
                            <div className="px-3 py-2 border-t border-gray-100 text-gray-600 italic">
                              "{q.message}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status update */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-400 mr-1">Set status:</span>
                        {QUOTE_STATUSES.map((s) => (
                          <button
                            key={s}
                            disabled={q.status === s}
                            onClick={() => updateQuoteStatus(q.id, s)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                              q.status === s
                                ? "bg-[#8B0000] text-white border-[#8B0000] cursor-default"
                                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Customers tab */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <button onClick={fetchCustomers} disabled={loadingCustomers} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                <RefreshCw className={`h-4 w-4 ${loadingCustomers ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingCustomers ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading customers…</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No customers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Contact</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Organisation</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Joined</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#8B0000]/10 flex items-center justify-center shrink-0 text-[#8B0000] font-semibold text-sm">
                              {c.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{c.fullName}</p>
                              {c.jobTitle && <p className="text-xs text-gray-400">{c.jobTitle}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {c.email}
                            </div>
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {c.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {c.companyName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(c.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inquiries tab */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inquiries…"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <button onClick={fetchInquiries} disabled={loadingInquiries} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50">
                <RefreshCw className={`h-4 w-4 ${loadingInquiries ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingInquiries ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading inquiries…</div>
            ) : groupedInquiries.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No inquiries found.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {groupedInquiries.map(({ key, items, isBulk }) => {
                  const first = items[0];
                  const isExpanded = expandedSubmissions.has(key);
                  const allResponded = items.every((i) => i.status === "responded");
                  const statusColor = allResponded
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <div key={key}>
                      {/* Submission row */}
                      <div
                        className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => isBulk && toggleExpand(key)}
                      >
                        <div className="h-9 w-9 rounded-full bg-[#8B0000]/10 flex items-center justify-center shrink-0 text-[#8B0000] font-semibold text-sm">
                          {(first.customerName ?? first.contactName ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 text-sm">
                              {first.customerName ?? first.contactName ?? "Unknown"}
                            </p>
                            <span className="text-gray-400 text-xs">—</span>
                            <p className="text-xs text-gray-500">
                              {first.customerCompany ?? first.contactCompany ?? first.customerEmail ?? "—"}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isBulk ? `${items.length} products · ` : `${first.productName} · `}
                            {formatDate(first.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColor}`}>
                            {allResponded ? "Responded" : "Pending"}
                          </span>
                          {!allResponded && (
                            <button
                              onClick={(e) => { e.stopPropagation(); items.forEach((i) => updateStatus(i.id, "responded")); }}
                              className="text-xs px-2 py-1 rounded-lg bg-[#8B0000]/5 text-[#8B0000] hover:bg-[#8B0000]/10 font-medium transition-colors"
                            >
                              Mark Responded
                            </button>
                          )}
                          {isBulk && (
                            <span className="text-gray-400">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expanded product list */}
                      {(isExpanded || !isBulk) && (
                        <div className="bg-gray-50/50 border-t border-gray-100">
                          {/* Message */}
                          {first.message && (
                            <div className="px-4 pt-3 pb-2">
                              <p className="text-xs text-gray-500 italic">"{first.message}"</p>
                              {first.contactPhone && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                  <Phone className="h-3 w-3" />
                                  {first.contactPhone}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Products */}
                          <div className="px-4 pb-3 space-y-1.5">
                            {items.map((inq) => (
                              <div key={inq.id} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <HeartPulse className="h-3.5 w-3.5 text-[#8B0000]/40 shrink-0" />
                                  <p className="text-xs font-medium text-gray-800 truncate">{inq.productName}</p>
                                  {inq.productSku && <span className="text-xs text-gray-400 shrink-0">SKU: {inq.productSku}</span>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                    inq.status === "responded" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                                  }`}>
                                    {inq.status === "responded" ? "Responded" : "Sent"}
                                  </span>
                                  {inq.status !== "responded" && (
                                    <button
                                      onClick={() => updateStatus(inq.id, "responded")}
                                      className="text-xs text-[#8B0000]/70 hover:text-[#8B0000] underline underline-offset-2"
                                    >
                                      Mark
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
