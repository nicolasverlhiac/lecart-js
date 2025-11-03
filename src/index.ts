import { init, getConfig } from './core';
import { openCart, closeCart } from './ui/cart-ui';
import { clearCart } from './core/cart';
import { setLanguage } from './i18n';
import { checkPaymentSuccess } from './api/stripe';

// API publique exposée
const LeCart = {
  init,
  openCart,
  closeCart,
  clearCart,
  setLanguage,
  checkPaymentSuccess,
  getConfig
};

// Auto-initialisation si data-lecart-autoinit est présent
document.addEventListener('DOMContentLoaded', () => {
  const autoInitEl = document.querySelector('[data-lecart-autoinit]');
  if (autoInitEl) {
    const config = JSON.parse(autoInitEl.getAttribute('data-lecart-config') || '{}');
    LeCart.init(config);
  }
});

// Exposition globale
(window as any).LeCart = LeCart;

export default LeCart;