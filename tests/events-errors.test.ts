// File: tests/events-errors.test.ts

import { setupEventListeners } from '../src/core/events';
import { init } from '../src/core/index';

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

// Mock pour l'UI
jest.mock('../src/ui/cart-ui', () => ({
  initUI: jest.fn(),
  openCart: jest.fn(),
  updateCartBadges: jest.fn(),
}));

// Mock pour le cart
jest.mock('../src/core/cart', () => ({
  initCart: jest.fn(),
  addItem: jest.fn(),
}));

describe('Events error handling', () => {
  let addButton: HTMLButtonElement;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    // Initialize LeCart
    init({
      lecartApiKey: 'test_key',
      checkoutEndpoint: 'https://test.com/checkout',
      openCartOnAdd: true,
    });
  });

  beforeEach(() => {
    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Create add button
    addButton = document.createElement('button');
    addButton.setAttribute('data-lecart-add', '');
    document.body.appendChild(addButton);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    addButton?.remove();
  });

  describe('Missing required attributes', () => {
    test('should log error when stripePriceId is missing', () => {
      // Arrange - Button without stripePriceId
      addButton.setAttribute('data-product-name', 'Test');
      addButton.setAttribute('data-product-price', '10');

      // Act
      addButton.click();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('LeCart: Missing required product attributes');
    });

    test('should log error when product name is missing', () => {
      // Arrange - Button without name
      addButton.setAttribute('data-stripe-price-id', 'price_123');
      addButton.setAttribute('data-product-price', '10');

      // Act
      addButton.click();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('LeCart: Missing required product attributes');
    });

    test('should log error when product price is missing', () => {
      // Arrange - Button without price
      addButton.setAttribute('data-stripe-price-id', 'price_123');
      addButton.setAttribute('data-product-name', 'Test');

      // Act
      addButton.click();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('LeCart: Missing required product attributes');
    });

    test('should log error when all attributes are missing', () => {
      // Act
      addButton.click();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('LeCart: Missing required product attributes');
    });
  });

  describe('Add to cart feedback animation', () => {
    beforeEach(() => {
      // Add all required attributes
      addButton.setAttribute('data-stripe-price-id', 'price_123');
      addButton.setAttribute('data-product-name', 'Test Product');
      addButton.setAttribute('data-product-price', '19.99');
      addButton.textContent = 'Add to Cart';

      // Use fake timers for precise control
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should change button text to "✓ Added"', () => {
      // Act
      addButton.click();

      // Assert
      expect(addButton.textContent).toBe('✓ Added');
    });

    test('should restore original text after 1 second', () => {
      // Arrange
      const originalText = 'Add to Cart';
      addButton.textContent = originalText;

      // Act
      addButton.click();

      // Assert - Text should be changed immediately
      expect(addButton.textContent).toBe('✓ Added');

      // Fast-forward time by 1 second
      jest.advanceTimersByTime(1000);

      // Assert - Text should be restored
      expect(addButton.textContent).toBe(originalText);
    });

    test('should handle button text restoration even if text was modified during animation', () => {
      // Arrange
      addButton.textContent = 'Buy Now';

      // Act
      addButton.click();

      // Verify immediate change
      expect(addButton.textContent).toBe('✓ Added');

      // Fast-forward time by 1 second
      jest.advanceTimersByTime(1000);

      // Assert - Should restore to "Buy Now"
      expect(addButton.textContent).toBe('Buy Now');
    });
  });

  describe('Multiple rapid clicks', () => {
    beforeEach(() => {
      addButton.setAttribute('data-stripe-price-id', 'price_123');
      addButton.setAttribute('data-product-name', 'Test Product');
      addButton.setAttribute('data-product-price', '19.99');
      addButton.textContent = 'Add to Cart';
    });

    test('should handle multiple rapid clicks', () => {
      // Act - Click multiple times rapidly
      addButton.click();
      addButton.click();
      addButton.click();

      // Assert - Should not crash
      expect(addButton.textContent).toBe('✓ Added');
    });
  });

  describe('Cart open button', () => {
    let openCartButton: HTMLButtonElement;
    const { openCart } = require('../src/ui/cart-ui');

    beforeEach(() => {
      // Create cart open button
      openCartButton = document.createElement('button');
      openCartButton.setAttribute('data-lecart-open', '');
      openCartButton.textContent = 'Open Cart';
      document.body.appendChild(openCartButton);

      // Clear mock
      openCart.mockClear();
    });

    afterEach(() => {
      openCartButton?.remove();
    });

    test('should call openCart when cart open button is clicked', () => {
      // Act
      openCartButton.click();

      // Assert
      expect(openCart).toHaveBeenCalledTimes(1);
    });

    test('should prevent default event behavior', () => {
      // Arrange
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      // Act
      openCartButton.dispatchEvent(event);

      // Assert
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should handle clicks on nested elements within cart open button', () => {
      // Arrange - Add nested element
      const span = document.createElement('span');
      span.textContent = 'Cart';
      openCartButton.appendChild(span);

      openCart.mockClear();

      // Act - Click on nested element
      span.click();

      // Assert - Should still open cart
      expect(openCart).toHaveBeenCalled();
    });
  });
});
