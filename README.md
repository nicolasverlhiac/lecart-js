
# LeCart

A lightweight JavaScript library to easily add a shopping cart with Stripe integration to any HTML/CSS website.

## 🚀 Features

- **Simple Integration** - Add a cart to your site with just a few HTML attributes
- **Zero Backend Dependencies** - Works with static sites (HTML/CSS/JS)
- **Cart Persistence** - Products remain in the cart between sessions
- **Stripe Checkout** - Seamless Stripe integration
- **Multi-language** - Built-in support for multiple languages
- **Customizable** - Themes and styles adaptable to your site
- **Lightweight** - <10kb gzipped

## 📦 Installation

### Via CDN (recommended)

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/lecart/dist/lecart.css">
<!-- JavaScript -->
<script src="https://unpkg.com/lecart/dist/lecart.min.js"></script>
```

Or using jsDelivr:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lecart/dist/lecart.css">
<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/lecart/dist/lecart.min.js"></script>
```

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

## 🛠️ Usage

### 1. Initialization

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    LeCart.init({
      stripePublicKey: 'pk_test_your_key',
      checkoutEndpoint: 'https://your-api.com/create-checkout',
      currency: 'USD',
      language: 'en'
    });
  });
</script>
```

### 2. Add Product Buttons

```html
<button
  data-lecart-add
  data-stripe-price-id="price_1234567890"
  data-product-name="Premium T-shirt"
  data-product-price="29.99"
  data-product-image="https://example.com/tshirt.jpg">
  Add to Cart
</button>
```

### 3. Add Cart Open Button

```html
<button data-lecart-open>View Cart</button>
```

### 4. Backend Configuration

Create an AWS Lambda function or API endpoint to handle Stripe session creation:

```javascript
// Example AWS Lambda - handler.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { items, success_url, cancel_url, metadata } = JSON.parse(event.body);

  try {
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
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stripePublicKey` | `string` | | **Required**. Stripe public key |
| `checkoutEndpoint` | `string` | | **Required**. URL to your backend API |
| `currency` | `string` | `'EUR'` | Currency code (EUR, USD, etc.) |
| `language` | `string` | `'en'` | Language code (en, fr, es, etc.) |
| `theme` | `string` | `'light'` | Theme (`'light'`, `'dark'` or `'custom'`) |
| `position` | `string` | `'right'` | Cart position (`'right'` or `'left'`) |
| `translations` | `object` | `{}` | Custom translations |
| `cartLifetime` | `number` | `24` | Cart lifetime in hours |

## 🌍 Internationalization

LeCart supports multiple languages and allows you to easily add your own translations:

```js
LeCart.init({
  // Other options...
  language: 'fr',
  translations: {
    fr: {
      cart: {
        title: 'My custom cart',
        // Other keys...
      }
    }
  }
});
```

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

## 📝 License

MIT

## 🔗 Links

- [GitHub Repository](https://github.com/nicolasverlhiac/lecart-js)
- [npm Package](https://www.npmjs.com/package/lecart)
- [Report Issues](https://github.com/nicolasverlhiac/lecart-js/issues)
