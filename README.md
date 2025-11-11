
# LeCart

[![Build Status](https://github.com/nicolasverlhiac/lecart-js/actions/workflows/build-test.yml/badge.svg)](https://github.com/nicolasverlhiac/lecart-js/actions/workflows/build-test.yml)
[![codecov](https://codecov.io/gh/nicolasverlhiac/lecart-js/branch/main/graph/badge.svg)](https://codecov.io/gh/nicolasverlhiac/lecart-js)
[![npm version](https://img.shields.io/npm/v/lecart.svg)](https://www.npmjs.com/package/lecart)
[![npm downloads](https://img.shields.io/npm/dm/lecart.svg)](https://www.npmjs.com/package/lecart)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight JavaScript library to easily add a shopping cart with Stripe integration to any HTML/CSS website.

## 🌟 Features

- **Simple Integration** - Add a cart with just HTML attributes
- **Works with Static Sites** - Perfect for HTML/CSS/JS sites, GitHub Pages, Netlify, etc.
- **Cart Persistence** - Products remain in cart between sessions
- **Stripe Checkout** - Seamless Stripe payment integration
- **Multi-language** - Built-in support for multiple languages
- **Customizable** - Themes and styles adaptable to your brand
- **Lightweight** - <10kb gzipped
- **Zero Backend Setup** - Use our free managed API (or self-host if you prefer)

## 📦 Installation

### Via CDN (recommended)

```html
<!-- CSS -->
<link id="lecart-stylesheet" rel="stylesheet" href="https://unpkg.com/lecart/dist/lecart.css">
<!-- JavaScript -->
<script src="https://unpkg.com/lecart/dist/lecart.min.js"></script>
```

Or using jsDelivr:

```html
<!-- CSS -->
<link id="lecart-stylesheet" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lecart/dist/lecart.css">
<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/lecart/dist/lecart.min.js"></script>
```

> **Note:** The `id="lecart-stylesheet"` attribute prevents LeCart from loading the CSS file twice if you manually include it in your HTML.

### Via npm

```bash
npm install lecart
```

```js
// Import JavaScript
import LeCart from 'lecart';
// Import CSS
import 'lecart/dist/lecart.css';
```

## 🚀 Quick Start (Recommended - Free Cloud Service)

**No infrastructure setup required!** Get started in 3 steps:

### 1. Create your free account
Visit [app.getlecart.com](https://app.getlecart.com) and create a project to get your LeCart API key.

> **Why use the cloud service?** It's completely free (no premium tiers, no hidden restrictions) and saves you from managing your own infrastructure. Perfect for getting started quickly without the hassle of setting up AWS Lambda, managing API keys, or configuring CORS policies.

### 2. Add LeCart to your site

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/lecart/dist/lecart.css">
<!-- JavaScript -->
<script src="https://unpkg.com/lecart/dist/lecart.min.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    LeCart.init({
      lecartApiKey: 'lecart_xxxxx',  // From your dashboard
      checkoutEndpoint: 'https://api.getlecart.com/create-checkout',
      currency: 'USD',
      language: 'en'
    });
  });
</script>
```

### 3. Add product buttons

```html
<button
  data-lecart-add
  data-stripe-price-id="price_1234567890"
  data-product-name="Premium T-shirt"
  data-product-price="29.99"
  data-product-image="https://example.com/tshirt.jpg">
  Add to Cart
</button>

<button data-lecart-open>View Cart</button>
```

**That's it!** 🎉 No backend to manage, no AWS configuration, just add products and start selling.

---

## 🛠️ Usage

### Initialization

**Using Cloud Service (Recommended):**

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    LeCart.init({
      lecartApiKey: 'lecart_xxxxx',  // Get this from app.getlecart.com
      checkoutEndpoint: 'https://api.getlecart.com/create-checkout',
      currency: 'USD',
      language: 'en',
      theme: 'light',
      position: 'right'
    });
  });
</script>
```

**Using Self-Hosted Backend:**

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    LeCart.init({
      lecartApiKey: 'your-custom-key',  // Your own API key
      checkoutEndpoint: 'https://your-domain.com/api/checkout',  // Your backend URL
      currency: 'USD',
      language: 'en',
      theme: 'light',
      position: 'right'
    });
  });
</script>
```

> See the [Self-Hosted Backend](#-self-hosted-backend-advanced) section below for setup instructions.

### Add Product Buttons

```html
<button
  data-lecart-add
  data-stripe-price-id="price_1234567890"
  data-product-name="Premium T-shirt"
  data-product-price="29.99"
  data-product-image="https://example.com/tshirt.jpg"
  data-product-variant="Size: L">
  Add to Cart
</button>
```

**Available attributes:**

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-stripe-price-id` | **Required** | Your Stripe Price ID |
| `data-product-name` | **Required** | Product name displayed in cart |
| `data-product-price` | **Required** | Product price (number, e.g., "29.99") |
| `data-product-image` | Optional | Product image URL |
| `data-product-variant` | Optional | Product variant (e.g., "Size: L", "Color: Blue") |

### Add Cart Open Button

```html
<button data-lecart-open>View Cart</button>
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lecartApiKey` | `string` | | **Required**. Your LeCart API key from app.getlecart.com |
| `checkoutEndpoint` | `string` | | **Required**. API endpoint URL |
| `currency` | `string` | `'EUR'` | Currency code (EUR, USD, GBP, etc.) |
| `language` | `string` | `'en'` | Language code (en, fr, es, de, it, etc.) |
| `theme` | `string` | `'light'` | Theme (`'light'`, `'dark'` or `'custom'`) |
| `position` | `string` | `'right'` | Cart position (`'right'` or `'left'`) |
| `translations` | `object` | `{}` | Custom translations |
| `cartLifetime` | `number` | `24` | Cart lifetime in hours |
| `showCartBadge` | `boolean` | `true` | Show quantity badge on cart open buttons |

**Cloud Service (Recommended):**
```js
lecartApiKey: 'lecart_xxxxx'  // From app.getlecart.com
checkoutEndpoint: 'https://api.getlecart.com/create-checkout'
```

**Self-Hosted (Advanced):**
```js
lecartApiKey: 'your-custom-key'  // Define your own
checkoutEndpoint: 'https://your-domain.com/api/checkout'
```

---

## 🎨 Styling Customization

You can customize LeCart's appearance in three ways:

### 1. CSS Variables

LeCart uses CSS variables that can be overridden:

```css
:root {
  --lecart-primary-color: #your-color;
  --lecart-accent-color: #your-accent-color;
  /* and other variables */
}
```

### 2. CSS Classes

You can override default styles by targeting LeCart classes:

```css
.lecart-checkout-btn {
  background-color: #ff6b6b;
  border-radius: 0;
}
```

### 3. Built-in Themes

LeCart offers two default themes: light and dark.

```js
LeCart.init({
  // ...
  theme: 'dark' // or 'light'
});
```

---

## 🌍 Internationalization

LeCart supports multiple languages and allows you to easily add your own translations:

```js
LeCart.init({
  // Other options...
  language: 'fr',
  translations: {
    fr: {
      cart: {
        title: 'Mon panier personnalisé',
        // Other keys...
      }
    }
  }
});
```

---

## 🧰 JavaScript API

```js
// Initialize
LeCart.init(config);

// Open/close cart
LeCart.openCart();
LeCart.closeCart();

// Clear cart
LeCart.clearCart();

// Change language
LeCart.setLanguage('es');

// Check payment success (call after Stripe redirect)
LeCart.checkPaymentSuccess();
```

---

## 🔧 Self-Hosted Backend (Advanced)

For developers who want full control, you can host your own checkout API.

### Requirements

- A server/serverless function (AWS Lambda, Vercel, Netlify, etc.)
- A Stripe account with a **restricted API key**

### Setup Stripe Restricted Key

1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Create a restricted key with **only** this permission:
   - `Write` access to `Checkout Sessions`
3. Use the key that starts with `rk_test_` or `rk_live_`

### Backend Example (AWS Lambda)

```javascript
// handler.js
const stripe = require('stripe')(process.env.STRIPE_RESTRICTED_KEY);

exports.handler = async (event) => {
  // Validate LeCart API key
  const lecartApiKey = event.headers['x-api-key'];
  if (lecartApiKey !== process.env.LECART_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid API key' })
    };
  }

  // CORS validation
  const origin = event.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

  if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Origin not allowed' })
    };
  }

  // Parse request
  const { items, success_url, cancel_url, metadata } = JSON.parse(event.body);

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price: item.stripePriceId,
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url,
      cancel_url,
      metadata
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*'
      },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### Environment Variables

```bash
STRIPE_RESTRICTED_KEY=rk_test_xxxxx  # Stripe restricted key
LECART_API_KEY=your-custom-key       # Your custom API key
ALLOWED_ORIGINS=https://yoursite.com # Comma-separated list or *
```

### Frontend Configuration

```js
LeCart.init({
  lecartApiKey: 'your-custom-key',  // Must match LECART_API_KEY
  checkoutEndpoint: 'https://your-api.com/checkout',
  currency: 'USD',
  language: 'en'
});
```

---

## 🆚 Cloud vs Self-Hosted

| Feature | Cloud Service | Self-Hosted |
|---------|--------------|-------------|
| **Setup Time** | 5 minutes | 30-60 minutes |
| **Infrastructure** | Managed for you | You manage |
| **Scaling** | Automatic | You configure |
| **Cost** | Free | AWS/server costs |
| **Control** | Standard features | Full customization |
| **Updates** | Automatic | Manual |

**Recommended for most users:** Start with the cloud service. You can always migrate to self-hosted later if needed.

---

## 📝 License

MIT

## 🔗 Links

- [Dashboard](https://app.getlecart.com) - Create your free account
- [GitHub Repository](https://github.com/nicolasverlhiac/lecart-js)
- [npm Package](https://www.npmjs.com/package/lecart)
- [Report Issues](https://github.com/nicolasverlhiac/lecart-js/issues)
