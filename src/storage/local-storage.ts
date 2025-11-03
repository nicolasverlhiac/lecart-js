import { LeCartConfig } from '../core';
import { CartItem } from '../core/cart';

const STORAGE_KEY = 'lecart-data';
let cartLifetime: number;

export function initStorage(config: LeCartConfig): void {
  cartLifetime = config.cartLifetime || 24; // Valeur par défaut: 24h
}

export function saveCart(items: CartItem[]): void {
  try {
    const cartData = {
      items,
      timestamp: Date.now(),
      expiry: Date.now() + (cartLifetime * 60 * 60 * 1000) // Conversion en ms
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('LeCart: Failed to save cart to localStorage', error);
  }
}

export function loadCart(): CartItem[] | null {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return null;
    
    const cartData = JSON.parse(storedData);
    
    // Vérifier l'expiration du panier
    if (cartData.expiry && cartData.expiry < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return cartData.items || null;
  } catch (error) {
    console.error('LeCart: Failed to load cart from localStorage', error);
    return null;
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}