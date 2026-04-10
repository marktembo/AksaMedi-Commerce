import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Package, FileText, LogOut, Edit2, Save, X,
  Bookmark, Trash2, Mail, Phone, Building2, Briefcase,
  Clock, CheckCircle, AlertCircle, ShieldCheck, Eye, EyeOff,
  HeartPulse, ChevronRight, MessageSquare, RefreshCw, ShoppingBag,
  CheckCircle2, AlertTriangle, Hourglass, XCircle, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedProducts } from "@/contexts/SavedProductsContext";
import {
  apiUpdateProfile, apiChangePassword,
  apiGetInquiries, apiDeleteInquiry, type UserInquiry,
  apiGetMyQuoteRequests, type MyQuoteRequest,
} from "@/lib/auth-api";
import { useTranslation } from "react-i18next";

type Tab = "profile" | "saved" | "quotes" | "inquiries" | "security";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  jobTitle: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function DashboardPage() {
  const { user, token, logout, updateUser } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const { savedRecords: savedProducts, removeSaved, isLoading: loadingSaved } = useSavedProducts();
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [quoteRequests, setQuoteRequests] = useState<MyQuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const fetchInquiries = () => {
    if (!token) return;
    setLoadingInquiries(true);
    apiGetInquiries(token).then(setInquiries).finally(() => setLoadingInquiries(false));
  };

  const fetchQuoteRequests = () => {
    if (!token) return;
    setLoadingQuotes(true);
    apiGetMyQuoteRequests(token).then(setQuoteRequests).finally(() => setLoadingQuotes(false));
  };

  const handleDeleteInquiry = async (id: number) => {
    if (!token) return;
    await apiDeleteInquiry(token, id);
    setInquiries((prev) => prev.filter((q) => q.id !== id));
  };

  const groupedInquiries = (() => {
    const groups: Record<string, UserInquiry[]> = {};
    const noGroupKey = "__no_group__";
    inquiries.forEach((inq) => {
      const key = inq.submissionId ?? `${noGroupKey}_${inq.id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inq);
    });
    return Object.entries(groups)
      .map(([key, items]) => ({ key, items, isGroup: !key.startsWith(noGroupKey) }))
      .sort((a, b) => new Date(b.items[0].createdAt).getTime() - new Date(a.items[0].createdAt).getTime());
  })();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      companyName: user?.companyName ?? "",
      jobTitle: user?.jobTitle ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        phone: user.phone ?? "",
        companyName: user.companyName,
        jobTitle: user.jobTitle ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "inquiries" && token) {
      fetchInquiries();
    }
    if (activeTab === "quotes" && token) {
      fetchQuoteRequests();
    }
  }, [activeTab, token]);

  const onSaveProfile = async (data: ProfileFormData) => {
    if (!token) return;
    setProfileSaving(true);
    setProfileError("");
    try {
      const { user: updated } = await apiUpdateProfile(token, data);
      updateUser(updated);
      setIsEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    if (!token) return;
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await apiChangePassword(token, data.currentPassword, data.newPassword);
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: t("dashboard.profile"), icon: <User className="w-4 h-4" /> },
    { key: "saved", label: t("dashboard.savedProducts"), icon: <Bookmark className="w-4 h-4" /> },
    { key: "quotes", label: "Quote Requests", icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "inquiries", label: t("dashboard.inquiries"), icon: <FileText className="w-4 h-4" /> },
    { key: "security", label: t("dashboard.security"), icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const downloadQuotePDF = (qr: MyQuoteRequest) => {
    const statusLabels: Record<string, string> = {
      new: "Received", pending: "Under Review", contacted: "Contacted", closed: "Closed",
    };
    const statusLabel = statusLabels[qr.status] ?? "Received";
    const rows = qr.items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${item.productName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;color:#666">${item.productSku ?? "—"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${item.quantity}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Quote Request ${qr.requestNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#222;background:#fff;padding:32px 40px}
    @media print{body{padding:0}}
    .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #8B0000;margin-bottom:24px}
    .brand{color:#8B0000;font-size:26px;font-weight:800;letter-spacing:-0.5px}
    .tagline{font-size:11px;color:#999;margin-top:2px}
    .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#e8f5e9;color:#2e7d32}
    .ref{font-family:monospace;font-size:15px;font-weight:700;color:#8B0000}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;font-weight:700;margin-bottom:8px;margin-top:20px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .info-item{padding:10px 14px;background:#fafafa;border:1px solid #eee;border-radius:6px}
    .info-label{font-size:10px;text-transform:uppercase;color:#aaa;font-weight:700;letter-spacing:0.5px}
    .info-value{font-size:13px;color:#222;margin-top:2px;font-weight:500}
    table{width:100%;border-collapse:collapse;margin-top:8px;border-radius:6px;overflow:hidden;border:1px solid #eee}
    thead tr{background:#8B0000;color:#fff}
    th{padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}
    .msg{background:#f5f5f5;border-left:3px solid #8B0000;padding:10px 14px;border-radius:0 6px 6px 0;font-size:13px;color:#444;font-style:italic;margin-top:8px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#aaa}
    .footer strong{color:#8B0000}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Aksantimed</div>
      <div class="tagline">Empowering health, enriching lives</div>
    </div>
    <div style="text-align:right">
      <div class="ref">${qr.requestNumber}</div>
      <div style="font-size:12px;color:#666;margin-top:4px">Date: ${formatDate(qr.createdAt)}</div>
      <div class="badge" style="margin-top:6px">${statusLabel}</div>
    </div>
  </div>

  <div class="section-title">Customer Information</div>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Full Name</div>
      <div class="info-value">${user?.fullName ?? "—"}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Email</div>
      <div class="info-value">${user?.email ?? "—"}</div>
    </div>
    ${user?.phone ? `<div class="info-item"><div class="info-label">Phone</div><div class="info-value">${user.phone}</div></div>` : ""}
    ${user?.companyName ? `<div class="info-item"><div class="info-label">Company</div><div class="info-value">${user.companyName}</div></div>` : ""}
    ${qr.deliveryCity ? `<div class="info-item"><div class="info-label">Delivery City</div><div class="info-value">${qr.deliveryCity}</div></div>` : ""}
  </div>

  <div class="section-title">Requested Products</div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>SKU</th>
        <th style="text-align:center">Qty</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${qr.message ? `<div class="section-title">Your Message</div><div class="msg">"${qr.message}"</div>` : ""}

  <div class="footer">
    <strong>Aksantimed</strong> · Kinshasa, DRC &amp; South Africa<br/>
    info@aksantimed.com · www.aksantimed.com<br/>
    This is an automatically generated quote request receipt.
  </div>
</body>
</html>`;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">{t("dashboard.myAccount")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t("dashboard.welcomeBack")}, {user.fullName.split(" ")[0]}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="w-4 h-4" />
            {t("dashboard.signOut")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex flex-col items-center text-center p-4 border-b border-gray-100 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#8B0000] flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">{user.fullName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user.companyName}</p>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-[#8B0000] text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t("dashboard.signOut")}
                </button>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.profileDetails")}</h2>
                  {!isEditingProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {t("dashboard.edit")}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsEditingProfile(false); setProfileError(""); }}
                      className="flex items-center gap-2 text-gray-500"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t("dashboard.cancel")}
                    </Button>
                  )}
                </div>

                {profileSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t("dashboard.profileUpdated")}
                  </div>
                )}
                {profileError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {profileError}
                  </div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("dashboard.fullName")}</Label>
                        <Input {...profileForm.register("fullName")} />
                        {profileForm.formState.errors.fullName && (
                          <p className="text-xs text-red-500">{profileForm.formState.errors.fullName.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("auth.phoneNumber")}</Label>
                        <Input {...profileForm.register("phone")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("dashboard.organisation")}</Label>
                        <Input {...profileForm.register("companyName")} />
                        {profileForm.formState.errors.companyName && (
                          <p className="text-xs text-red-500">{profileForm.formState.errors.companyName.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("dashboard.jobTitle")}</Label>
                        <Input {...profileForm.register("jobTitle")} />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-[#8B0000] hover:bg-[#6d0000] text-white flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {profileSaving ? t("dashboard.saving") : t("dashboard.saveChanges")}
                    </Button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { icon: <User className="w-4 h-4" />, label: t("dashboard.fullName"), value: user.fullName },
                      { icon: <Mail className="w-4 h-4" />, label: t("dashboard.emailAddress"), value: user.email },
                      { icon: <Phone className="w-4 h-4" />, label: t("dashboard.phone"), value: user.phone ?? "—" },
                      { icon: <Building2 className="w-4 h-4" />, label: t("dashboard.organisation"), value: user.companyName },
                      { icon: <Briefcase className="w-4 h-4" />, label: t("dashboard.jobTitle"), value: user.jobTitle ?? "—" },
                      { icon: <Clock className="w-4 h-4" />, label: t("dashboard.memberSince"), value: formatDate(user.createdAt) },
                    ].map((field) => (
                      <div key={field.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#8B0000]/10 flex items-center justify-center text-[#8B0000] shrink-0">
                          {field.icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">{field.label}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{field.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("dashboard.savedProductsTitle")}</h2>
                {loadingSaved ? (
                  <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
                ) : savedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t("dashboard.noSavedProducts")}</p>
                    <p className="text-sm text-gray-400 mt-1">{t("dashboard.noSavedProductsDesc")}</p>
                    <Link href="/products">
                      <Button className="mt-4 bg-[#8B0000] hover:bg-[#6d0000] text-white" size="sm">
                        {t("dashboard.browseCatalog")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProducts.map((sp) => (
                      <div key={sp.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                          {sp.productImageUrl ? (
                            <img src={sp.productImageUrl} alt={sp.productName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-300 m-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{sp.productName}</p>
                          {sp.productCategory && (
                            <p className="text-xs text-gray-400 mt-0.5">{sp.productCategory}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">{t("dashboard.saved")} {formatDate(sp.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/products/${sp.productId}`}>
                            <Button variant="outline" size="sm" className="text-xs">{t("dashboard.view")}</Button>
                          </Link>
                          <button
                            onClick={() => removeSaved(sp.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "quotes" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Quote Requests</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your submitted quote requests and their status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchQuoteRequests}
                      disabled={loadingQuotes}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingQuotes ? "animate-spin" : ""}`} />
                    </button>
                    <Link href="/products">
                      <Button size="sm" className="bg-[#8B0000] hover:bg-[#6d0000] text-white rounded-full gap-1.5 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        New Quote
                      </Button>
                    </Link>
                  </div>
                </div>

                {loadingQuotes ? (
                  <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
                ) : quoteRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No quote requests yet</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                      Browse the catalog, add products to your quote cart, and submit — your receipts will appear here.
                    </p>
                    <Link href="/products">
                      <Button className="mt-4 bg-[#8B0000] hover:bg-[#6d0000] text-white" size="sm">
                        Browse Catalog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quoteRequests.map((qr) => {
                      const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
                        new: { label: "Received", icon: <Hourglass className="w-3 h-3" />, cls: "bg-blue-50 text-blue-600" },
                        pending: { label: "Under Review", icon: <AlertTriangle className="w-3 h-3" />, cls: "bg-amber-50 text-amber-600" },
                        contacted: { label: "Contacted", icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-green-50 text-green-600" },
                        closed: { label: "Closed", icon: <XCircle className="w-3 h-3" />, cls: "bg-gray-100 text-gray-500" },
                      };
                      const st = statusConfig[qr.status] ?? statusConfig.new;
                      return (
                        <div key={qr.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-[#8B0000]/10 flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-4 w-4 text-[#8B0000]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 font-mono">{qr.requestNumber}</p>
                                <p className="text-xs text-gray-400">{formatDate(qr.createdAt)}{qr.deliveryCity ? ` · ${qr.deliveryCity}` : ""}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${st.cls}`}>
                                {st.icon} {st.label}
                              </span>
                              <button
                                onClick={() => downloadQuotePDF(qr)}
                                title="Download PDF"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#8B0000] hover:bg-red-50 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="divide-y divide-gray-50">
                            {qr.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {item.productImageUrl ? (
                                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <Package className="h-5 w-5 text-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                  {item.productSku && <p className="text-xs text-gray-400">SKU: {item.productSku}</p>}
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full font-medium shrink-0">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Admin notes if any */}
                          {qr.adminNotes && (
                            <div className="px-4 py-3 bg-green-50/60 border-t border-green-100">
                              <p className="text-xs font-medium text-green-700 mb-0.5">Response from Aksantimed</p>
                              <p className="text-xs text-green-800 leading-relaxed">{qr.adminNotes}</p>
                            </div>
                          )}

                          {/* Message if any */}
                          {qr.message && (
                            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                              <p className="text-xs text-gray-500 italic">"{qr.message}"</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "inquiries" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.inquiryHistory")}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchInquiries}
                      disabled={loadingInquiries}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingInquiries ? "animate-spin" : ""}`} />
                    </button>
                    <Link href="/products">
                      <Button size="sm" className="bg-[#8B0000] hover:bg-[#6d0000] text-white rounded-full gap-1.5 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        New Inquiry
                      </Button>
                    </Link>
                  </div>
                </div>

                {loadingInquiries ? (
                  <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t("dashboard.noInquiries")}</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                      Browse the catalog, add products to your inquiry list, and submit — they'll appear here.
                    </p>
                    <Link href="/products">
                      <Button className="mt-4 bg-[#8B0000] hover:bg-[#6d0000] text-white" size="sm">
                        {t("dashboard.browseCatalog")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedInquiries.map(({ key, items, isGroup }) => {
                      const first = items[0];
                      const allSent = items.every((i) => i.status === "sent");
                      const allResponded = items.every((i) => i.status === "responded");

                      return (
                        <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Submission header */}
                          <div className="flex items-center justify-between gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-[#8B0000]/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="h-4 w-4 text-[#8B0000]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {isGroup
                                    ? `Inquiry — ${items.length} product${items.length > 1 ? "s" : ""}`
                                    : first.productName}
                                </p>
                                <p className="text-xs text-gray-400">{formatDate(first.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                allResponded
                                  ? "bg-green-50 text-green-600"
                                  : allSent
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}>
                                {allResponded ? "Responded" : allSent ? "Sent" : "In Progress"}
                              </span>
                            </div>
                          </div>

                          {/* Products list */}
                          <div className="divide-y divide-gray-50">
                            {items.map((inq) => (
                              <div key={inq.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                  <HeartPulse className="h-4 w-4 text-primary opacity-50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{inq.productName}</p>
                                  {inq.productSku && (
                                    <p className="text-xs text-gray-400">SKU: {inq.productSku}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {inq.productId && (
                                    <Link href={`/products/${inq.productId}`}>
                                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#8B0000] hover:bg-[#8B0000]/5 transition-colors" title="View product">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    </Link>
                                  )}
                                  <button
                                    onClick={() => handleDeleteInquiry(inq.id)}
                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Message + contact footer */}
                          {(first.message || first.contactCompany) && (
                            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                              {first.contactName && (
                                <p className="text-xs text-gray-500 mb-1">
                                  <span className="font-medium">From:</span> {first.contactName}
                                  {first.contactCompany && ` — ${first.contactCompany}`}
                                </p>
                              )}
                              {first.message && (
                                <p className="text-xs text-gray-500 line-clamp-2 italic">"{first.message}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("dashboard.securitySettings")}</h2>

                {passwordSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    {t("dashboard.passwordUpdated")}
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}

                <h3 className="text-sm font-semibold text-gray-700 mb-4">{t("dashboard.changePassword")}</h3>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-sm">
                  <div className="space-y-1.5">
                    <Label>{t("dashboard.currentPassword")}</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? "text" : "password"}
                        {...passwordForm.register("currentPassword")}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("dashboard.newPassword")}</Label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        {...passwordForm.register("newPassword")}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("dashboard.confirmNewPassword")}</Label>
                    <Input type="password" {...passwordForm.register("confirmPassword")} />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-[#8B0000] hover:bg-[#6d0000] text-white"
                  >
                    {passwordSaving ? t("dashboard.updating") : t("dashboard.updatePassword")}
                  </Button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
