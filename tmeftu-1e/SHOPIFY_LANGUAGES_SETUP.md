# How to Configure 12 Languages in Shopify Markets
## For Translate & Adapt App Users

---

## Step 1: Enable Languages in Shopify Admin

1. **Go to:** Shopify Admin → **Settings** → **Languages**

2. **Add Languages** (click "Add language" for each):

   | Language | ISO Code | Select from Dropdown |
   |----------|----------|---------------------|
   | English | `en` | English (already default) |
   | German | `de` | German (Deutsch) |
   | French | `fr` | French (Français) |
   | Spanish | `es` | Spanish (Español) |
   | Italian | `it` | Italian (Italiano) |
   | Portuguese | `pt` | Portuguese (Português) |
   | Dutch | `nl` | Dutch (Nederlands) |
   | Polish | `pl` | Polish (Polski) |
   | Russian | `ru` | Russian (Русский) |
   | Japanese | `ja` | Japanese (日本語) |
   | Chinese (Simplified) | `zh` | Chinese (中文) |
   | Korean | `ko` | Korean (한국어) |

3. **Click "Save"** after adding all languages

---

## Step 2: Configure Translate & Adapt App

Since you're using the **Translate & Adapt** app by Shopify:

### 2.1 Open Translate & Adapt

1. Go to **Apps** → **Translate & Adapt**

### 2.2 Import Theme Translations

1. Click **"Import and export languages"**
2. Select **"Import and export resources"**
3. Choose your theme from the dropdown
4. Click **"Export"** to download the JSON files

### 2.3 Add Language Files

For each language (DE, FR, ES, IT, PT, NL, PL, RU, JA, ZH, KO):

1. Click **"Add language"**
2. Select the language from dropdown
3. Choose **"Import from file"** OR **"Translate automatically"**

### Option A: Manual Translation (Recommended for quality)

1. Export your English translations
2. You'll get files like:
   - `en.default.json`
   - `schema.json`

3. Create copies for each language:
   ```
   en.default.json  →  de.default.json
   en.default.json  →  fr.default.json
   en.default.json  →  es.default.json
   ... (one for each language)
   ```

4. Translate the content in each JSON file:
   ```json
   // de.default.json example
   {
     "general": {
       "search": "Suche",
       "cart": "Warenkorb",
       "checkout": "Kasse"
     }
   }
   ```

5. Import each translated file back into Translate & Adapt

### Option B: Automatic Translation (Faster but less accurate)

1. In Translate & Adapt, select **"Translate automatically"**
2. Choose your base language (English)
3. Select all target languages (DE, FR, ES, IT, PT, NL, PL, RU, JA, ZH, KO)
4. Click **"Start translation"**
5. Review and adjust translations as needed

---

## Step 3: Configure Markets for Each Language

### 3.1 Go to Markets

1. Go to **Settings** → **Markets**

### 3.2 Create Language-Specific Markets

**Important:** Shopify Markets work by **Country**, not language. But you can enable multiple languages per market.

#### Option A: Single Market with Multiple Languages (Recommended)

Create **one primary market** (e.g., "International" or "European Union"):

1. Click **"Create market"** → **"European Union"** (or "Rest of World")
2. **Name:** European Union (or International)
3. **Countries:** Select EU countries + others
4. **Languages:** Enable all 12 languages
   - ✅ English
   - ✅ Deutsch
   - ✅ Français
   - ✅ Español
   - ✅ Italiano
   - ✅ Português
   - ✅ Nederlands
   - ✅ Polski
   - ✅ Русский
   - ✅ 日本語
   - ✅ 中文
   - ✅ 한국어
5. **Currency:** EUR (or enable multiple: EUR, USD, GBP, etc.)
6. **Click "Save"**

#### Option B: Separate Markets by Language (Advanced)

Create individual markets for each language/region:

```
🇩🇪 Germany Market
├── Countries: Germany, Austria, Switzerland
├── Languages: Deutsch, English
└── Currency: EUR

🇫🇷 France Market
├── Countries: France
├── Languages: Français, English
└── Currency: EUR

🇮🇹 Italy Market
├── Countries: Italy
├── Languages: Italiano, English
└── Currency: EUR

🇪🇸 Spain Market
├── Countries: Spain
├── Languages: Español, English
└── Currency: EUR

... (one for each country)
```

