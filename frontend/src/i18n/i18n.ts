import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importar TODAS las traducciones desde src/i18n/locales/
import esNavigation from './locales/es/navigation.json';
import enNavigation from './locales/en/navigation.json';
import ptNavigation from './locales/pt/navigation.json';

// Importar todos los namespaces
import esProductosServicios from './locales/es/productos_servicios.json';
import enProductosServicios from './locales/en/productos_servicios.json';
import ptProductosServicios from './locales/pt/productos_servicios.json';
import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json'; 
import ptCommon from './locales/pt/common.json';
import esLogin from './locales/es/login.json';
import enLogin from './locales/en/login.json';
import ptLogin from './locales/pt/login.json';
import esDashboard from './locales/es/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import ptDashboard from './locales/pt/dashboard.json';
import esClientes from './locales/es/clientes.json';
import enClientes from './locales/en/clientes.json';
import ptClientes from './locales/pt/clientes.json';
import esPedidosServicio from './locales/es/pedidos-servicio.json';
import enPedidosServicio from './locales/en/pedidos-servicio.json';
import ptPedidosServicio from './locales/pt/pedidos-servicio.json';
import esInstaladores from './locales/es/instaladores.json';
import enInstaladores from './locales/en/instaladores.json';
import ptInstaladores from './locales/pt/instaladores.json';
import esCotizaciones from './locales/es/cotizaciones.json';
import enCotizaciones from './locales/en/cotizaciones.json';
import ptCotizaciones from './locales/pt/cotizaciones.json';

// Definición de namespaces disponibles
export const availableNamespaces = ["common", "login", "dashboard", "navigation", "clientes", "pedidos_servicio", "instaladores", "productos_servicios", "cotizaciones"] as const;
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
        dashboard: esDashboard,
        clientes: esClientes,
        pedidos_servicio: esPedidosServicio,
        instaladores: esInstaladores,
        productos_servicios: esProductosServicios,
        cotizaciones: esCotizaciones
      },
      en: {
        navigation: enNavigation,
        common: enCommon,
        login: enLogin,
        dashboard: enDashboard,
        clientes: enClientes,
        pedidos_servicio: enPedidosServicio,
        instaladores: enInstaladores,
        productos_servicios: enProductosServicios,
        cotizaciones: enCotizaciones
      },
      pt: {
        navigation: ptNavigation,
        common: ptCommon,
        login: ptLogin,
        dashboard: ptDashboard,
        clientes: ptClientes,
        pedidos_servicio: ptPedidosServicio,
        instaladores: ptInstaladores,
        productos_servicios: ptProductosServicios,
        cotizaciones: ptCotizaciones
      }
    },
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