# Complete Shopify Markets Integration
## For theme.liquid - Replace existing Language & Currency dropdowns

---

## Part 1: Geolocation Script
## Add this in <head> section, BEFORE closing </head>

```liquid
<!-- Shopify Geolocation & Market Detection -->
<script>
  // Pass Liquid data to JavaScript
  window.Shopify = window.Shopify || {};
  window.Shopify.country = '{{ localization.country.iso_code }}';
  window.Shopify.currency = window.Shopify.currency || {};
  window.Shopify.currency.active = '{{ localization.currency.iso_code }}';
  window.Shopify.locale = '{{ localization.language.iso_code }}';

  // Available markets from Shopify
  window.Shopify.markets = {
    available: [
      {% for market in localization.available_countries %}
        {
          iso_code: '{{ market.iso_code }}',
          name: '{{ market.name }}',
          currency: '{{ market.currency.iso_code }}',
          languages: [
            {% for language in market.languages %}
              {
                iso_code: '{{ language.iso_code }}',
                name: '{{ language.name }}',
                endonym_name: '{{ language.endonym_name }}'
              }{% unless forloop.last %},{% endunless %}
            {% endfor %}
          }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ]
  };

  console.log('🌍 Shopify Markets Loaded:', {
    country: window.Shopify.country,
    currency: window.Shopify.currency.active,
    locale: window.Shopify.locale,
    availableMarkets: window.Shopify.markets.available.length
  });
</script>
```

---

## Part 2: Geolocation Auto-Switch Script
## Add after {% render 'css-variables' %} or in <head>

```liquid
<!-- Geolocation Detection & Auto-Switch -->
<script>
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    defaultMarket: {
      country: 'IT',    // Default to Italy
      currency: 'EUR',
      language: 'en'
    },
    internationalMarket: {
      country: 'US',    // International fallback
      currency: 'USD',
      language: 'en'
    },
    autoSwitch: true,   // Set to false to disable auto-switch
    showRecommendation: true // Show modal for market suggestion
  };

  // Check if user has already made a selection
  function hasUserPreference() {
    return sessionStorage.getItem('market-selected') === 'true' ||
           localStorage.getItem('shopify-market') !== null;
  }

  // Get geolocation data from Shopify
  async function getGeolocation() {
    try {
      // Use Shopify's geolocation endpoint
      const response = await fetch('/b/suggestions/localization.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Geolocation API failed');
      }

      const data = await response.json();
      return data.detected_values;
    } catch (error) {
      console.error('Geolocation detection failed:', error);
      return null;
    }
  }

  // Find best matching market based on detected country
  function findBestMarket(detectedCountry) {
    if (!detectedCountry) return null;

    // Search for exact match in available markets
    const availableMarkets = window.Shopify.markets.available;
    const exactMatch = availableMarkets.find(m =>
      m.iso_code === detectedCountry
    );

    if (exactMatch) {
      return exactMatch;
    }

    // No match found - return international fallback
    return null;
  }

  // Show market recommendation modal (optional)
  function showRecommendation(detected, suggested) {
    if (!CONFIG.showRecommendation || hasUserPreference()) {
      return;
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'market-recommendation-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="background: var(--card); max-width: 500px; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--foreground);">
          🌍 Visit Your Local Store?
        </h2>
        <p style="color: var(--muted-foreground); margin-bottom: 1.5rem; line-height: 1.6;">
          It looks like you're visiting from <strong>${detected.country_name}</strong>.
          Would you like to switch to our <strong>${suggested.name}</strong> store?
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button id="switch-market-btn" style="flex: 1; background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            Switch to ${suggested.name}
          </button>
          <button id="stay-current-btn" style="flex: 1; background: var(--secondary); color: var(--foreground); padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            Stay on Current Store
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle button clicks
    document.getElementById('switch-market-btn').addEventListener('click', () => {
      switchMarket(suggested.iso_code);
      modal.remove();
      sessionStorage.setItem('market-selected', 'true');
    });

    document.getElementById('stay-current-btn').addEventListener('click', () => {
      modal.remove();
      sessionStorage.setItem('market-selected', 'true');
    });
  }

  // Switch to a different market
  async function switchMarket(countryCode) {
    try {
      // POST to localization update
      const formData = new FormData();
      formData.append('country_code', countryCode);
      formData.append('_method', 'PUT');

      const response = await fetch('/localization/update', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Reload page with new market
        window.location.reload();
      }
    } catch (error) {
      console.error('Market switch failed:', error);
    }
  }

  // Main initialization
  async function initGeolocation() {
    // Skip if user already has preference
    if (hasUserPreference()) {
      console.log('ℹ️ User preference exists, skipping auto-switch');
      return;
    }

    // Skip if auto-switch is disabled
    if (!CONFIG.autoSwitch) {
      console.log('ℹ️ Auto-switch is disabled');
      return;
    }

    // Get geolocation data
    const detected = await getGeolocation();

    if (!detected || !detected.country) {
      console.log('⚠️ Could not detect location');
      return;
    }

    console.log('📍 Detected location:', detected);

    // Find best market
    const suggestedMarket = findBestMarket(detected.country.iso_code);

    if (suggestedMarket) {
      console.log('✅ Suggested market:', suggestedMarket);

      // Check if already on suggested market
      const currentMarket = window.Shopify.country;
      if (currentMarket === suggestedMarket.iso_code) {
        console.log('✅ Already on correct market');
        return;
      }

      // Show recommendation modal
      showRecommendation(detected, suggestedMarket);
    } else {
      console.log('ℹ️ No specific market found, using international');
      // Could auto-switch to international market here
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeolocation);
  } else {
    initGeolocation();
  }
})();
</script>
```

