import i18n from "i18next";
import { initReactI18next } from "../node_modules/react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector/cjs";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    ns: ["app", "login", "onboarding", "read", "translate", "tags"],
    defaultNS: "app",
    backend: {
      loadPath: "/locales/{{ns}}-{{lng}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
