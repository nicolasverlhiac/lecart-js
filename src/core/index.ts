import { setupEventListeners } from './events';
import { initStorage } from '../storage/local-storage';
import { initUI } from '../ui/cart-ui';
import { initTranslations } from '../i18n';
import { initCart } from './cart';

export interface EasyCartConfig {
  stripePublicKey: string;
  checkoutEndpoint: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'custom';
  language?: string;
  translations?: Record<string, any>;
  detectBrowserLanguage?: boolean;
  fallbackLanguage?: string;
  position?: 'right' | 'left';
  cartLifetime?: number; // en heures
}

const DEFAULT_CONFIG: Partial<EasyCartConfig> = {
  currency: 'EUR',
  theme: 'light',
  language: 'en',
  detectBrowserLanguage: true,
  fallbackLanguage: 'en',
  position: 'right',
  cartLifetime: 24 // 24 heures par défaut
};

let config: EasyCartConfig;
let isInitialized = false;

export function init(userConfig: Partial<EasyCartConfig>): void {
  if (isInitialized) {
    console.warn('EasyCart already initialized');
    return;
  }

  // Fusion des configurations
  config = { ...DEFAULT_CONFIG, ...userConfig } as EasyCartConfig;

  // Vérification des configurations requises
  if (!config.stripePublicKey) {
    throw new Error('EasyCart: stripePublicKey is required');
  }
  
  if (!config.checkoutEndpoint) {
    throw new Error('EasyCart: checkoutEndpoint is required');
  }

  // Initialisation des modules
  initTranslations(config);
  initStorage(config);
  initCart();
  initUI(config);
  setupEventListeners();

  isInitialized = true;
  console.log('EasyCart initialized successfully');
}

export function getConfig(): EasyCartConfig {
  if (!isInitialized) {
    throw new Error('EasyCart not initialized');
  }
  return config;
}