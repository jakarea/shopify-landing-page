# Currency Conversion Implementation Guide

This document explains how the dynamic currency conversion system works in the Vinted Tracker Pro Shopify theme.

## Overview

The currency conversion system automatically detects visitor's local currency and displays product prices in that currency with the correct symbol. Users can also manually change currency via a dropdown without page reload.

**Key Features:**
- Auto-detect visitor's currency from browser locale
- Convert EUR base prices to visitor's currency
- Display correct currency symbols (€, $, £, kr, etc.)
- Persist user's currency selection across page loads (localStorage)
- AJAX currency switching without page reload

## Supported Currencies

| Currency | Code | Symbol | Exchange Rate (1 EUR =) |
|----------|------|--------|------------------------|
| Euro | EUR | € | 1.00 |
| US Dollar | USD | $ | 1.08 |
| British Pound | GBP | £ | 0.86 |
| Canadian Dollar | CAD | C$ | 1.47 |
| Australian Dollar | AUD | A$ | 1.62 |
| Japanese Yen | JPY | ¥ | 162 |
| Polish Zloty | PLN | zł | 4.32 |
| Romanian Leu | RON | lei | 4.97 |
| Hungarian Forint | HUF | Ft | 385 |
| Czech Koruna | CZK | Kč | 25.3 |
| Swedish Krona | SEK | kr | 11.2 |
| Danish Krone | DKK | kr | 7.45 |

## File Structure

```
7byk2w-2m/
├── snippets/
│   ├── product-price-data.liquid    # Injects currency data & detects visitor currency
│   ├── header.liquid                 # Currency selector dropdown
│   ├── pricing.liquid                # Main pricing section
│   ├── pricing-early.liquid          # Early pricing section
│   ├── newsletter.liquid             # Newsletter pricing section
│   └── guarantee.liquid              # Guarantee section with price
└── assets/
    └── application.js                # Currency conversion logic
```

## Implementation Details

### 1. Currency Data Injection (`snippets/product-price-data.liquid`)

This snippet is rendered in the page `<head>` to inject currency data before any other JavaScript runs.

```liquid
<script>
// Detect visitor's currency from browser locale
function detectVisitorCurrency() {
    const locale = navigator.language || navigator.userLanguage || 'en-US';
    const country = locale.split('-')[1] || locale.toUpperCase();

    const countryToCurrency = {
        'US': 'USD', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JP',
        'GB': 'GBP', 'PL': 'PL', 'RO': 'RO', 'HU': 'HU',
        'CZ': 'CZK', 'SE': 'SE', 'DK': 'DK', 'NO': 'NO',
        'BG': 'BGN', 'CH': 'CHF', 'TR': 'TRY', 'BD': 'BDT',
        // EU countries use EUR
        'IT': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR',
        'PT': 'EUR', 'NL': 'EUR', 'IE': 'EUR', 'AT': 'EUR',
        'BE': 'EUR', 'FI': 'EUR', 'GR': 'EUR', 'SK': 'EUR',
        'SI': 'EUR', 'LT': 'EUR', 'LV': 'EUR', 'EE': 'EUR',
        'LU': 'EUR', 'CY': 'EUR', 'MT': 'EUR'
    };

    return countryToCurrency[country] || 'EUR';
}

// Check localStorage first for saved currency, otherwise detect
const savedCurrency = localStorage.getItem('selected_currency');
window.SHOPIFY_CURRENCY = savedCurrency || detectVisitorCurrency();
window.SHOPIFY_BASE_CURRENCY = "{{ shop.currency }}";
</script>
```

**Important:** Always use double quotes `"` around Liquid variables that output text to avoid single quote conflicts in JavaScript.

### 2. Currency Selector Dropdown (`snippets/header.liquid`)

Add a select element with `id="currency-selector"`:

