import { init, getConfig } from './core';
import { openCart, closeCart } from './ui/cart-ui';
import { clearCart } from './core/cart';
import { setLanguage } from './i18n';
import { checkPaymentSuccess } from './api/stripe'; // Ajout de l'import

// API publique exposée
const EasyCart = {
  init,
  openCart,
  closeCart,
  clearCart,
  setLanguage,
  checkPaymentSuccess
};

// Auto-initialisation si data-easycart-autoinit est présent
document.addEventListener('DOMContentLoaded', () => {
  const autoInitEl = document.querySelector('[data-easycart-autoinit]');
  if (autoInitEl) {
    const config = JSON.parse(autoInitEl.getAttribute('data-easycart-config') || '{}');
    EasyCart.init(config);
  }
});

// Exposition globale
(window as any).EasyCart = EasyCart;

export default EasyCart;