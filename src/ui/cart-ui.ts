import { LeCartConfig } from '../core';
import { CartItem, getItems, getCartTotal, updateItemQuantity, removeItem } from '../core/cart';
import { t } from '../i18n';
import { createCheckoutSession } from '../api/stripe';

let cartElement: HTMLElement | null = null;
let isInitialized = false;
let isOpen = false;
let config: LeCartConfig;

export function initUI(configObj: LeCartConfig): void {
  config = configObj;

  loadStylesheet();

  createCartElements();
  isInitialized = true;
}

function loadStylesheet(): void {
  if (document.getElementById('lecart-stylesheet')) return;

  const link = document.createElement('link');
  link.id = 'lecart-stylesheet';
  link.rel = 'stylesheet';
  link.href = config.cssPath || 'https://unpkg.com/lecart/dist/lecart.css';

  document.head.appendChild(link);
}

export function openCart(): void {
  if (!isInitialized || !cartElement) return;

  cartElement.classList.add('lecart-open');
  isOpen = true;

  updateCartDisplay();
}

export function closeCart(): void {
  if (!isInitialized || !cartElement) return;

  cartElement.classList.remove('lecart-open');
  isOpen = false;
}

export function updateCartDisplay(): void {
  if (!cartElement) return;

  const items = getItems();
  const cartItemsContainer = cartElement.querySelector('.lecart-items');
  if (!cartItemsContainer) return;

  // Vider le conteneur
  cartItemsContainer.innerHTML = '';

  // Gérer le footer (cacher si vide, afficher si items)
  const footerElement = cartElement.querySelector('.lecart-footer') as HTMLElement;

  if (items.length === 0) {
    cartItemsContainer.innerHTML = `<div class="lecart-empty">${t('cart.empty')}</div>`;
    if (footerElement) {
      footerElement.style.display = 'none';
    }
    return;
  }

  // Afficher le footer et mettre à jour le sous-total
  if (footerElement) {
    footerElement.style.display = 'block';
  }

  const subtotalElement = cartElement.querySelector('.lecart-subtotal-value');
  if (subtotalElement) {
    subtotalElement.textContent = formatCurrency(getCartTotal(), config.currency || 'EUR');
  }

  // Ajouter chaque article au panier
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'lecart-item';
    itemElement.dataset.itemId = item.stripePriceId;

    itemElement.innerHTML = `
      <div class="lecart-item-image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
      </div>
      <div class="lecart-item-details">
        <div class="lecart-item-name">${item.name}</div>
        ${item.variant ? `<div class="lecart-item-variant">${item.variant}</div>` : ''}
        <div class="lecart-item-price">${formatCurrency(item.price, config.currency || 'EUR')}</div>
        <div class="lecart-item-quantity">
          <button class="lecart-quantity-dec">-</button>
          <input type="number" min="1" value="${item.quantity}" class="lecart-quantity-input">
          <button class="lecart-quantity-inc">+</button>
        </div>
      </div>
      <button class="lecart-item-remove">&times;</button>
    `;

    cartItemsContainer.appendChild(itemElement);

    // Gestion des événements quantité et suppression
    setupItemEvents(itemElement, item);
  });
}

function setupItemEvents(itemElement: HTMLElement, item: CartItem): void {
  const quantityInput = itemElement.querySelector('.lecart-quantity-input') as HTMLInputElement;
  const decrementBtn = itemElement.querySelector('.lecart-quantity-dec') as HTMLButtonElement;
  const incrementBtn = itemElement.querySelector('.lecart-quantity-inc') as HTMLButtonElement;
  const removeBtn = itemElement.querySelector('.lecart-item-remove') as HTMLButtonElement;
  
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
  cartElement.className = `lecart-container lecart-theme-${config.theme} lecart-position-${config.position}`;
  
  cartElement.innerHTML = `
    <div class="lecart-backdrop"></div>
    <div class="lecart-panel">
      <div class="lecart-header">
        <h2>${t('cart.title')}</h2>
        <button class="lecart-close">&times;</button>
      </div>
      <div class="lecart-items"></div>
      <div class="lecart-footer">
        <div class="lecart-subtotal">
          <span class="lecart-subtotal-label">${t('cart.subtotal')}</span>
          <span class="lecart-subtotal-value">0</span>
        </div>
        <button class="lecart-checkout-btn">${t('cart.checkout')}</button>
      </div>
    </div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(cartElement);
  
  // Setup des événements
  const closeBtn = cartElement.querySelector('.lecart-close');
  const backdrop = cartElement.querySelector('.lecart-backdrop');
  const checkoutBtn = cartElement.querySelector('.lecart-checkout-btn');
  
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (backdrop) backdrop.addEventListener('click', closeCart);
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', initiateCheckout);
  }
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