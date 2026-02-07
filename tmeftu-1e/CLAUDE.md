# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify theme called "Inklab" (version 1.0.0) for e-ink Lab - a digital storefront selling premium planners and templates for e-ink tablets (reMarkable, Supernote, Boox, Kindle Scribe, etc.). The theme is built with:

- **Liquid templates** for Shopify integration
- **Tailwind CSS** (via CDN) for styling
- **Custom CSS** in `application.css` for theme-specific styling
- **Vanilla JavaScript** for interactivity
- **Font Awesome** for icons

## Architecture

### Theme Structure

```
assets/              # CSS and JS files
  ├── application.css    # Theme styles, CSS variables, component styles
  ├── application.js     # Currency listener initialization
  ├── translations.js    # Embedded translations for 16 languages (532KB)
  └── locales/           # Additional locale files (da, de, es, fr, it, ja, ko, nl, no, pl, pt, ru, sv, zh, hi, en)
config/              # Shopify theme configuration (settings schema, metafields)
layout/              # Theme layouts (theme.liquid, password.liquid)
locales/             # Translation files (en.default.json)
sections/            # Reusable page sections with Liquid + HTML + Schema
snippets/            # Reusable code snippets
templates/           # Page templates (index.json for homepage)
assets/images/       # Static images (webp format)
```

### Section-Based Architecture

The homepage is built entirely from **custom sections** defined in `templates/index.json`. Each section is a self-contained Liquid file with:

1. **HTML/Liquid markup** - The section content
2. **Embedded JavaScript** - Section-specific interactivity
3. **Schema definition** - Shopify customizer settings

**Key sections:**
- `hero-banner.liquid` - Hero with stats, features, and CTA
- `problem-analysis.liquid` - Pain points grid
- `product-spotlight.liquid` - Featured product with carousel
- `bundle-offers.liquid` - Product bundle comparison
- `transformation.liquid` - Before/after comparison
- `generator-section.liquid` - Live demo of template generator
- `footer-closure.liquid` - Guarantees, FAQ, and final CTA
- `advantage-comparison.liquid` - Us vs Others comparison
- `steps-section.liquid` - How it works steps
- `assets-overview.liquid` - What's inside grid
- `inventory-grid.liquid` - Device compatibility
- `social-proof.liquid` - Reviews and stats
- `static-vs-generator-table.liquid` - Comparison table
- `category-shop.liquid` - Individual product categories

### Multi-Language Support (Client-Side)

The theme supports **16 languages** via client-side translation system:
- English, German (de), Dutch (nl), French (fr), Italian (it), Spanish (es), Portuguese (pt)
- Danish (da), Swedish (sv), Norwegian (no), Polish (pl), Japanese (ja), Hindi (hi), Chinese (zh), Korean (ko), Russian (ru)

**Translation Architecture:**
- `translations.js` contains `window.EmbeddedTranslations` - a large object with all translations
- `TranslationLoader` handles loading translations from embedded data
- Elements with `data-translate="key"` attribute are translated via `updateTranslations()`
- Language selection persists in `localStorage` as `selectedLanguage`
- No page reload when switching languages (SPA-style)

**Adding Translations:**
1. Add key-value pairs to `translations.js` for all 16 language objects
2. Add `data-translate="your_key"` attribute to HTML elements
3. Original text is captured on page load and stored in `originalTexts` object

### Currency System (Shopify Markets Integration)

**Current Implementation:**
- Base currency: **EUR** (admin default)
- Uses Shopify's Markets system with real-time exchange rates
- Currency conversion is client-side via `CurrencyManager` object in `theme.liquid`
- Prices stored with `data-price-eur` attribute are converted to selected currency

**Supported Currencies (12):**
USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, PLN, INR

**CurrencyManager API:**
```javascript
window.CurrencyManager.getCurrentCurrency()           // Get active currency code
window.CurrencyManager.setCurrentCurrency(code)       // Set currency
window.CurrencyManager.formatPrice(eurAmount, code)   // Convert and format EUR price
window.CurrencyManager.convertPrice(eurAmount, code)  // Convert EUR to target currency
window.CurrencyManager.getRates()                     // Get exchange rates
```

**Price Attributes:**
- `data-price-eur` - Base EUR price (auto-converts on currency change)
- `data-price-usd` - Legacy USD attribute (being phased out)

**Important:** The cart uses Shopify AJAX API with `?currency=` parameter to fetch cart in selected currency.

### Styling System

**CSS Variables** (defined in `application.css`):
```css
--background: #0d1117      # Dark background
--foreground: #fafafa      # Light text
--primary: #ff6b35         # Orange accent
--accent: #20b2aa          # Teal accent
--card: #161b22            # Card background
--muted-foreground: #7d8590
```

**Utility Classes:**
- Tailwind CSS via CDN for layout and spacing
- Custom classes in `application.css` for component-specific styles
- All styles use dark mode color scheme by default

### JavaScript Architecture

**Script Loading Order in `theme.liquid`:**
1. `application.js` - Main theme JS
2. `translations.js` - Embedded translations (~532KB)
3. `TranslationLoader` - Translation system
4. Shopify Markets data passthrough (`window.Shopify.markets`)
5. `CurrencyManager` - Currency conversion (EUR base)
6. Cart functions (`addToCart`, `updateCartUI`, `toggleCart`)
7. Translation functions (`setLanguage`, `updateTranslations`)
8. Carousel initialization (planner carousel, bundle carousel)

