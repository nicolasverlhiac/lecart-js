// File: tests/cart.test.ts

import { initCart, addItem, removeItem, getItems, clearCart, getCartTotal } from '../src/core/cart';

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
    expect(total).toBe(25.50);
  });
});