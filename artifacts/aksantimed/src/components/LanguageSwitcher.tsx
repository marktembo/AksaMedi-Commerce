import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

interface LanguageSwitcherProps {
  variant?: "header" | "mobile";
}

export function LanguageSwitcher({ variant = "header" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const select = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-2 flex-wrap px-3 py-2">
        <Globe className="w-4 h-4 text-[#8B0000]" />
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => select(lang.code)}
            className={`text-sm px-2 py-0.5 rounded-md transition-colors ${
              i18n.language === lang.code
                ? "bg-[#8B0000] text-white font-semibold"
                : "text-gray-600 hover:text-[#8B0000] hover:bg-[#8B0000]/5"
            }`}
          >
            {lang.flag} {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-9 px-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#8B0000]/30 hover:text-[#8B0000] transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="font-medium">{current.flag} {current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                i18n.language === lang.code
                  ? "bg-[#8B0000] text-white font-semibold"
                  : "text-gray-700 hover:bg-[#8B0000]/5 hover:text-[#8B0000]"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
