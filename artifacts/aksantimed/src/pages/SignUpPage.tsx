import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiRegister } from "@/lib/auth-api";
import { useTranslation } from "react-i18next";

function getRedirectParams() {
  const params = new URLSearchParams(window.location.search);
  let redirect = params.get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) redirect = null;
  const reason = params.get("reason");
  return { redirect, reason };
}

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Company or clinic name is required"),
  jobTitle: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [{ redirect, reason }] = useState(getRedirectParams);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setIsLoading(true);
    try {
      const { token, user } = await apiRegister({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        password: data.password,
      });
      login(token, user);
      navigate(redirect || "/account");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B0000]/10 mb-4">
              <UserPlus className="w-6 h-6 text-[#8B0000]" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">{t("auth.createYourAccount")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("auth.signUpSubtitle")}</p>
          </div>

          {reason === "quote" && (
            <div className="flex items-start gap-2.5 bg-[#8B0000]/5 border border-[#8B0000]/20 text-[#8B0000] rounded-lg px-4 py-3 mb-6 text-sm">
              <ShoppingCart className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Create your account to submit your quote</p>
                <p className="text-xs text-[#8B0000]/80 mt-0.5">
                  Your cart is saved. Once registered we'll bring you back to checkout.
                </p>
              </div>
            </div>
          )}

          {serverError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">{t("auth.fullName")} <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder={t("auth.fullNamePlaceholder")}
                  autoComplete="name"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-400" : ""}
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("auth.phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("auth.phonePlaceholder")}
                  autoComplete="tel"
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.emailAddress")} <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailHospitalPlaceholder")}
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">{t("auth.organisationName")} <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  placeholder={t("auth.organisationPlaceholder")}
                  {...register("companyName")}
                  className={errors.companyName ? "border-red-400" : ""}
                />
                {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">{t("auth.jobTitle")}</Label>
                <Input
                  id="jobTitle"
                  placeholder={t("auth.jobTitlePlaceholder")}
                  {...register("jobTitle")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    autoComplete="new-password"
                    {...register("password")}
                    className={errors.password ? "border-red-400 pr-10" : "pr-10"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-400 pr-10" : "pr-10"}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2 text-xs text-blue-700 mt-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t("auth.accountBenefit")}</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B0000] hover:bg-[#6d0000] text-white h-11 font-medium mt-2"
            >
              {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}${reason ? `&reason=${reason}` : ""}` : ""}`} className="text-[#8B0000] font-medium hover:underline">
              {t("auth.signInLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
