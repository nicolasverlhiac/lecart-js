// File: tests/cart.test.ts

import { initCart, addItem, removeItem, getItems, clearCart, getCartTotal, updateItemQuantity, getCartCount } from '../src/core/cart';

// Mock pour le stockage local
jest.mock('../src/storage/local-storage', () => ({
  saveCart: jest.fn(),
  loadCart: jest.fn(() => []),
}));

describe('Cart functionality', () => {
  beforeEach(() => {
    // Réinitialiser le panier avant chaque test
    initCart();
    clearCart();
  });

  describe('Adding items', () => {
    test('should add items to cart', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };

      // Act
      addItem(item);
      const items = getItems();

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].stripePriceId).toBe('price_123');
      expect(items[0].quantity).toBe(1);
    });

    test('should update quantity when adding same item', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };

      // Act
      addItem(item);
      addItem(item);
      const items = getItems();

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(2);
    });

    test('should add item with custom quantity', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };

      // Act
      addItem(item, 5);
      const items = getItems();

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(5);
    });
  });

  describe('Removing items', () => {
    test('should remove items from cart', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };
      addItem(item);

      // Act
      removeItem('price_123');
      const items = getItems();

      // Assert
      expect(items.length).toBe(0);
    });

    test('should not affect cart when removing non-existent item', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      removeItem('price_nonexistent');
      const items = getItems();

      // Assert
      expect(items.length).toBe(1);
    });
  });

  describe('Updating item quantity', () => {
    test('should update item quantity', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };
      addItem(item);

      // Act
      updateItemQuantity('price_123', 5);
      const items = getItems();

      // Assert
      expect(items[0].quantity).toBe(5);
    });

    test('should remove item when quantity set to 0', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };
      addItem(item);

      // Act
      updateItemQuantity('price_123', 0);
      const items = getItems();

      // Assert
      expect(items.length).toBe(0);
    });

    test('should remove item when quantity is negative', () => {
      // Arrange
      const item = {
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      };
      addItem(item);

      // Act
      updateItemQuantity('price_123', -1);
      const items = getItems();

      // Assert
      expect(items.length).toBe(0);
    });

    test('should not affect cart when updating non-existent item', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Test Product',
        price: 19.99,
      });

      // Act
      updateItemQuantity('price_nonexistent', 10);
      const items = getItems();

      // Assert
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(1);
    });
  });

  describe('Cart calculations', () => {
    test('should calculate correct cart total', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      });

      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 15.50,
      });

      // Act
      const total = getCartTotal();

      // Assert
      expect(total).toBeCloseTo(25.50, 2);
    });

    test('should return 0 for empty cart total', () => {
      // Act
      const total = getCartTotal();

      // Assert
      expect(total).toBe(0);
    });

    test('should calculate total with multiple quantities', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      }, 3);

      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 5.50,
      }, 2);

      // Act
      const total = getCartTotal();

      // Assert
      expect(total).toBeCloseTo(41.00, 2); // (10 * 3) + (5.5 * 2) = 41
    });

    test('should calculate cart count correctly', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      }, 3);

      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 5.50,
      }, 2);

      // Act
      const count = getCartCount();

      // Assert
      expect(count).toBe(5); // 3 + 2
    });

    test('should return 0 for empty cart count', () => {
      // Act
      const count = getCartCount();

      // Assert
      expect(count).toBe(0);
    });
  });

  describe('Clearing cart', () => {
    test('should clear all items from cart', () => {
      // Arrange
      addItem({
        stripePriceId: 'price_123',
        name: 'Product A',
        price: 10.00,
      });
      addItem({
        stripePriceId: 'price_456',
        name: 'Product B',
        price: 5.50,
      });

      // Act
      clearCart();
      const items = getItems();

      // Assert
      expect(items.length).toBe(0);
      expect(getCartTotal()).toBe(0);
      expect(getCartCount()).toBe(0);
    });
  });
});