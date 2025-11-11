// File: tests/core-errors.test.ts

import { init, getConfig } from '../src/core/index';

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

// Mock UI
jest.mock('../src/ui/cart-ui', () => ({
  initUI: jest.fn(),
  updateCartBadges: jest.fn(),
}));

// Mock cart
jest.mock('../src/core/cart', () => ({
  initCart: jest.fn(),
}));

// Mock events
jest.mock('../src/core/events', () => ({
  setupEventListeners: jest.fn(),
}));

describe('Core configuration errors', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';

    // Reset modules to allow fresh init
    jest.resetModules();
  });

  describe('Missing required configuration', () => {
    test('should throw error when lecartApiKey is missing', () => {
      expect(() => {
        init({
          checkoutEndpoint: 'https://test.com/checkout',
        } as any);
      }).toThrow('LeCart: lecartApiKey is required');
    });

    test('should throw error when checkoutEndpoint is missing', () => {
      expect(() => {
        init({
          lecartApiKey: 'test_key',
        } as any);
      }).toThrow('LeCart: checkoutEndpoint is required');
    });

    test('should throw error when both are missing', () => {
      expect(() => {
        init({} as any);
      }).toThrow('LeCart: lecartApiKey is required');
    });
  });

  describe('getConfig before init', () => {
    test('should throw error when getConfig is called before init', () => {
      // Reset to ensure not initialized
      jest.resetModules();

      // Try to get config without init
      expect(() => {
        const { getConfig: freshGetConfig } = require('../src/core/index');
        freshGetConfig();
      }).toThrow('LeCart not initialized');
    });
  });
});
