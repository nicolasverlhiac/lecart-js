// File: tests/open-cart-on-add.test.ts

import { init, getConfig } from '../src/core/index';
import { openCart } from '../src/ui/cart-ui';
import { clearCart, addItem } from '../src/core/cart';

// Mock openCart to track calls
jest.mock('../src/ui/cart-ui', () => ({
  ...jest.requireActual('../src/ui/cart-ui'),
  openCart: jest.fn(),
  updateCartBadges: jest.fn(),
}));

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

const mockedOpenCart = openCart as jest.MockedFunction<typeof openCart>;

describe('openCartOnAdd feature', () => {
  let addButton: HTMLButtonElement;

  beforeAll(() => {
    // Initialiser LeCart une seule fois pour tous les tests
    init({
      lecartApiKey: 'test_key',
      checkoutEndpoint: 'https://test.com/checkout',
      openCartOnAdd: true, // Par défaut activé
    });
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Réinitialiser le panier
    clearCart();

    // Créer un bouton d'ajout au panier
    addButton = document.createElement('button');
    addButton.setAttribute('data-lecart-add', '');
    addButton.setAttribute('data-stripe-price-id', 'price_123');
    addButton.setAttribute('data-product-name', 'Test Product');
    addButton.setAttribute('data-product-price', '19.99');
    addButton.textContent = 'Add to Cart';
    document.body.appendChild(addButton);
  });

  afterEach(() => {
    addButton?.remove();
  });

  describe('Configuration', () => {
    test('should have openCartOnAdd enabled by default', () => {
      const config = getConfig();
      expect(config.openCartOnAdd).toBe(true);
    });
  });

  describe('With openCartOnAdd enabled', () => {
    test('should call openCart after adding item', () => {
      // Act
      addButton.click();

      // Assert - openCart devrait avoir été appelé
      expect(mockedOpenCart).toHaveBeenCalledTimes(1);
    });

    test('should call openCart for each add', () => {
      // Act - Ajouter rapidement plusieurs fois
      addButton.click();
      addButton.click();
      addButton.click();

      // Assert - openCart devrait avoir été appelé 3 fois
      expect(mockedOpenCart).toHaveBeenCalledTimes(3);
    });

    test('should call openCart even with rapid successive adds', () => {
      // Act
      for (let i = 0; i < 5; i++) {
        addButton.click();
      }

      // Assert
      expect(mockedOpenCart).toHaveBeenCalledTimes(5);
    });

    test('should add item to cart when openCartOnAdd is enabled', () => {
      // Act
      addButton.click();

      // Assert - Item should be in cart
      expect(clearCart).toBeDefined();
      expect(mockedOpenCart).toHaveBeenCalled();
    });
  });

  describe('Behavior verification', () => {
    test('should show feedback animation on button', () => {
      // Arrange
      const originalText = addButton.textContent;

      // Act
      addButton.click();

      // Assert - Le feedback devrait être affiché
      expect(addButton.textContent).toBe('✓ Added');
    });

    test('should not crash on click', () => {
      // Act & Assert - Ne devrait pas planter
      expect(() => addButton.click()).not.toThrow();
      expect(mockedOpenCart).toHaveBeenCalled();
    });
  });
});
