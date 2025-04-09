import { EasyCartConfig } from '../core';
import { CartItem, getItems, getCartTotal, updateItemQuantity, removeItem } from '../core/cart';
import { t } from '../i18n';
import { createCheckoutSession } from '../api/stripe'; // Ajout de l'import statique

let cartElement: HTMLElement | null = null;
let isInitialized = false;
let isOpen = false;
let config: EasyCartConfig;

export function initUI(configObj: EasyCartConfig): void {
  config = configObj;
  createCartElements();
  isInitialized = true;
}

export function openCart(): void {
  if (!isInitialized || !cartElement) return;
  
  cartElement.classList.add('easycart-open');
  isOpen = true;
  
  // Mise à jour du contenu avant ouverture
  updateCartDisplay();
}

export function closeCart(): void {
  if (!isInitialized || !cartElement) return;
  
  cartElement.classList.remove('easycart-open');
  isOpen = false;
}

export function updateCartDisplay(): void {
  if (!cartElement) return;
  
  const items = getItems();
  const cartItemsContainer = cartElement.querySelector('.easycart-items');
  if (!cartItemsContainer) return;
  
  // Vider le conteneur
  cartItemsContainer.innerHTML = '';
  
  if (items.length === 0) {
    cartItemsContainer.innerHTML = `<div class="easycart-empty">${t('cart.empty')}</div>`;
    return;
  }
  
  // Ajouter chaque article au panier
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'easycart-item';
    itemElement.dataset.itemId = item.stripePriceId;
    
    itemElement.innerHTML = `
      <div class="easycart-item-image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
      </div>
      <div class="easycart-item-details">
        <div class="easycart-item-name">${item.name}</div>
        <div class="easycart-item-price">${formatCurrency(item.price, config.currency || 'EUR')}</div>
        <div class="easycart-item-quantity">
          <button class="easycart-quantity-dec">-</button>
          <input type="number" min="1" value="${item.quantity}" class="easycart-quantity-input">
          <button class="easycart-quantity-inc">+</button>
        </div>
      </div>
      <button class="easycart-item-remove">&times;</button>
    `;
    
    cartItemsContainer.appendChild(itemElement);
    
    // Gestion des événements quantité et suppression
    setupItemEvents(itemElement, item);
  });
  
  // Mettre à jour le sous-total
  const subtotalElement = cartElement.querySelector('.easycart-subtotal-value');
  if (subtotalElement) {
    subtotalElement.textContent = formatCurrency(getCartTotal(), config.currency || 'EUR');
  }
}

function setupItemEvents(itemElement: HTMLElement, item: CartItem): void {
  const quantityInput = itemElement.querySelector('.easycart-quantity-input') as HTMLInputElement;
  const decrementBtn = itemElement.querySelector('.easycart-quantity-dec') as HTMLButtonElement;
  const incrementBtn = itemElement.querySelector('.easycart-quantity-inc') as HTMLButtonElement;
  const removeBtn = itemElement.querySelector('.easycart-item-remove') as HTMLButtonElement;
  
  if (quantityInput) {
    quantityInput.addEventListener('change', () => {
      const newQuantity = parseInt(quantityInput.value, 10) || 1;
      updateItemQuantity(item.stripePriceId, newQuantity);
      updateCartDisplay();
    });
  }
  
  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      const newQuantity = Math.max(1, (item.quantity - 1));
      updateItemQuantity(item.stripePriceId, newQuantity);
      updateCartDisplay();
    });
  }
  
  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      updateItemQuantity(item.stripePriceId, item.quantity + 1);
      updateCartDisplay();
    });
  }
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeItem(item.stripePriceId);
      updateCartDisplay();
    });
  }
}