```liquid
<select id="currency-selector" class="...">
    <option value="EUR" {% if cart.currency.iso_code == 'EUR' %}selected{% endif %}>€ Euro</option>
    <option value="USD" {% if cart.currency.iso_code == 'USD' %}selected{% endif %}>$ Dollar</option>
    <!-- Add more currencies... -->
</select>
```

**Key Points:**
- Use `id="currency-selector"` for JavaScript to find the element
- Use `{% if cart.currency.iso_code == 'XXX' %}selected{% endif %}` to mark selected option
- Do NOT wrap in a `<form>` tag (we use AJAX, not form submission)

### 3. Pricing Sections Data Attributes

Each pricing section must have:
1. `data-pricing-section` attribute on the section/container
2. `data-product-pricing="bundle-key"` attribute on the pricing container
3. CSS classes for price elements: `.data-price`, `.data-original-price`, `.data-discount-badge`

Example:
```html
<section data-pricing-section>
    <div data-product-pricing="basic-bundle">
        <span class="data-price">€29</span>
        <span class="data-original-price">€54</span>
        <span class="data-discount-badge">-46%</span>
    </div>
</section>
```

For standalone prices (like in guarantee section):
```html
<span id="guarantee-price">€59</span>
```

### 4. Currency Conversion Logic (`assets/application.js`)

The conversion happens in two parts:

#### A. Dynamic Pricing Section (runs on page load)

