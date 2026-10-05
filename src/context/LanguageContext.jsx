import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "tp_lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  const setLanguage = useCallback((next) => {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors, language just won't persist
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === "en" ? "ta" : "en");
  }, [lang, setLanguage]);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLanguage, toggleLanguage, t }),
    [lang, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
