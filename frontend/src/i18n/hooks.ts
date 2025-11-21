import { useTranslation } from 'react-i18next';
import type { AvailableNamespaces } from './i18n';
import type { TranslationKey } from './types';

export const useAppTranslation = (ns?: AvailableNamespaces | AvailableNamespaces[]) => {
  return useTranslation(ns);
};

// Exporta el tipo para su uso en componentes
export type { TranslationKey };
