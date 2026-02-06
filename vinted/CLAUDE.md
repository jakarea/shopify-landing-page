# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinted Tracker Pro is a landing page for a SaaS product that helps Vinted sellers track inventory, analytics, and profits. The page is deployed on Shopify as a custom theme/landing page, while the actual web application is hosted at vintedtracker.com.

## Architecture

### Domain Separation
- **Shopify Store** (this codebase): Handles marketing, payments, and lead capture
- **Web App** (vintedtracker.com): Handles authentication, dashboard, and core features

### File Structure
- `index.html` - Single-page landing page with embedded CSS and JavaScript
- `assets/css/style.css` - Currently empty (styles are embedded in HTML)
- `assets/js/main.js` - Currently empty (scripts are embedded in HTML)
- `assets/img/` - Placeholder for images

### Tech Stack
- Pure HTML/CSS/JavaScript (no build tools, frameworks, or package managers)
- Google Fonts: Inter (body text), Poppins (headings)
- Meta Pixel for analytics tracking (ID: 1348735136725955)

## Post-Purchase Integration

After successful Shopify purchase, generate a registration code for app access:

**Code Format:** `VT-{TIER}-{ORDER_ID}-{CHECKSUM}`
- `TIER`: "B" for Basic, "P" for Premium
- `ORDER_ID`: Shopify order number/ID
- `CHECKSUM`: First 8 characters of HMAC-SHA256(TIER + ORDER_ID, SHOPIFY_CODE_SECRET)

Customer uses code at: `https://vintedtracker.com/register-with-code`

**HMAC Generation Examples:**
```javascript
// Node.js
const crypto = require('crypto');
const secret = process.env.SHOPIFY_CODE_SECRET;
const tier = 'P';
const orderId = '12345';
const hmac = crypto.createHmac('sha256', secret)
  .update(tier + orderId)
  .digest('hex')
  .substring(0, 8);
const code = `VT-${tier}-${orderId}-${hmac}`;
```

```python
# Python
import hmac, hashlib
secret = os.environ['SHOPIFY_CODE_SECRET']
tier = 'P'
order_id = '12345'
checksum = hmac.new(
    secret.encode(),
    (tier + order_id).encode(),
    hashlib.sha256
).hexdigest()[:8]
code = f"VT-{tier}-{order_id}-{checksum}"
```

## Products

1. **Basic Bundle** (€29): PDF guides only, NO app access
2. **Premium Bundle** (€69): App + Guides, lifetime access
3. **Wardrobe Analysis** (€49.99): Add-on service

## Localization

### Supported Currencies (12)
EUR, USD, GBP, CAD, AUD, JPY, PLN, RON, HUF, CZK, SEK, DKK

### Supported Languages (18)
IT, EN, FR, DE, ES, PT, NL, PL, RO, HU, SK, CS, SV, LT, EL, HR, FI, DA

## Design System

### Colors
- Primary Purple: `#9333ea`
- Primary Pink: `#db2777`
- Primary Rose: `#e11d48`
- Success Green: `#22c55e`
- Danger Red: `#ef4444`
- Warning Yellow: `#facc15`
- Text Primary: `#0f172a`
- Text Secondary: `#475569`

### Gradients
- Header: `linear-gradient(to right, #9333ea, #db2777, #e11d48)`
- Background: `linear-gradient(to bottom right, #fff1f2, #fce7f3, #faf5ff)`

### Typography
- Body: Inter (Google Fonts)
- Headings: Poppins (Google Fonts)

## Development Notes

1. All styles are embedded in `<style>` tags within `index.html` (lines 91-1319)
2. All JavaScript is embedded in `<script>` tags at the end of `index.html`
3. The `assets/css/style.css` and `assets/js/main.js` files exist but are currently empty
4. When making changes, edit the embedded CSS/JS directly in `index.html`
5. No build process or package manager - open `index.html` directly in browser to test

## Images Needed

Place the following in `assets/img/`:
- Logo (logo.png)
- Hero background (woman entrepreneur)
- Guide 1 cover (Mindful Shopping Method)
- Guide 2 cover (Vinted Mastery Method)
- App dashboard mockup
- Testimonial avatars (6 different women)
- Before/After comparison images
- Payment methods logos (Stripe, PayPal, Visa, Mastercard, Apple Pay, Google Pay)
- Success/celebration image for final CTA
