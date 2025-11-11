// File: tests/init-warning.test.ts

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

describe('Initialization warning', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('should warn when trying to init LeCart twice', () => {
    // First init - should succeed
    init({
      lecartApiKey: 'test_key',
      checkoutEndpoint: 'https://test.com/checkout',
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('LeCart initialized successfully');
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    // Second init - should warn
    init({
      lecartApiKey: 'test_key_2',
      checkoutEndpoint: 'https://test.com/checkout-2',
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('LeCart already initialized');
  });

  test('should not re-initialize when already initialized', () => {
    const initUIMock = require('../src/ui/cart-ui').initUI;

    // Clear previous calls
    initUIMock.mockClear();

    // First init
    init({
      lecartApiKey: 'test_key',
      checkoutEndpoint: 'https://test.com/checkout',
    });

    const firstCallCount = initUIMock.mock.calls.length;

    // Second init attempt
    init({
      lecartApiKey: 'different_key',
      checkoutEndpoint: 'https://different.com/checkout',
    });

    // initUI should not be called again
    expect(initUIMock.mock.calls.length).toBe(firstCallCount);
  });
});
