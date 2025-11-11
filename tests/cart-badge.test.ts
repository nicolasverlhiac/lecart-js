// File: tests/cart-badge.test.ts

import { initCart, addItem, removeItem, clearCart, getCartCount } from '../src/core/cart';
import { initUI, updateCartBadges } from '../src/ui/cart-ui';
import { LeCartConfig } from '../src/core';

// Mock pour le stockage local
jest.mock('../src/storage/local-storage', () => ({
  saveCart: jest.fn(),
  loadCart: jest.fn(() => []),
  initStorage: jest.fn(),
}));

// Mock pour l'i18n
jest.mock('../src/i18n', () => ({
  t: jest.fn((key: string) => key),
  initTranslations: jest.fn(),
}));

// Mock pour l'API Stripe
jest.mock('../src/api/stripe', () => ({
  createCheckoutSession: jest.fn(),
  checkPaymentSuccess: jest.fn(),
}));

describe('Cart Badge functionality', () => {
  let mockButton: HTMLButtonElement;
  let config: LeCartConfig;

  beforeEach(() => {
    // Réinitialiser le DOM
    document.body.innerHTML = '';

    // Créer un bouton de test avec l'attribut data-lecart-open
    mockButton = document.createElement('button');
    mockButton.setAttribute('data-lecart-open', '');
    mockButton.textContent = 'View Cart';
    document.body.appendChild(mockButton);

    // Configuration de test avec badge activé
    config = {
      lecartApiKey: 'test_key',
      checkoutEndpoint: 'https://test.com/checkout',
      showCartBadge: true,
      theme: 'light',
      position: 'right',
    };

    // Réinitialiser le panier
    initCart();
    clearCart();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('updateCartBadges function', () => {
    test('should create badge when cart has items', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge).not.toBeNull();
      expect(badge?.textContent).toBe('1');
    });

    test('should update badge count when items are added', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      }, 3);

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('3');
    });

    test('should update badge count with multiple items', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      }, 2);
      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 15.00,
      }, 3);

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('5'); // 2 + 3
    });

    test('should remove badge when cart is empty', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });
      updateCartBadges();

      // Act - Vider le panier
      clearCart();
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge).toBeNull();
    });

    test('should update badge when cart count changes', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      }, 2);
      updateCartBadges();

      // Act - Ajouter plus d'items
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      }, 1);
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('3');
    });

    test('should not create badge when showCartBadge is false', () => {
      // Arrange
      const configWithoutBadge = {
        ...config,
        showCartBadge: false,
      };
      initUI(configWithoutBadge);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge).toBeNull();
    });

    test('should update all cart open buttons with badges', () => {
      // Arrange
      const button2 = document.createElement('button');
      button2.setAttribute('data-lecart-open', '');
      button2.textContent = 'Cart';
      document.body.appendChild(button2);

      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      }, 2);

      // Act
      updateCartBadges();

      // Assert
      const badge1 = mockButton.querySelector('.lecart-badge');
      const badge2 = button2.querySelector('.lecart-badge');

      expect(badge1).not.toBeNull();
      expect(badge2).not.toBeNull();
      expect(badge1?.textContent).toBe('2');
      expect(badge2?.textContent).toBe('2');
    });

    test('should handle removing items and updating badge', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      }, 3);
      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 15.00,
      }, 2);
      updateCartBadges();

      // Act - Supprimer un item
      removeItem('price_456');
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('3');
    });

    test('should reuse existing badge element when updating', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });
      updateCartBadges();
      const firstBadge = mockButton.querySelector('.lecart-badge');

      // Act - Ajouter plus d'items
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });
      updateCartBadges();
      const secondBadge = mockButton.querySelector('.lecart-badge');

      // Assert - Should be the same element, just updated
      expect(firstBadge).toBe(secondBadge);
      expect(secondBadge?.textContent).toBe('2');
    });

    test('should display correct count for items with different quantities', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      }, 1);
      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 15.00,
      }, 5);
      addItem({
        stripePriceId: 'price_789',
        name: 'Product C',
        price: 20.00,
      }, 3);

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('9'); // 1 + 5 + 3
    });
  });

  describe('Badge CSS classes', () => {
    test('should add lecart-badge class to badge element', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.classList.contains('lecart-badge')).toBe(true);
    });

    test('should ensure parent button has position relative', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      updateCartBadges();

      // Assert
      // Le CSS devrait appliquer position: relative via [data-lecart-open]
      expect(mockButton.hasAttribute('data-lecart-open')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle cart with zero items', () => {
      // Arrange
      initUI(config);

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge).toBeNull();
      expect(getCartCount()).toBe(0);
    });

    test('should handle very large quantities', () => {
      // Arrange
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      }, 999);

      // Act
      updateCartBadges();

      // Assert
      const badge = mockButton.querySelector('.lecart-badge');
      expect(badge?.textContent).toBe('999');
    });

    test('should not crash if no cart open buttons exist', () => {
      // Arrange
      document.body.innerHTML = ''; // Remove all buttons
      initUI(config);
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act & Assert - Should not throw
      expect(() => updateCartBadges()).not.toThrow();
    });
  });
});
