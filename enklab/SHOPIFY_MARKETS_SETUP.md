# Shopify Markets Currency Setup Guide

## What Was Implemented

Your theme now uses **Shopify's native Markets system** for automatic currency conversion with exchange rates.

**How it works:**
1. User selects currency from dropdown
2. JavaScript sends request to Shopify's `/localization/update`
3. **Shopify automatically converts** prices using their real-time exchange rates
4. Prices update on page WITHOUT reload (Single Page Application)

**No manual exchange rate updates needed!** Shopify handles everything.

---

## Shopify Admin Setup Required

### Step 1: Enable Shopify Markets

1. Go to **Shopify Admin** → **Settings** → **Markets**
2. Click **Add market** or enable **Multiple currencies**
3. Add the countries/regions you want to sell to

### Step 2: Enable Currencies

For each market, enable the currencies you want to support:

**Primary Markets & Their Currencies:**
- **United States** → USD ($)
- **Germany** (or any EU country) → EUR (€)
- **United Kingdom** → GBP (£)
- **Canada** → CAD (C$)
- **Australia** → AUD (A$)
- **Japan** → JPY (¥)
- **Switzerland** → CHF
- **Sweden** → SEK (kr)
- **Norway** → NOK (kr)
- **Denmark** → DKK (kr)
- **Poland** → PLN (zł)

### Step 3: Configure Market Settings

For each market:
1. **Market region**: Select the country/region
2. **Currency**: Enable the desired currency
3. **Pricing**: Choose between:
   - **Automatic** (recommended) - Shopify converts prices automatically
   - **Manual** - Set specific prices for each market

---

## How Exchange Rates Work

### ✅ Automatic (Recommended)
Shopify updates exchange rates **every 24 hours** automatically.
- **No manual work needed**
- **Always accurate**
- **Zero maintenance**

### ❌ Manual (Not Recommended)
You can set fixed exchange rates manually, but you must update them regularly.

---

## What Your Customers Will See

### Currency Dropdown
The dropdown in your header shows 11 currencies:
- USD, EUR, GBP, CAD, AUD, JPY, CHF, SEK, NOK, DKK, PLN

### Price Updates
When customer changes currency:
1. **All prices convert instantly** using Shopify's rates
2. **No page reload** - smooth SPA experience
3. **Cart prices update** automatically
4. **Preference saved** - returns to same currency on next visit

### Example
```
Product Price: $29.00 USD
Customer switches to EUR → €26.68 (using Shopify's live rate)
Customer switches to GBP → £22.91 (using Shopify's live rate)
```

---

## Testing Your Setup

### 1. Preview Different Currencies
1. Open your store
2. Click currency dropdown in header
3. Select different currency
4. Watch prices update instantly

### 2. Test Cart Conversion
1. Add product to cart
2. Change currency
3. Open cart drawer
4. Verify cart total is in new currency

### 3. Test Persistence
1. Select a currency
2. Refresh the page
3. Currency should remain selected

---

## Troubleshooting

### Issue: Prices not converting
**Solution:**
- Verify Shopify Markets is enabled in Settings → Markets
- Check that currencies are enabled for your markets
- Clear browser cache and try again

### Issue: Wrong exchange rates
**Solution:**
- Go to Settings → Markets
- Click your market
- Check "Pricing" section
- Ensure "Automatic" is selected (not manual)

### Issue: Currency doesn't save
**Solution:**
- Check browser console for errors
- Verify cookies are enabled in browser
- Check that localStorage is working

### Issue: Some prices not updating
**Solution:**
- Ensure price elements have proper class names (`.price`, `.original-price`)
- Check that sections are using `{{ product.price | money }}` filter
- Review browser console for JavaScript errors

---

## Code Changes Made

### Files Modified:
1. **`layout/theme.liquid`**
   - Added `changeCurrency()` function using Shopify's `/localization/update`
   - Added `refreshPrices()` to update DOM without reload
   - Integrated with `{{ localization.currency.iso_code }}`

2. **Section Files** (with price data attributes):
   - `sections/hero-banner.liquid`
   - `sections/product-spotlight.liquid`
   - `sections/category-shop.liquid`

### How It Works:
```javascript
// User selects EUR
changeCurrency('EUR')
  ↓
// POST to /localization/update with country_code='DE'
  ↓
// Shopify sets currency cookie/session
  ↓
// Fetch page HTML with new prices
  ↓
// Update all .price elements in DOM
  ↓
// Done! No page reload
```

---

## Maintenance

### ✅ Automatic (Zero Maintenance)
- Exchange rates update **automatically every 24 hours**
- **No manual work required**

### Optional: Add More Currencies
To add more currencies:

1. **In Shopify Admin:**
   - Go to Settings → Markets
   - Add market for new country
   - Enable currency

2. **In Theme Code:**
   - Edit `layout/theme.liquid`
   - Add currency to `getCountryForCurrency()` function
   - Add button to currency dropdown

### Example: Adding INR (Indian Rupee)
```javascript
// In getCountryForCurrency()
const countryMap = {
  // ... existing currencies ...
  'INR': 'IN'  // Add this line
};

// In dropdown HTML
<button onclick="changeCurrency('INR')">INR ₹</button>
```

---

## Benefits of This Implementation

✅ **Automatic exchange rates** - Shopify updates them daily
✅ **No page reload** - True SPA experience
✅ **Zero maintenance** - Set it and forget it
✅ **Accurate pricing** - Always shows correct conversion
✅ **Cart integration** - Cart prices update automatically
✅ **Customer preference** - Remembers selected currency
✅ **Professional** - Uses Shopify's enterprise-grade system

---

## Support

If you need help:
1. Check Shopify's [Markets documentation](https://help.shopify.com/en/manual/markets)
2. Review browser console for JavaScript errors
3. Verify Markets are configured correctly in Shopify Admin

---

**Status:** ✅ Ready to use once Shopify Markets is enabled

**Next Step:** Go to Shopify Admin → Settings → Markets to configure your markets and currencies.
