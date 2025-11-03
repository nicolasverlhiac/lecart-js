import { addItem } from './cart';
import { openCart } from '../ui/cart-ui';

export function setupEventListeners(): void {
  // Écouter les clics sur les boutons d'ajout au panier
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Trouver l'élément parent avec data-lecart-add (pour gérer les clics sur les enfants d'un bouton)
    const addButton = target.closest('[data-lecart-add]');
    
    if (addButton) {
      event.preventDefault();
      
      // Extraire les données du produit depuis les attributs data-*
      const stripePriceId = addButton.getAttribute('data-stripe-price-id');
      const name = addButton.getAttribute('data-product-name');
      const priceAttr = addButton.getAttribute('data-product-price');
      const image = addButton.getAttribute('data-product-image') || undefined;
      
      // Vérifier les données requises
      if (!stripePriceId || !name || !priceAttr) {
        console.error('LeCart: Missing required product attributes');
        return;
      }
      
      // Convertir le prix en nombre
      const price = parseFloat(priceAttr);
      
      // Ajouter l'article au panier
      addItem({
        stripePriceId,
        name,
        price,
        image
      });
      
      // Notification visuelle (optionnel)
      showAddedToCartFeedback(addButton);
    }
    
    // Gérer les boutons d'ouverture du panier
    const openCartButton = target.closest('[data-lecart-open]');
    if (openCartButton) {
      event.preventDefault();
      openCart();
    }
  });
}

// Feedback visuel lors de l'ajout au panier
function showAddedToCartFeedback(button: Element): void {
  // Animation simple ou notification
  const originalText = button.textContent;
  button.textContent = '✓ Added';
  
  // Retour au texte original après 1 seconde
  setTimeout(() => {
    button.textContent = originalText;
  }, 1000);
}