---

## Part 3: Replace Language Dropdown
## Find and replace the existing Language dropdown with this:

```liquid
<!-- Language Dropdown - Localization Form -->
{% form 'localization', class: 'relative dropdown-container' %}
  <div class="relative dropdown-container">
    <button
      type="button"
      onclick="toggleDropdown('language-dropdown')"
      class="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
      style="min-width: 80px; width: auto; cursor: pointer;"
    >
      <span style="pointer-events: none; white-space: nowrap;">
        <span id="current-flag">{{ localization.language.iso_code | slice: 0, 2 | upcase }}</span>
        <span id="current-lang">{{ localization.language.iso_code | upcase }}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50" aria-hidden="true">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>

    <div id="language-dropdown" class="dropdown-menu hidden absolute right-0 mt-2 rounded-md border border-input bg-popover text-popover-foreground shadow-md z-[9999]" style="min-width: 180px;">
      <div class="max-h-[300px] overflow-y-auto p-1">
        {% for language in localization.available_languages %}
          <button
            type="submit"
            name="locale_code"
            value="{{ language.iso_code }}"
            class="dropdown-item relative flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer border-0 bg-transparent text-left w-full {% if language.iso_code == localization.language.iso_code %}bg-accent text-accent-foreground font-semibold{% endif %}"
          >
            {% if language.iso_code == localization.language.iso_code %}
              <i class="fas fa-check text-xs"></i>
            {% else %}
              <span style="width: 12px;"></span>
            {% endif %}
            <span>{{ language.endonym_name | default: language.name }}</span>
            <span class="text-muted-foreground text-xs">{{ language.iso_code | upcase }}</span>
          </button>
        {% endfor %}
      </div>
    </div>
  </div>
{% endform %}
```

---

## Part 4: Replace Currency Dropdown
## Find and replace the existing Currency dropdown with this:

```liquid
<!-- Currency Dropdown - Localization Form -->
{% form 'localization', class: 'relative dropdown-container' %}
  <div class="relative dropdown-container">
    <button
      type="button"
      onclick="toggleDropdown('currency-dropdown')"
      class="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
      style="min-width: 100px; width: auto; cursor: pointer;"
    >
      <span style="pointer-events: none; white-space: nowrap;">
        <span id="current-currency">{{ localization.currency.iso_code }} {{ localization.currency.symbol }}</span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4 opacity-50" aria-hidden="true">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>

    <div id="currency-dropdown" class="dropdown-menu hidden absolute right-0 mt-2 rounded-md border border-input bg-popover text-popover-foreground shadow-md z-[9999]" style="min-width: 160px;">
      <div class="max-h-[300px] overflow-y-auto p-1">
        {% for currency in localization.available_currencies %}
          <button
            type="submit"
            name="currency_code"
            value="{{ currency.iso_code }}"
            class="dropdown-item relative flex w-full items-center justify-between rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer border-0 bg-transparent text-left w-full {% if currency.iso_code == localization.currency.iso_code %}bg-accent text-accent-foreground font-semibold{% endif %}"
          >
            <span class="flex items-center gap-2">
              {% if currency.iso_code == localization.currency.iso_code %}
                <i class="fas fa-check text-xs"></i>
              {% endif %}
              <span>{{ currency.iso_code }}</span>
            </span>
            <span class="text-muted-foreground">{{ currency.symbol }}</span>
          </button>
        {% endfor %}
      </div>
    </div>
  </div>
{% endform %}
```

---

## Part 5: Remove Old Inline Script
## Find and REMOVE this entire script block (lines 206-280 approximately):

```liquid
<!-- REMOVE THIS ENTIRE BLOCK -->
<script>
  var shopifyCountry = '{{ localization.country.iso_code }}';
  (function() {
    const savedLang = localStorage.getItem('selectedLanguage');
    // ... rest of the old language script
  })();
</script>
```

---

## Part 6: Update JavaScript Functions
## Replace existing currency/language functions with these:

