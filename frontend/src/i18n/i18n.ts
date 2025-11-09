import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar TODAS las traducciones desde src/i18n/locales/
import esNavigation from './locales/es/navigation.json';
import enNavigation from './locales/en/navigation.json';
import ptNavigation from './locales/pt/navigation.json';

// Importar todos los namespaces
import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json'; 
import ptCommon from './locales/pt/common.json';
import esLogin from './locales/es/login.json';
import enLogin from './locales/en/login.json';
import ptLogin from './locales/pt/login.json';
import esDashboard from './locales/es/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import ptDashboard from './locales/pt/dashboard.json';

// Definición de namespaces disponibles
export const availableNamespaces = ["common", "login", "dashboard", "navigation"] as const;
export type AvailableNamespaces = typeof availableNamespaces[number];

// Definición de idiomas disponibles
export const availableLanguages = ["es", "en", "pt"] as const;
export type AvailableLanguages = typeof availableLanguages[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        navigation: esNavigation,
        common: esCommon,
        login: esLogin,
        dashboard: esDashboard
      },
      en: {
        navigation: enNavigation,
        common: enCommon,
        login: enLogin,
        dashboard: enDashboard
      },
      pt: {
        navigation: ptNavigation,
        common: ptCommon,
        login: ptLogin,
        dashboard: ptDashboard
      },
    },
    fallbackLng: "es",
    supportedLngs: availableLanguages,
    ns: availableNamespaces,
    defaultNS: "login", // ← CAMBIADO de "common" a "login"
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    debug: true,
    interpolation: { escapeValue: false },
    react: {
      useSuspense: true,
    }
  });

// ======= Depuración y verificación =======
console.log("🌍 Idioma detectado inicialmente:", i18n.language);
console.log("🌐 Idioma del navegador:", navigator.language);

// Escucha cambios de idioma en tiempo real
i18n.on("languageChanged", (lng) => {
  console.log("🔄 Idioma cambiado a:", lng);
  console.log("🧭 Idioma actual de i18n:", i18n.language);
  console.log("💾 Idioma guardado en localStorage:", localStorage.getItem("i18nextLng"));
});

export default i18n;