import enTranslations from './en';
import frTranslations from './fr';
import { LeCartConfig } from '../core';

type TranslationPath = string;
type TranslationParams = Record<string, any>;

// Traductions par défaut
const defaultTranslations: Record<string, any> = {
  en: enTranslations,
  fr: frTranslations,
};

let currentLanguage: string = 'en';
let translations: any = { ...defaultTranslations.en };
let customTranslations: Record<string, any> = {};

// Initialisation des traductions
export function initTranslations(config: LeCartConfig): void {
  customTranslations = config.translations || {};
  
  let initialLanguage = config.language || 'en';
  
  if (config.detectBrowserLanguage) {
    const browserLang = navigator.language.split('-')[0];
    if (hasLanguage(browserLang)) {
      initialLanguage = browserLang;
    } else if (config.fallbackLanguage) {
      initialLanguage = config.fallbackLanguage;
    }
  }
  
  setLanguage(initialLanguage);
}

// Vérification de la disponibilité d'une langue
function hasLanguage(lang: string): boolean {
  return lang in defaultTranslations || lang in customTranslations;
}

// Changement de langue
export function setLanguage(lang: string): void {
  if (!hasLanguage(lang)) {
    console.warn(`LeCart: Language "${lang}" not available, falling back to English`);
    lang = 'en';
  }
  
  currentLanguage = lang;
  
  // Fusion des traductions par défaut avec les personnalisations
  translations = {
    ...(defaultTranslations[lang] || {}),
    ...(customTranslations[lang] || {})
  };
}

// Obtention d'une traduction
export function t(path: TranslationPath, params?: TranslationParams): string {
  const keys = path.split('.');
  let value: any = translations;
  
  // Navigation dans l'arborescence des clés
  for (const key of keys) {
    if (value === undefined || value === null) break;
    value = value[key];
  }
  
  // Fallback vers l'anglais si nécessaire
  if (typeof value !== 'string' && currentLanguage !== 'en') {
    value = getFromDefault(path);
  }
  
  if (typeof value !== 'string') {
    console.warn(`LeCart: Missing translation for "${path}"`);
    return path;
  }
  
  // Remplacement des paramètres
  if (params) {
    return Object.entries(params).reduce((str, [key, val]) => {
      return str.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
    }, value);
  }
  
  return value;
}

// Récupération depuis la langue par défaut
function getFromDefault(path: TranslationPath): string | undefined {
  const keys = path.split('.');
  let value: any = defaultTranslations.en;
  
  for (const key of keys) {
    if (value === undefined || value === null) break;
    value = value[key];
  }
  
  return typeof value === 'string' ? value : undefined;
}