function createCartElements(): void {
  // Création des éléments du panier
  cartElement = document.createElement('div');
  cartElement.className = `easycart-container easycart-theme-${config.theme} easycart-position-${config.position}`;
  
  cartElement.innerHTML = `
    <div class="easycart-backdrop"></div>
    <div class="easycart-panel">
      <div class="easycart-header">
        <h2>${t('cart.title')}</h2>
        <button class="easycart-close">&times;</button>
      </div>
      <div class="easycart-items"></div>
      <div class="easycart-footer">
        <div class="easycart-subtotal">
          <span class="easycart-subtotal-label">${t('cart.subtotal')}</span>
          <span class="easycart-subtotal-value">0</span>
        </div>
        <button class="easycart-checkout-btn">${t('cart.checkout')}</button>
      </div>
    </div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(cartElement);
  
  // Setup des événements
  const closeBtn = cartElement.querySelector('.easycart-close');
  const backdrop = cartElement.querySelector('.easycart-backdrop');
  const checkoutBtn = cartElement.querySelector('.easycart-checkout-btn');
  
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', initiateCheckout);
  }
  
  // Ajout des styles CSS
  addCartStyles();
}

// Dans la fonction addCartStyles() de src/ui/cart-ui.ts

function addCartStyles(): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .easycart-container {
      --easycart-primary-color: #4a4a4a;
      --easycart-secondary-color: #f5f5f5;
      --easycart-accent-color: #3490dc;
      --easycart-text-color: #333333;
      --easycart-border-color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .easycart-theme-dark {
      --easycart-primary-color: #2d2d2d;
      --easycart-secondary-color: #3a3a3a;
      --easycart-accent-color: #4dabf7;
      --easycart-text-color: #f5f5f5;
      --easycart-border-color: #4d4d4d;
    }
    
    .easycart-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    
    .easycart-panel {
      position: fixed;
      top: 0;
      width: 350px;
      max-width: 90vw;
      height: 100vh;
      background-color: var(--easycart-secondary-color);
      color: var(--easycart-text-color);
      z-index: 9999;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
    }
    
    .easycart-position-right .easycart-panel {
      right: 0;
      transform: translateX(100%);
    }
    
    .easycart-position-left .easycart-panel {
      left: 0;
      transform: translateX(-100%);
    }
    
    .easycart-open .easycart-backdrop {
      opacity: 1;
      visibility: visible;
    }
    
    .easycart-open .easycart-panel {
      transform: translateX(0);
    }

    /* Header styles */
    .easycart-header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--easycart-border-color);
    }
    
    .easycart-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .easycart-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--easycart-text-color);
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    
    .easycart-close:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    /* Items container */
    .easycart-items {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }
    
    .easycart-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #888;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    
    /* Individual item */
    .easycart-item {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid var(--easycart-border-color);
      position: relative;
    }
    
    .easycart-item-image {
      width: 60px;
      height: 60px;
      margin-right: 15px;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .easycart-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .easycart-item-details {
      flex: 1;
    }
    
    .easycart-item-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .easycart-item-price {
      color: var(--easycart-accent-color);
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .easycart-item-quantity {
      display: flex;
      align-items: center;
    }
    
    .easycart-quantity-dec,
    .easycart-quantity-inc {
      width: 28px;
      height: 28px;
      background-color: #f0f0f0;
      border: none;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    
    .easycart-theme-dark .easycart-quantity-dec,
    .easycart-theme-dark .easycart-quantity-inc {
      background-color: #555;
    }
    
    .easycart-quantity-input {
      width: 40px;
      text-align: center;
      border: 1px solid var(--easycart-border-color);
      border-radius: 4px;
      margin: 0 5px;
      padding: 4px;
    }
    
    .easycart-item-remove {
      position: absolute;
      top: 10px;
      right: 0;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #999;
      transition: color 0.2s;
    }
    
    .easycart-item-remove:hover {
      color: #ff5252;
    }
    
    /* Footer */
    .easycart-footer {
      padding: 15px;
      border-top: 1px solid var(--easycart-border-color);
    }
    
    .easycart-subtotal {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-weight: 500;
    }
    
    .easycart-checkout-btn {
      display: block;
      width: 100%;
      padding: 12px;
      background-color: var(--easycart-accent-color);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .easycart-checkout-btn:hover {
      background-color: #2779bd;
    }
    
    /* Loading overlay */
    .easycart-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .easycart-theme-dark .easycart-loading-overlay {
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    .easycart-loading-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border-left-color: var(--easycart-accent-color);
      animation: easycart-spin 1s linear infinite;
    }
    
    @keyframes easycart-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .easycart-loading-text {
      margin-top: 15px;
      font-weight: 500;
    }
    
    /* Mobile optimization */
    @media (max-width: 480px) {
      .easycart-panel {
        width: 100%;
        max-width: 100%;
      }
    }
  `;
  
  document.head.appendChild(styleElement);
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(amount);
}

function initiateCheckout(): void {
  const items = getItems();
  if (items.length === 0) return;
  
  createCheckoutSession({
    items: items.map(item => ({
      stripePriceId: item.stripePriceId,
      quantity: item.quantity
    }))
  });
}