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
  const { lecartApiKey, checkoutEndpoint } = config;

  try {
    // Afficher l'overlay de chargement
    showLoadingOverlay();

    // Préparer l'URL de retour avec token pour vider le panier
    const cartId = generateCartId();
    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set('payment_success', 'true');
    successUrl.searchParams.set('cart_id', cartId);

    // Préparer le body de la requête
    const requestBody: any = {
      items: data.items,
      success_url: successUrl.toString(),
      cancel_url: window.location.href,
      metadata: { cart_id: cartId }
    };

    // Ajouter la collecte d'adresse si activée
    if (config.collectShippingAddress) {
      requestBody.shipping_address_collection = {
        allowed_countries: config.shippingCountries || ['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'IE', 'PT', 'DK', 'SE', 'NO', 'FI', 'PL', 'CZ', 'AU', 'NZ', 'JP', 'SG', 'HK']
      };
    }

    // Ajouter la collecte de téléphone si activée
    if (config.collectPhoneNumber) {
      requestBody.phone_number_collection = {
        enabled: true
      };
    }

    // Ajouter les options de livraison si spécifiées
    if (config.shippingOptions && config.shippingOptions.length > 0) {
      requestBody.shipping_options = config.shippingOptions.map(rateId => ({
        shipping_rate: rateId
      }));
    }

    // Appel à l'API de checkout
    const response = await fetch(checkoutEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': lecartApiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const session = await response.json();
    
    // Redirection vers Stripe Checkout
    window.location.href = session.url;
    
  } catch (error) {
    console.error('LeCart: Failed to create checkout session', error);
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
  overlay.className = 'lecart-loading-overlay';
  overlay.innerHTML = `
    <div class="lecart-loading-spinner"></div>
    <div class="lecart-loading-text">${t('checkout.processing')}</div>
  `;
  
  // Appliquer des styles spécifiques au thème si nécessaire
  const config = getConfig();
  if (config.theme === 'dark') {
    overlay.classList.add('lecart-theme-dark');
  }
  
  document.body.appendChild(overlay);
}

function hideLoadingOverlay(): void {
  const overlay = document.querySelector('.lecart-loading-overlay');
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
}

function showSuccessMessage(message: string): void {
  // Création de l'élément de notification avec classes CSS
  const notification = document.createElement('div');
  notification.className = 'lecart-notification lecart-notification-success';
  notification.innerHTML = `
    <div class="lecart-notification-icon">✓</div>
    <div class="lecart-notification-message">${message}</div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Animation d'entrée (via setTimeout pour permettre au navigateur de traiter le DOM)
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Supprimer après 5 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    // Retirer du DOM après la fin de l'animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

function showError(message: string): void {
  // Création de l'élément de notification d'erreur avec classes CSS
  const notification = document.createElement('div');
  notification.className = 'lecart-notification lecart-notification-error';
  notification.innerHTML = `
    <div class="lecart-notification-icon">✕</div>
    <div class="lecart-notification-message">${message}</div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Ajouter un bouton de fermeture
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'lecart-notification-close';
  closeButton.onclick = () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };
  
  notification.appendChild(closeButton);
  
  // Supprimer après 8 secondes
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 8000);
}