```javascript
(async function() {
    // Default prices in EUR (source of truth)
    const DEFAULT_PRICES_EUR = {
        'basic-bundle': { price: 29, original: 54 },
        'premium-bundle': { price: 59, original: 140 }
    };

    // Currency symbols mapping
    const CURRENCY_SYMBOLS = {
        'EUR': '€', 'USD': '$', 'GBP': '£', 'CAD': 'C$',
        'AUD': 'A$', 'JPY': '¥', 'PLN': 'zł', 'RON': 'lei',
        'HUF': 'Ft', 'CZK': 'Kč', 'SEK': 'kr', 'DKK': 'kr'
    };

    // Exchange rates relative to EUR
    const RATES_TO_EUR = {
        'EUR': 1, 'USD': 1.08, 'GBP': 0.86, 'CAD': 1.47,
        'AUD': 1.62, 'JPY': 162, 'PLN': 4.32, 'RON': 4.97,
        'HUF': 385, 'CZK': 25.3, 'SEK': 11.2, 'DKK': 7.45
    };

    // Convert from EUR to presentation currency
    function convertToPresentationPrice(amountInEur) {
        const targetCurrency = getShopCurrency();
        if (targetCurrency === 'EUR') return amountInEur;
        const rate = RATES_TO_EUR[targetCurrency] || 1;
        return amountInEur * rate;
    }

    // Format price with symbol
    function formatPrice(amount, currency) {
        const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
        const roundedAmount = Math.round(parseFloat(amount));
        return symbol + roundedAmount;
    }

    // Update all pricing sections
    document.querySelectorAll('[data-pricing-section]').forEach(container => {
        for (const [bundleKey, eurDefaults] of Object.entries(DEFAULT_PRICES_EUR)) {
            const priceEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-price`);
            if (priceEl) {
                const currentPrice = convertToPresentationPrice(eurDefaults.price);
                const formattedPrice = formatPrice(currentPrice, getShopCurrency()) + ' ';
                priceEl.textContent = formattedPrice;
            }
        }
    });

    // Update standalone prices
    const guaranteePriceEl = document.getElementById('guarantee-price');
    if (guaranteePriceEl) {
        const premiumPrice = convertToPresentationPrice(DEFAULT_PRICES_EUR['premium-bundle'].price);
        guaranteePriceEl.textContent = formatPrice(premiumPrice, getShopCurrency());
    }
})();
```

#### B. Currency Change Handler (AJAX switching)

```javascript
(function() {
    const currencySelector = document.getElementById('currency-selector');
    if (!currencySelector) return;

    currencySelector.addEventListener('change', async function() {
        const newCurrency = this.value;

        // AJAX call to Shopify (optional, for server-side tracking)
        try {
            const formData = new FormData();
            formData.append('currency', newCurrency);
            formData.append('return_to', window.location.pathname);

            await fetch('/localization/update', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
        } catch (error) {
            console.log('AJAX error, updating client-side only', error);
        }

        // Always update client-side
        window.SHOPIFY_CURRENCY = newCurrency;
        updateSharedCurrency(newCurrency);
        updatePrices(newCurrency);

        // Save to localStorage for persistence
        localStorage.setItem('selected_currency', newCurrency);
    });

    // Set initial selector value
    currencySelector.value = window.SHOPIFY_CURRENCY || 'EUR';
})();
```

## Adding a New Currency

To add support for a new currency:

### 1. Update the country mapping in `product-price-data.liquid`:

```javascript
const countryToCurrency = {
    // ... existing mappings ...
    'XX': 'XXX'  // Add: 'CountryCode': 'CurrencyCode'
};
```

### 2. Update CURRENCY_SYMBOLS in `application.js`:

```javascript
const CURRENCY_SYMBOLS = {
    // ... existing symbols ...
    'XXX': '¥'  // Add: 'CODE': 'SYMBOL'
};
```

### 3. Update exchange rate in `application.js`:

```javascript
const RATES_TO_EUR = {
    // ... existing rates ...
    'XXX': 123.45  // Add: 'CODE': rate (1 EUR = XXX units)
};
```

### 4. Add option to dropdown in `header.liquid`:

```liquid
<option value="XXX" {% if cart.currency.iso_code == 'XXX' %}selected{% endif %}>¥ CurrencyName</option>
```

## Testing Checklist

- [ ] Page loads with correct detected currency
- [ ] Prices display with correct currency symbol
- [ ] Currency dropdown shows detected currency as selected
- [ ] Changing currency updates all prices immediately
- [ ] No page reload when changing currency
- [ ] Selected currency persists after page reload (localStorage)
- [ ] All pricing sections update (main, early, newsletter, guarantee)
- [ ] No JavaScript errors in console
- [ ] Works across different browser locales

## Troubleshooting

### Issue: Prices always show in EUR

**Cause:** Browser locale maps to EUR (e.g., Italian browser → EUR)

**Solution:** Manually change currency via dropdown to test other currencies

### Issue: Currency doesn't persist after reload

**Cause:** localStorage not being set or retrieved

**Solution:**
1. Check console for `product-price-data: savedCurrency from localStorage =` log
2. Verify `localStorage.setItem('selected_currency', newCurrency)` is called
3. Check browser's localStorage: `localStorage.getItem('selected_currency')`

### Issue: JavaScript syntax error

**Cause:** Single quotes in Liquid output conflicting with JavaScript

**Solution:** Always use double quotes around Liquid variables:
```javascript
// Wrong
window.SHOPIFY_CURRENCY = '{{ cart.currency.iso_code }}';

// Correct
window.SHOPIFY_CURRENCY = "{{ cart.currency.iso_code }}";
```

### Issue: Currency selector shows wrong default

**Cause:** Initial value not set from `window.SHOPIFY_CURRENCY`

**Solution:** Add this after currency converter initialization:
```javascript
currencySelector.value = window.SHOPIFY_CURRENCY || 'EUR';
```

## Security Notes

- All currency conversion happens client-side
- Exchange rates are hardcoded (not fetched from external API)
- Shopify AJAX call to `/localization/update` is for server-side tracking only
- localStorage is used for persistence (no sensitive data stored)

## Future Improvements

1. Fetch live exchange rates from an API
2. Add more currencies (NOK, BGN, CHF, TRY, etc.)
3. Store user's currency in Shopify customer profile (if logged in)
4. Add currency flag icons to dropdown options
5. Implement geolocation API as fallback for country detection
