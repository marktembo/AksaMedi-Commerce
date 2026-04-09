import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Package, FileText, LogOut, Edit2, Save, X,
  Bookmark, Trash2, Mail, Phone, Building2, Briefcase,
  Clock, CheckCircle, AlertCircle, ShieldCheck, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiUpdateProfile, apiChangePassword,
  apiGetSavedProducts, apiUnsaveProduct,
  apiGetInquiries, type SavedProduct, type UserInquiry
} from "@/lib/auth-api";
import { useTranslation } from "react-i18next";

type Tab = "profile" | "saved" | "inquiries" | "security";

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
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

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
    if (activeTab === "saved" && token) {
      setLoadingSaved(true);
      apiGetSavedProducts(token).then(setSavedProducts).finally(() => setLoadingSaved(false));
    }
    if (activeTab === "inquiries" && token) {
      setLoadingInquiries(true);
      apiGetInquiries(token).then(setInquiries).finally(() => setLoadingInquiries(false));
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

  const removeSaved = async (id: number) => {
    if (!token) return;
    await apiUnsaveProduct(token, id);
    setSavedProducts((p) => p.filter((s) => s.id !== id));
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: t("dashboard.profile"), icon: <User className="w-4 h-4" /> },
    { key: "saved", label: t("dashboard.savedProducts"), icon: <Bookmark className="w-4 h-4" /> },
    { key: "inquiries", label: t("dashboard.inquiries"), icon: <FileText className="w-4 h-4" /> },
    { key: "security", label: t("dashboard.security"), icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

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

            {activeTab === "inquiries" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("dashboard.inquiryHistory")}</h2>
                {loadingInquiries ? (
                  <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">{t("dashboard.noInquiries")}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {t("dashboard.noInquiriesDesc")}
                    </p>
                    <Link href="/products">
                      <Button className="mt-4 bg-[#8B0000] hover:bg-[#6d0000] text-white" size="sm">
                        {t("dashboard.browseCatalog")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="p-4 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-gray-900 text-sm">{inq.productName}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            inq.status === "sent"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }`}>
                            {inq.status === "sent" ? t("dashboard.sent") : t("dashboard.responded")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{inq.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(inq.createdAt)}</p>
                      </div>
                    ))}
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