**Key Global Functions:**
- `addToCart(id, name, price)` - Add to cart via Shopify AJAX API
- `updateCartUI()` - Refresh cart drawer with current currency
- `toggleCart()` - Open/close cart sidebar
- `setLanguage(code, flag, name)` - Change language (no reload)
- `changeCurrency(code)` - Change currency (no reload, uses `/localization/update`)
- `bundleCarouselNext/Prev(button)` - Navigate bundle image carousels
- `goToSlide(index)` - Navigate planner carousel

**Cart System:**
- Uses **Shopify AJAX API** (not localStorage cart)
- Cart fetched with `?currency=` parameter for proper currency
- Cart drawer with slide-in animation
- Quantity updates and item removal supported

### Geolocation & Localization

The theme auto-detects customer location via Shopify's `{{ localization.country.iso_code }}`:
- Language and currency mappings in `theme.liquid` (lines 1700-1750)
- `localStorage` stores `selectedLanguage`, `selectedCurrency`, `currencyManuallySelected`
- Currency selection can be manually overridden by user

### Product Integration

**Product Reference Pattern:**
```liquid
{% assign product = all_products[section.settings.product] %}
{% if product != blank %}
  {% assign current_variant = product.selected_or_first_available_variant %}
  {{ current_variant.id }}        # Variant ID for add-to-cart
  {{ product.title }}             # Product name
  {{ current_variant.price }}     # Price in cents (divide by 100 for display)
{% endif %}
```

**Product Handles Used:**
- `2026-planner` - Main 2026 daily planner
- `games-activities` - Games and activities pack
- `mega-bundle` - Ultimate collection bundle
- `paper-pro-bundle` - reMarkable Paper Pro Move specific bundle
- Individual category products (financial-management, event-planning, etc.)

## Development Workflow

### Modifying Section Content

1. Edit the `.liquid` file in `sections/`
2. Content is controlled via section schema settings in `templates/index.json`
3. Schema changes appear in Shopify admin: Online Store > Customize > Section Settings

### Adding New Sections

1. Create `sections/your-section.liquid` with HTML/Liquid
2. Add `{% schema %}...{% endschema %}` block with settings
3. Add to `templates/index.json` sections array
4. Define order in `"order"` array

### Working with Translations

1. Edit `assets/translations.js` - Add keys to all 16 language objects
2. Add `data-translate="your_key"` to HTML elements
3. Translation is applied automatically when language changes
4. For HTML content (with tags), the innerHTML is used; textContent for plain text

### Styling Changes

1. Modify CSS variables in `application.css` for global theme colors
2. Add component-specific styles in `application.css`
3. Use Tailwind utility classes for layout
4. Theme is dark-only (no light mode)

### JavaScript Modifications

1. Most global functions are in `layout/theme.liquid` embedded script
2. Currency-specific functions in `CurrencyManager` object
3. Translation functions in client-side translation system block
4. Section-specific scripts within section files (e.g., carousels)
5. All scripts use vanilla JS (no frameworks)

## Important Patterns

### Section Schema Pattern

Every section file ends with:
```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [
    {
      "type": "header",
      "content": "Group Name"
    },
    {
      "type": "text/html/textarea/image_picker/product",
      "id": "setting_id",
      "label": "Human-readable label",
      "default": "default value"
    }
  ],
  "presets": [
    {
      "name": "Section Name",
      "category": "Custom Sections"
    }
  ]
}
{% endschema %}
```

### Carousel Implementation

Two carousel patterns exist:

1. **Bundle Carousel** (fade transition):
   - Absolute positioning with opacity transitions
   - Active class controls visibility
   - Arrow navigation via `bundleCarouselNext/Prev()`
   - Initialize with `currentIndex` stored on container dataset

2. **Planner Carousel** (scroll snap):
   - Horizontal scroll with scroll-snap
   - Dot indicators update on scroll event
   - Touch/swipe and mouse drag support
   - Global `goToSlide(index)` and `getCurrentSlide()` functions

### Fallback Content Pattern

Sections with optional products:
```liquid
{% assign product = all_products[section.settings.product] %}
{% if product != blank %}
  {# Product content #}
{% else %}
  {# Fallback with admin warning #}
  <div style="background: #fee; border: 2px solid #c00;">
    <i class="fas fa-exclamation-triangle"></i> Admin: Product Not Selected
  </div>
  {# Fallback CTA button #}
{% endif %}
```

### Price Display Pattern

For currency-aware pricing:
```html
<span data-price-eur="49">€49</span>
```
The `CurrencyManager.updateAllPrices()` function will automatically convert these prices when currency changes.

## Deployment

The theme is deployed to Shopify via:
1. Shopify CLI (recommended) or
2. Direct upload in Shopify Admin

No build process required - all assets are served as-is.

## Additional Documentation

- `CURRENCY_IMPLEMENTATION.md` - Currency converter implementation details
- `SHOPIFY_MARKETS_SETUP.md` - Shopify Markets configuration guide
- `SHOPIFY_LANGUAGES_SETUP.md` - Language configuration guide
- `UNUSED_FILES_REPORT.md` - Files that can be removed
