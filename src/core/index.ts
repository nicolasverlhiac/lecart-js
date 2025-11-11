import { setupEventListeners } from './events';
import { initStorage } from '../storage/local-storage';
import { initUI } from '../ui/cart-ui';
import { initTranslations } from '../i18n';
import { initCart } from './cart';

export interface LeCartConfig {
  lecartApiKey: string;
  checkoutEndpoint: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'custom';
  language?: string;
  translations?: Record<string, any>;
  detectBrowserLanguage?: boolean;
  fallbackLanguage?: string;
  position?: 'right' | 'left';
  cartLifetime?: number; // en heures
  cssPath?: string; // Nouveau: chemin vers le fichier CSS
  showCartBadge?: boolean; // Afficher la bulle de quantité sur les boutons d'ouverture du panier
  openCartOnAdd?: boolean; // Ouvrir automatiquement le panier après l'ajout d'un produit
  collectShippingAddress?: boolean; // Collecter l'adresse de livraison lors du checkout
  shippingCountries?: string[]; // Pays autorisés pour la livraison (ISO 3166-1 alpha-2)
  collectPhoneNumber?: boolean; // Collecter le numéro de téléphone lors du checkout
  shippingOptions?: string[]; // IDs des Stripe Shipping Rates (ex: ['shr_xxxxx', 'shr_yyyyy'])
}

const DEFAULT_CONFIG: Partial<LeCartConfig> = {
  currency: 'EUR',
  theme: 'light',
  language: 'en',
  detectBrowserLanguage: true,
  fallbackLanguage: 'en',
  position: 'right',
  cartLifetime: 24, // 24 heures par défaut
  cssPath: 'https://unpkg.com/lecart/dist/lecart.css',
  showCartBadge: true, // Bulle de quantité activée par défaut
  openCartOnAdd: true, // Ouvrir le panier automatiquement après ajout
  collectShippingAddress: false, // Désactivé par défaut
  shippingCountries: ['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'IE', 'PT', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'AU', 'NZ', 'JP', 'SG', 'HK'], // Principaux pays
  collectPhoneNumber: false // Désactivé par défaut
};

let config: LeCartConfig;
let isInitialized = false;

export function init(userConfig: Partial<LeCartConfig>): void {
  if (isInitialized) {
    console.warn('LeCart already initialized');
    return;
  }

  // Fusion des configurations
  config = { ...DEFAULT_CONFIG, ...userConfig } as LeCartConfig;

  // Vérification des configurations requises
  if (!config.lecartApiKey) {
    throw new Error('LeCart: lecartApiKey is required');
  }

  if (!config.checkoutEndpoint) {
    throw new Error('LeCart: checkoutEndpoint is required');
  }

  // Initialisation des modules
  initTranslations(config);
  initStorage(config);
  initCart();
  initUI(config);
  setupEventListeners();

  isInitialized = true;
  console.log('LeCart initialized successfully');
}

export function getConfig(): LeCartConfig {
  if (!isInitialized) {
    throw new Error('LeCart not initialized');
  }
  return config;
}