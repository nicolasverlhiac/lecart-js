// File: tests/stripe-checkout.test.ts

import { createCheckoutSession } from '../src/api/stripe';

// Mock global fetch
global.fetch = jest.fn();

// Mock DOM elements and methods
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();
document.querySelector = jest.fn();

// Mock translations
jest.mock('../src/i18n', () => ({
  initTranslations: jest.fn(),
  t: jest.fn((key: string) => key),
}));

// Mock storage
jest.mock('../src/storage/local-storage', () => ({
  initStorage: jest.fn(),
  saveCart: jest.fn(),
  loadCart: jest.fn(() => []),
}));

// Mock cart
jest.mock('../src/core/cart', () => ({
  initCart: jest.fn(),
  getItems: jest.fn(() => []),
  clearCart: jest.fn(),
}));

// Mock UI
jest.mock('../src/ui/cart-ui', () => ({
  initUI: jest.fn(),
}));

// Mock events
jest.mock('../src/core/events', () => ({
  setupEventListeners: jest.fn(),
}));

// Import init after mocks are set up
import { init } from '../src/core';

describe('Stripe checkout with address and phone collection', () => {
  const checkoutData = {
    items: [{ stripePriceId: 'price_123', quantity: 1 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
    });
  });

  describe('With collectShippingAddress enabled', () => {
    beforeAll(() => {
      init({
        lecartApiKey: 'test_key',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true,
      });
    });

    test('should include shipping_address_collection with default countries', async () => {
      // Act
      await createCheckoutSession(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_address_collection).toBeDefined();
      expect(requestBody.shipping_address_collection.allowed_countries).toBeDefined();
      expect(Array.isArray(requestBody.shipping_address_collection.allowed_countries)).toBe(true);
      expect(requestBody.shipping_address_collection.allowed_countries.length).toBeGreaterThan(0);
    });

    test('should maintain existing request body fields', async () => {
      // Act
      await createCheckoutSession(checkoutData);

      // Assert
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.items).toEqual(checkoutData.items);
      expect(requestBody.success_url).toContain('payment_success=true');
      expect(requestBody.success_url).toContain('cart_id=');
      expect(requestBody.cancel_url).toBe(window.location.href);
      expect(requestBody.metadata).toBeDefined();
      expect(requestBody.metadata.cart_id).toBeDefined();
    });
  });

  describe('With collectPhoneNumber enabled', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_2',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectPhoneNumber: true,
      });
    });

    test('should include phone_number_collection', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.phone_number_collection).toBeDefined();
      expect(requestBody.phone_number_collection.enabled).toBe(true);
    });
  });

  describe('With both collectShippingAddress and collectPhoneNumber enabled', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_3',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true,
        collectPhoneNumber: true,
      });
    });

    test('should include both shipping_address_collection and phone_number_collection', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_address_collection).toBeDefined();
      expect(requestBody.shipping_address_collection.allowed_countries).toBeDefined();
      expect(requestBody.phone_number_collection).toBeDefined();
      expect(requestBody.phone_number_collection.enabled).toBe(true);
    });
  });

  describe('With custom shippingCountries', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_4',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true,
        shippingCountries: ['FR', 'BE', 'CH', 'LU'],
      });
    });

    test('should use custom shippingCountries when provided', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      const customCountries = ['FR', 'BE', 'CH', 'LU'];

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_address_collection).toBeDefined();
      expect(requestBody.shipping_address_collection.allowed_countries).toEqual(customCountries);
    });
  });

  describe('With default configuration (no address or phone collection)', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_5',
        checkoutEndpoint: 'https://api.example.com/checkout',
      });
    });

    test('should NOT include shipping_address_collection when not enabled', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_address_collection).toBeUndefined();
      expect(requestBody.phone_number_collection).toBeUndefined();
    });
  });

  describe('With collectShippingAddress explicitly set to false', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_6',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: false,
        collectPhoneNumber: false,
      });
    });

    test('should NOT include shipping_address_collection when explicitly disabled', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_address_collection).toBeUndefined();
      expect(requestBody.phone_number_collection).toBeUndefined();
    });
  });

  describe('With shippingOptions enabled', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_7',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true,
        shippingOptions: ['shr_test_123', 'shr_test_456']
      });
    });

    test('should include shipping_options when shippingOptions are provided', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_options).toBeDefined();
      expect(Array.isArray(requestBody.shipping_options)).toBe(true);
      expect(requestBody.shipping_options.length).toBe(2);
      expect(requestBody.shipping_options[0]).toEqual({ shipping_rate: 'shr_test_123' });
      expect(requestBody.shipping_options[1]).toEqual({ shipping_rate: 'shr_test_456' });
    });
  });

  describe('Without shippingOptions', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_8',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true
      });
    });

    test('should NOT include shipping_options when not provided', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_options).toBeUndefined();
    });
  });

  describe('With empty shippingOptions array', () => {
    beforeAll(() => {
      // Reset module to allow re-initialization
      jest.resetModules();
      jest.clearAllMocks();

      // Re-import after reset
      const { init: initFresh } = require('../src/core');
      initFresh({
        lecartApiKey: 'test_key_9',
        checkoutEndpoint: 'https://api.example.com/checkout',
        collectShippingAddress: true,
        shippingOptions: []
      });
    });

    test('should NOT include shipping_options when array is empty', async () => {
      // Re-import to get fresh instance
      const { createCheckoutSession: createCheckoutFresh } = require('../src/api/stripe');

      // Reset fetch mock
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.com/session_123' }),
      });

      // Act
      await createCheckoutFresh(checkoutData);

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.shipping_options).toBeUndefined();
    });
  });
});