**I recommend Option A** - it's simpler and works better for digital products.

---

## Step 4: Set Up Currency by Market

### For International/Global Market:

1. Go to **Settings** → **Markets**
2. Click your market (e.g., "International")
3. Under **"Pricing"**:
   - Choose **"Include duties and import taxes"** (if applicable)
   - Choose **"Automatic currency conversion"** (recommended)
   - Enable currencies you want to support:
     - ✅ USD (default)
     - ✅ EUR
     - ✅ GBP
     - ✅ CAD
     - ✅ AUD
     - ✅ JPY
     - ✅ CHF
     - ✅ SEK
     - ✅ NOK
     - ✅ DKK
     - ✅ PLN
4. **Click "Save"**

---

## Step 5: Add Market-Specific Content (Optional)

If you want different content per language:

### Using Translate & Adapt:

1. Go to **Apps** → **Translate & Adapt**
2. Click **"Resources"**
3. Find your section/block content
4. Click **"Translate"** next to each field
5. Add translations for each language

### Example: Translating Section Headings

```
Hero Banner Section:
├── Heading (EN): "Unlock Your Productivity"
├── Heading (DE): "Steigern Sie Ihre Produktivität"
├── Heading (FR): "Débloquez votre productivité"
├── Heading (ES): "Desbloquea tu productividad"
└── ... (all 12 languages)
```

---

## Step 6: Test Language Switching

1. Open your store
2. Click language dropdown in header
3. Select a different language (e.g., Deutsch)
4. Verify:
   - ✅ Page content translates
   - ✅ URL updates with `?locale=de`
   - ✅ Language preference is saved
   - ✅ Navigation stays on same page

---

## Step 7: Verify Geolocation

1. Use a VPN to simulate different countries
2. Visit your store from:
   - Germany → Should detect and suggest Deutsch
   - France → Should detect and suggest Français
   - Japan → Should detect and suggest 日本語
3. Verify auto-switch works

---

## Quick Reference: Language ISO Codes

| Language | Code | Endonym Name | Flag |
|----------|------|--------------|------|
| English | `en` | English | 🇬🇧 |
| German | `de` | Deutsch | 🇩🇪 |
| French | `fr` | Français | 🇫🇷 |
| Spanish | `es` | Español | 🇪🇸 |
| Italian | `it` | Italiano | 🇮🇹 |
| Portuguese | `pt` | Português | 🇵🇹 |
| Dutch | `nl` | Nederlands | 🇳🇱 |
| Polish | `pl` | Polski | 🇵🇱 |
| Russian | `ru` | Русский | 🇷🇺 |
| Japanese | `ja` | 日本語 | 🇯🇵 |
| Chinese | `zh` | 中文 | 🇨🇳 |
| Korean | `ko` | 한국어 | 🇰🇷 |

---

## Troubleshooting

### Issue: Language not showing in dropdown
**Solution:**
- Verify language is enabled in Settings → Languages
- Check Translate & Adapt has translations imported
- Clear browser cache

### Issue: Translations not appearing
**Solution:**
- Make sure you're using `{{ 'key' | t }}` in your Liquid files
- Check translation JSON files are properly formatted
- Re-publish theme after importing translations

### Issue: Currency not updating with language
**Solution:**
- Markets are country-based, not language-based
- User must manually select currency OR
- Create separate markets for each currency region

---

## Summary Checklist

- [ ] 12 languages enabled in Settings → Languages
- [ ] Translate & Adapt app has translations for all 12
- [ ] Markets configured with all languages enabled
- [ ] Currencies set for each market
- [ ] Theme uses `{{ 'key' | t }}` for translatable content
- [ ] Language dropdown shows all 12 languages
- [ ] Currency dropdown shows enabled currencies
- [ ] Geolocation auto-switches language
- [ ] Test with VPN from different countries

---

**Next Step:** Once you've configured the languages and markets in Shopify Admin, I'll update your `theme.liquid` with the integration.

Let me know when you're ready for me to edit the theme file!
