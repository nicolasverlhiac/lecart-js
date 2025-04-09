
# EasyCart

Une librairie JavaScript légère pour ajouter facilement un panier d'achat et une intégration Stripe à n'importe quel site HTML/CSS.

## 🚀 Caractéristiques

- **Simplicité d'intégration** - Ajoutez un panier à votre site avec quelques attributs HTML
- **Zéro dépendance backend** - Fonctionne avec sites statiques (HTML/CSS/JS)
- **Persistance du panier** - Les produits restent dans le panier entre les sessions
- **Checkout Stripe** - Intégration transparente avec Stripe
- **Multi-langue** - Support intégré pour plusieurs langues
- **Personnalisable** - Thèmes et styles adaptables à votre site
- **Léger** - <10kb gzippé

## 📦 Installation

### Via CDN (recommandé)

```html
<script src="https://cdn.example.com/easycart.min.js"></script>
```

### Via npm

```bash
npm install easycart
```

```js
import EasyCart from 'easycart';
```

## 🛠️ Utilisation

### 1. Initialisation

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    EasyCart.init({
      stripePublicKey: 'pk_test_your_key',
      checkoutEndpoint: 'https://your-api.com/create-checkout',
      currency: 'EUR',
      language: 'fr'
    });
  });
</script>
```

### 2. Ajouter des boutons produit

```html
<button 
  data-easycart-add
  data-stripe-price-id="price_1234567890"
  data-product-name="T-shirt Premium"
  data-product-price="29.99"
  data-product-image="https://example.com/tshirt.jpg">
  Ajouter au panier
</button>
```

### 3. Ajouter un bouton d'ouverture du panier

```html
<button data-easycart-open>Voir le panier</button>
```

### 4. Configuration du backend

Créez une fonction AWS Lambda pour gérer la création de la session Stripe:

```javascript
// Exemple AWS Lambda - fichier handler.js
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

## ⚙️ Options de configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stripePublicKey` | `string` | | **Requis**. Clé publique Stripe |
| `checkoutEndpoint` | `string` | | **Requis**. URL vers votre backend Lambda |
| `currency` | `string` | `'EUR'` | Code de la devise (EUR, USD, etc.) |
| `language` | `string` | `'en'` | Code de langue (fr, en, es, etc.) |
| `theme` | `string` | `'light'` | Thème (`'light'`, `'dark'` ou `'custom'`) |
| `position` | `string` | `'right'` | Position du panier (`'right'` ou `'left'`) |
| `translations` | `object` | `{}` | Traductions personnalisées |
| `cartLifetime` | `number` | `24` | Durée de vie du panier en heures |

## 🌍 Internationalisation

EasyCart supporte plusieurs langues et permet d'ajouter facilement vos propres traductions:

```js
EasyCart.init({
  // Autres options...
  language: 'fr',
  translations: {
    fr: {
      cart: {
        title: 'Mon panier personnalisé',
        // Autres clés...
      }
    }
  }
});
```

## 🧰 API JavaScript

```js
// Initialisation
EasyCart.init(config);

// Ouvrir/fermer le panier
EasyCart.openCart();
EasyCart.closeCart();

// Vider le panier
EasyCart.clearCart();

// Changer de langue
EasyCart.setLanguage('es');
```

## 📝 Licence

MIT