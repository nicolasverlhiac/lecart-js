import { saveCart, loadCart } from '../storage/local-storage';

export interface CartItem {
  stripePriceId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

let items: CartItem[] = [];

// Initialisation du panier depuis le stockage
export function initCart(): void {
  items = loadCart() || [];
}

// Ajout d'un article
export function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
  const existingItemIndex = items.findIndex(i => i.stripePriceId === item.stripePriceId);
  
  if (existingItemIndex >= 0) {
    // Mise à jour de la quantité si l'article existe déjà
    items[existingItemIndex].quantity += quantity;
  } else {
    // Ajout d'un nouvel article
    items.push({ ...item, quantity });
  }
  
  saveCart(items);
}

// Suppression d'un article
export function removeItem(stripePriceId: string): void {
  items = items.filter(item => item.stripePriceId !== stripePriceId);
  saveCart(items);
}

// Mise à jour de la quantité
export function updateItemQuantity(stripePriceId: string, quantity: number): void {
  const itemIndex = items.findIndex(item => item.stripePriceId === stripePriceId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
    }
    saveCart(items);
  }
}

// Vider le panier
export function clearCart(): void {
  items = [];
  saveCart(items);
}

// Obtenir tous les articles
export function getItems(): CartItem[] {
  return [...items]; // Retourne une copie pour éviter les mutations directes
}

// Calculer le total
export function getCartTotal(): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculer le nombre d'articles
export function getCartCount(): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}