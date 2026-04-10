import { useState } from "react";
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  Building2, Globe, MessageSquare, Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API_BASE = `${BASE}/api`;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  subject: string;
  message: string;
}

const EMPTY: FormData = {
  fullName: "", email: "", phone: "", companyName: "", subject: "", message: "",
};

const SUBJECTS = [
  "General Inquiry",
  "Product Information",
  "Quote Request",
  "Partnership / Distribution",
  "Order Support",
  "Technical Support",
  "Other",
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-[#8B0000] text-white">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
              {t("nav.contact")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 leading-tight">
              {t("contact.heroTitle")}
            </h1>
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl">
              {t("contact.heroSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* ── Left: Info cards ── */}
          <div className="lg:col-span-2 space-y-5">

            <div>
              <h2 className="text-xl font-bold text-gray-900 font-serif mb-1">{t("contact.infoTitle")}</h2>
              <p className="text-gray-500 text-sm">{t("contact.infoSubtitle")}</p>
            </div>

            {/* DRC Office */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#8B0000]/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-[#8B0000]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t("contact.drcOffice")}</p>
                  <p className="text-xs text-gray-400">Kinshasa, DRC</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <a href="mailto:info@aksantimed.com" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#8B0000] transition-colors group">
                  <Mail className="h-4 w-4 text-gray-400 group-hover:text-[#8B0000] shrink-0" />
                  info@aksantimed.com
                </a>
                <a href="tel:+243999999999" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#8B0000] transition-colors group">
                  <Phone className="h-4 w-4 text-gray-400 group-hover:text-[#8B0000] shrink-0" />
                  +243 999 999 999
                </a>
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Avenue de la Clinique, Gombe,<br />Kinshasa, DRC</span>
                </div>
              </div>
            </div>

            {/* South Africa Office */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#8B0000]/10 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-[#8B0000]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t("contact.saOffice")}</p>
                  <p className="text-xs text-gray-400">South Africa</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <a href="mailto:sa@aksantimed.com" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#8B0000] transition-colors group">
                  <Mail className="h-4 w-4 text-gray-400 group-hover:text-[#8B0000] shrink-0" />
                  sa@aksantimed.com
                </a>
                <a href="tel:+27111234567" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#8B0000] transition-colors group">
                  <Phone className="h-4 w-4 text-gray-400 group-hover:text-[#8B0000] shrink-0" />
                  +27 11 123 4567
                </a>
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Sandton Business District,<br />Johannesburg, South Africa</span>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#8B0000]/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-[#8B0000]" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{t("contact.businessHours")}</p>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("contact.weekdays")}</span>
                  <span className="font-medium">08:00 – 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("contact.saturday")}</span>
                  <span className="font-medium">09:00 – 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("contact.sunday")}</span>
                  <span className="font-medium text-gray-400">{t("contact.closed")}</span>
                </div>
              </div>
            </div>

            {/* Quote note */}
            <div className="bg-[#8B0000]/5 border border-[#8B0000]/15 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-[#8B0000] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#8B0000] mb-1">{t("contact.quoteTip")}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{t("contact.quoteTipDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Contact form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 md:p-8">

              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-serif mb-2">{t("contact.successTitle")}</h3>
                  <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{t("contact.successDesc")}</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 h-10 px-6 rounded-xl bg-[#8B0000] text-white text-sm font-semibold hover:bg-[#7a0000] transition-colors"
                  >
                    {t("contact.sendAnother")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 font-serif mb-1">{t("contact.formTitle")}</h2>
                    <p className="text-gray-500 text-sm">{t("contact.formSubtitle")}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                          {t("contact.labelName")} <span className="text-[#8B0000]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.fullName}
                          onChange={set("fullName")}
                          placeholder={t("contact.placeholderName")}
                          className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                          {t("contact.labelEmail")} <span className="text-[#8B0000]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={set("email")}
                          placeholder={t("contact.placeholderEmail")}
                          className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                          {t("contact.labelPhone")}
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={set("phone")}
                          placeholder="+243 xxx xxx xxx"
                          className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                          {t("contact.labelCompany")}
                        </label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={set("companyName")}
                          placeholder={t("contact.placeholderCompany")}
                          className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        {t("contact.labelSubject")} <span className="text-[#8B0000]">*</span>
                      </label>
                      <select
                        required
                        value={form.subject}
                        onChange={set("subject")}
                        className="w-full h-10 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors appearance-none"
                      >
                        <option value="">{t("contact.selectSubject")}</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        {t("contact.labelMessage")} <span className="text-[#8B0000]">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={set("message")}
                        placeholder={t("contact.placeholderMessage")}
                        className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] bg-gray-50 focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#8B0000] text-white font-semibold text-sm hover:bg-[#7a0000] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {sending
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("contact.sending")}</>
                        : <><Send className="h-4 w-4" /> {t("contact.sendMessage")}</>
                      }
                    </button>

                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                      {t("contact.privacyNote")}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