```javascript
// ============================================================
// MARKET & LOCALIZATION SYNC
// ============================================================

// Store product data for currency conversion
let productCache = [];

function captureProductData() {
  // Capture all products that have price elements
  document.querySelectorAll('[data-product-id]').forEach(el => {
    const productId = el.dataset.productId;
    if (!productCache.find(p => p.id === productId)) {
      productCache.push({
        id: productId,
        priceElement: el.querySelector('[data-price]') || el.closest('section').querySelector('[data-price]')
      });
    }
  });
}

// Handle form submissions for localization
document.addEventListener('submit', function(event) {
  const form = event.target;
  if (form && form.action === '/localization/update') {
    event.preventDefault();

    const formData = new FormData(form);

    // Show loading state
    const priceElements = document.querySelectorAll('[data-price], [data-price-usd], .price');
    priceElements.forEach(el => {
      el.style.opacity = '0.5';
      el.style.transition = 'opacity 0.2s';
    });

    // Submit to Shopify
    fetch('/localization/update', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        console.log('✓ Localization updated');

        // Wait for Shopify to process
        setTimeout(() => {
          // Refresh prices from server
          refreshPrices().then(() => {
            // Reload page to update all Liquid content
            window.location.reload();
          });
        }, 300);
      }
    })
    .catch(error => {
      console.error('Localization update failed:', error);
      priceElements.forEach(el => el.style.opacity = '1');
    });
  }
});

async function refreshPrices() {
  try {
    const response = await fetch(window.location.href);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const priceSelectors = [
      '[data-price]',
      '[data-price-usd]',
      '.price',
      '.original-price'
    ];

    priceSelectors.forEach(selector => {
      const oldPrices = document.querySelectorAll(selector);
      const newPrices = doc.querySelectorAll(selector);

      oldPrices.forEach((el, index) => {
        if (newPrices[index]) {
          el.textContent = newPrices[index].textContent;
        }
      });
    });

    // Update cart drawer prices if open
    const cartDrawer = document.querySelector('.cart-drawer');
    if (cartDrawer && !cartDrawer.classList.contains('hidden')) {
      const oldCartItems = document.querySelectorAll('[data-item-price]');
      const newCartItems = doc.querySelectorAll('[data-item-price]');

      oldCartItems.forEach((el, index) => {
        if (newCartItems[index]) {
          el.textContent = newCartItems[index].textContent;
        }
      });

      const oldTotal = document.querySelector('[data-cart-total]');
      const newTotal = doc.querySelector('[data-cart-total]');
      if (oldTotal && newTotal) {
        oldTotal.textContent = newTotal.textContent;
      }
    }

    console.log('✓ All prices updated from server');
  } catch (error) {
    console.error('Failed to refresh prices:', error);
  }
}

// Remove old setLanguage and changeCurrency functions if they exist
// The forms now handle everything automatically

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  captureProductData();

  // Update displays based on current localization
  const currentCurrency = '{{ localization.currency.iso_code }}';
  const currentLang = '{{ localization.language.iso_code }}';

  console.log('✓ Localization initialized:', {
    currency: currentCurrency,
    language: currentLang,
    country: '{{ localization.country.iso_code }}'
  });
});
```

---

## Part 7: Add CSS for Recommendation Modal (Optional)
## Add to your main CSS file or <style> block:

```css
/* Market Recommendation Modal */
#market-recommendation-modal button:hover {
  opacity: 0.9;
}

#market-recommendation-modal button:active {
  transform: scale(0.98);
}
```

---

## Summary of Changes

### ✅ What This Does:

1. **Geolocation Detection**
   - Uses Shopify's `/b/suggestions/localization.json` endpoint
   - Detects user's country based on IP
   - Finds matching market from your configured markets

2. **Market Recommendation Modal**
   - Shows elegant modal suggesting market switch
   - User can accept or decline
   - Remembers user choice (session storage)

3. **Native Localization Forms**
   - Uses `{% form 'localization' %}` for both language and currency
   - No custom JavaScript needed for switching
   - Automatic form submission to Shopify

4. **Price Updates**
   - Fetches updated prices from server after market change
   - Updates all price elements without full page reload
   - Then reloads to update all Liquid content

5. **Selector Sync**
   - Language dropdown shows currently selected language
   - Currency dropdown shows currently selected currency
   - Both automatically sync with Shopify session

### 🎯 Configuration Options:

In the geolocation script (Part 2), you can adjust:

```javascript
const CONFIG = {
  defaultMarket: {
    country: 'IT',    // Default to Italy
    currency: 'EUR',
    language: 'en'
  },
  internationalMarket: {
    country: 'US',    // International fallback
    currency: 'USD',
    language: 'en'
  },
  autoSwitch: true,   // Set to false to disable auto-switch
  showRecommendation: true // Show modal for market suggestion
};
```

### 📋 Testing Checklist:

1. ✅ Geolocation detects correct country
2. ✅ Recommendation modal appears for first-time visitors
3. ✅ Language dropdown switches language
4. ✅ Currency dropdown switches currency and updates prices
5. ✅ Page reload preserves selections
6. ✅ Session storage prevents repeated modal

### 🔧 Shopify Admin Setup:

Make sure in **Settings > Markets** you have:
- ✅ Italy market enabled (EUR)
- ✅ International/Rest of World market enabled
- ✅ All 8 languages enabled in Translate & Adapt app
- ✅ Currencies assigned to appropriate markets

---

## Need Help?

If something doesn't work:
1. Check browser console for errors
2. Verify markets are configured in Shopify Admin
3. Check that localization forms are submitting correctly
4. Test geolocation endpoint: `/b/suggestions/localization.json`
