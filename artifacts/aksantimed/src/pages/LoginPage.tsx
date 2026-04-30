import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { apiLogin } from "@/lib/auth-api";
import { useTranslation } from "react-i18next";

// ── Helpers for safe ?redirect= handling ──────────────────────────────
function getRedirectParams() {
  const params = new URLSearchParams(window.location.search);
  let redirect = params.get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) redirect = null;
  const reason = params.get("reason");
  return { redirect, reason };
}

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [{ redirect, reason }] = useState(getRedirectParams);

  useEffect(() => {
    if (authLoading) return;
    if (isAdminAuthenticated) { navigate("/admin"); return; }
    if (isAuthenticated) {
      if (redirect) navigate(redirect);
      else navigate(user?.role === "admin" ? "/admin" : "/account");
    }
  }, [authLoading, isAuthenticated, isAdminAuthenticated, user, navigate, redirect]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setIsLoading(true);
    try {
      const { token, user: loggedInUser } = await apiLogin(data.email, data.password);
      login(token, loggedInUser);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(loggedInUser.role === "admin" ? "/admin" : "/account");
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B0000]/10 mb-4">
              <LogIn className="w-6 h-6 text-[#8B0000]" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">{t("auth.welcomeBack")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("auth.signInSubtitle")}</p>
          </div>

          {reason === "quote" && (
            <div className="flex items-start gap-2.5 bg-[#8B0000]/5 border border-[#8B0000]/20 text-[#8B0000] rounded-lg px-4 py-3 mb-6 text-sm">
              <ShoppingCart className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Please log in to submit your quote</p>
                <p className="text-xs text-[#8B0000]/80 mt-0.5">
                  Your cart is saved. After signing in we'll bring you back to checkout.{" "}
                  <Link href={`/signup${window.location.search}`} className="underline font-semibold">
                    No account? Create one.
                  </Link>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="/forgot-password" className="text-xs text-[#8B0000] hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className={errors.password ? "border-red-400 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B0000] hover:bg-[#6d0000] text-white h-11 font-medium"
            >
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("auth.noAccount")}{" "}
            <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}${reason ? `&reason=${reason}` : ""}` : ""}`} className="text-[#8B0000] font-medium hover:underline">
              {t("auth.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
