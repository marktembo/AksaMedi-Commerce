import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiForgotPassword } from "@/lib/auth-api";
import { useTranslation } from "react-i18next";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setIsLoading(true);
    try {
      await apiForgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t("auth.backToSignIn")}
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B0000]/10 mb-4">
              <KeyRound className="w-6 h-6 text-[#8B0000]" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">{t("auth.resetPassword")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {submitted ? t("auth.resetSubtitleSent") : t("auth.resetSubtitle")}
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm w-full">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{t("auth.resetSentMessage")}</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {t("auth.didntReceive")}{" "}
                <button onClick={() => setSubmitted(false)} className="text-[#8B0000] hover:underline">
                  {t("auth.tryAgain")}
                </button>.
              </p>
            </div>
          ) : (
            <>
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8B0000] hover:bg-[#6d0000] text-white h-11 font-medium"
                >
                  {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
