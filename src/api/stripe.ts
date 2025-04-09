import { getConfig } from '../core';
import { clearCart } from '../core/cart';
import { t } from '../i18n';

interface CheckoutItem {
  stripePriceId: string;
  quantity: number;
}

interface CheckoutData {
  items: CheckoutItem[];
}

export async function createCheckoutSession(data: CheckoutData): Promise<void> {
  const config = getConfig();
  const { stripePublicKey, checkoutEndpoint } = config;
  
  try {
    // Afficher l'overlay de chargement
    showLoadingOverlay();
    
    // Préparer l'URL de retour avec token pour vider le panier
    const cartId = generateCartId();
    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set('payment_success', 'true');
    successUrl.searchParams.set('cart_id', cartId);
    
    // Appel à l'API de checkout
    const response = await fetch(checkoutEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: data.items,
        success_url: successUrl.toString(),
        cancel_url: window.location.href,
        metadata: { cart_id: cartId }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const session = await response.json();
    
    // Redirection vers Stripe Checkout
    window.location.href = session.url;
    
  } catch (error) {
    console.error('EasyCart: Failed to create checkout session', error);
    hideLoadingOverlay();
    showError(t('checkout.error'));
  }
}

// Vérifier le succès du paiement et vider le panier si nécessaire
export function checkPaymentSuccess(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment_success');
  
  if (paymentSuccess === 'true') {
    // Vider le panier
    clearCart();
    
    // Afficher message de succès
    showSuccessMessage(t('checkout.success'));
    
    // Nettoyer l'URL
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_success');
    url.searchParams.delete('cart_id');
    window.history.replaceState({}, document.title, url.toString());
  }
}

// Génère un ID unique pour le panier
function generateCartId(): string {
  return 'cart_' + Math.random().toString(36).substring(2, 15);
}

// Fonctions d'affichage UI (loading, success, error)
function showLoadingOverlay(): void {
  const overlay = document.createElement('div');
  overlay.className = 'easycart-loading-overlay';
  overlay.innerHTML = `
    <div class="easycart-loading-spinner"></div>
    <div class="easycart-loading-text">${t('checkout.processing')}</div>
  `;
  
  // Styles pour l'overlay
  applyOverlayStyles(overlay);
  
  document.body.appendChild(overlay);
}

function hideLoadingOverlay(): void {
  const overlay = document.querySelector('.easycart-loading-overlay');
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
}

function showSuccessMessage(message: string): void {
  // Code pour afficher un message de succès
  // ...
}

function showError(message: string): void {
  // Code pour afficher un message d'erreur
  // ...
}

function applyOverlayStyles(overlay: HTMLElement): void {
  // Styles pour l'overlay et le spinner
  // ...
}