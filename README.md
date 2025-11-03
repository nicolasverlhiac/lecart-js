
# LeCart

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
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.example.com/lecart.min.css">
<!-- JavaScript -->
<script src="https://cdn.example.com/lecart.min.js"></script>
```

### Via npm

```bash
npm install lecart
```

```js
// Importer le JavaScript
import LeCart from 'lecart';
// Importer le CSS
import 'lecart/dist/lecart.css';
```

## 🎨 Personnalisation des styles

Vous pouvez personnaliser l'apparence d'LeCart de trois façons:

### 1. Variables CSS

LeCart utilise des variables CSS qui peuvent être redéfinies:

```css
:root {
  --lecart-primary-color: #your-color;
  --lecart-accent-color: #your-accent-color;
  /* et autres variables */
}
```

### 2. Classes CSS

Vous pouvez surcharger les styles par défaut en ciblant les classes LeCart:

```css
.lecart-checkout-btn {
  background-color: #ff6b6b;
  border-radius: 0;
}
```

### 3. Thèmes intégrés

LeCart propose deux thèmes par défaut: clair et sombre.

```js
LeCart.init({
  // ...
  theme: 'dark' // ou 'light'
});
```

## 🛠️ Utilisation

### 1. Initialisation

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    LeCart.init({
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
  data-lecart-add
  data-stripe-price-id="price_1234567890"
  data-product-name="T-shirt Premium"
  data-product-price="29.99"
  data-product-image="https://example.com/tshirt.jpg">
  Ajouter au panier
</button>
```

### 3. Ajouter un bouton d'ouverture du panier

```html
<button data-lecart-open>Voir le panier</button>
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

LeCart supporte plusieurs langues et permet d'ajouter facilement vos propres traductions:

```js
LeCart.init({
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
LeCart.init(config);

// Ouvrir/fermer le panier
LeCart.openCart();
LeCart.closeCart();

// Vider le panier
LeCart.clearCart();

// Changer de langue
LeCart.setLanguage('es');
```

## 📝 Licence

MIT