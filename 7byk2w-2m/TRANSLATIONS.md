# Client-Side Translation System

## Overview
This landing page uses a client-side translation system that allows users to switch languages **without page reload**. All translations are stored in a JavaScript object and applied dynamically to elements with the `data-i18n` attribute.

## Supported Languages (18)
| Code | Language |
|------|----------|
| `en` | English |
| `it` | Italian (Italiano) |
| `fr` | French (Français) |
| `de` | German (Deutsch) |
| `es` | Spanish (Español) |
| `pt` | Portuguese (Português) |
| `nl` | Dutch (Nederlands) |
| `pl` | Polish (Polski) |
| `ro` | Romanian (Română) |
| `hu` | Hungarian (Magyar) |
| `sk` | Slovak (Slovenčina) |
| `cs` | Czech (Čeština) |
| `sv` | Swedish (Svenska) |
| `lt` | Lithuanian (Lietuvių) |
| `el` | Greek (Ελληνικά) |
| `hr` | Croatian (Hrvatski) |
| `fi` | Finnish (Suomi) |
| `da` | Danish (Dansk) |

## File Structure
```
assets/
├── application.js           # FAQ accordion & custom dropdown JS
└── translations.js           # All translation data (~6000 lines)

snippets/
├── header.liquid             # Language dropdown UI
└── *.liquid                  # All snippets with translatable content
```

## How It Works

### 1. Translation Data Structure (`assets/translations.js`)

```javascript
window.TRANSLATIONS = {
  en: {
    hero: {
      title: "Shop Mindfully, Sell Effortlessly 💰",
      subtitle: "Elise Rowan's Mindful Shopping Method..."
    },
    pricing: {
      heading: "Choose Your Path to Success"
    }
    // ... more sections
  },
  it: {
    hero: {
      title: "Acquista con consapevolezza, vendi senza sforzo 💰",
      subtitle: "Il Metodo Mindful Shopping di Elise Rowan..."
    },
    pricing: {
      heading: "Scegli il tuo percorso verso il successo"
    }
  },
  // ... more languages
};
```

### 2. HTML Markup Pattern

Any translatable element must have the `data-i18n` attribute with a dot-notation key:

```liquid
<h2 data-i18n="hero.title">Shop Mindfully, Sell Effortlessly 💰</h2>
<p data-i18n="hero.subtitle">Elise Rowan's Mindful Shopping Method...</p>
```

**Key Format:** `{section}.{key}`

### 3. Custom Language Dropdown (`snippets/header.liquid`)

The language selector uses a custom dropdown (not native `<select>`) to prevent page scrolling:

```liquid
<!-- Hidden native select for functionality -->
<select id="language-selector" class="sr-only absolute" tabindex="-1">
  <option value="en">🇬🇧 English</option>
  <option value="it">🇮🇹 Italian</option>
  <!-- ... more options -->
</select>

<!-- Custom dropdown button -->
<button id="language-dropdown-btn" type="button">
  <span id="language-current">🇬🇧 English</span>
</button>

<!-- Custom dropdown menu -->
<div id="language-dropdown-menu" class="hidden absolute top-full right-0 mt-1...">
  <button type="button" class="language-option" data-value="en">🇬🇧 English</button>
  <button type="button" class="language-option" data-value="it">🇮🇹 Italian</button>
  <!-- ... more options -->
</div>
```

### 4. JavaScript Functions (`assets/translations.js`)

#### `initTranslations()`
- Loads saved language from `localStorage`
- Detects browser language if no saved preference
- Falls back to `en` if detected language not supported
- Applies translations and sets dropdown value

#### `applyTranslations(lang)`
- Finds all elements with `data-i18n` attribute
- Translates content using dot-notation key lookup
- Updates `document.documentElement.lang` attribute

#### `switchLanguage(lang)`
- Saves language preference to `localStorage`
- Applies translations immediately (no page reload)

### 5. Custom Dropdown JS (`assets/application.js`)

```javascript
// Toggle dropdown
dropdownBtn?.addEventListener('click', function(e) {
  e.stopPropagation();
  dropdownMenu.classList.toggle('hidden');
});

// Close on outside click
document.addEventListener('click', function() {
  dropdownMenu?.classList.add('hidden');
});

// Handle selection
languageOptions.forEach(option => {
  option.addEventListener('click', function() {
    const value = this.getAttribute('data-value');
    const text = this.textContent;

    // Update display
    languageCurrent.textContent = text;

    // Update hidden select and trigger change
    languageSelector.value = value;
    languageSelector.dispatchEvent(new Event('change'));

    // Close dropdown
    dropdownMenu.classList.add('hidden');
  });
});
```

## Adding New Translations

### Step 1: Add English Translation

In `assets/translations.js`, add the new key to the `en` object:

```javascript
en: {
  // Existing translations...

  // New section
  newSection: {
    heading: "Your New Heading",
    description: "Your new description text"
  }
}
```

### Step 2: Add to All 17 Languages

For each language code, add the translated version:

```javascript
it: {
  newSection: {
    heading: "La tua nuova intestazione",
    description: "Il tuo nuovo testo di descrizione"
  }
},
fr: {
  newSection: {
    heading: "Votre nouvel en-tête",
    description: "Votre nouveau texte de description"
  }
},
// ... repeat for all languages
```

### Step 3: Update HTML/Liquid Files

Add the `data-i18n` attribute to elements:

```liquid
<h2 data-i18n="newSection.heading">Your New Heading</h2>
<p data-i18n="newSection.description">Your new description text</p>
```

## Translation Sections Reference

| Section | Description | File Location |
|---------|-------------|---------------|
| `hero` | Hero banner content | `snippets/hero.liquid` |
| `story` | Personal story section | `snippets/story.liquid` |
| `problem` | Problem cards | `snippets/problem.liquid` |
| `journey` | 3-step journey | `snippets/journey.liquid` |
| `transformation` | Before/after comparison | `snippets/transformation.liquid` |
| `pricing` | Pricing section | `snippets/pricing.liquid` |
| `appFeatures` | App features | `snippets/app-features.liquid` |
| `guidePreview` | Guide preview section | `snippets/guide-preview.liquid` |
| `socialProof` | Testimonials | `snippets/social-proof.liquid` |
| `testimonials` | Customer testimonials | `snippets/testimonials.liquid` |
| `benefits` | Benefits section | `snippets/benefits.liquid` |
| `comparison` | Static vs Generator comparison | `snippets/comparison.liquid` |
| `trust` | Trust badges | `snippets/trust.liquid` |
| `guarantee` | Guarantee section | `snippets/guarantee.liquid` |
| `finalCta` | Final call to action | `snippets/final-cta.liquid` |
| `newsletter` | Newsletter signup | `snippets/newsletter.liquid` |
| `footer` | Footer links | `snippets/footer.liquid` |
| `header` | Header navigation | `snippets/header.liquid` |
| `faq` | FAQ section | `snippets/faq.liquid` |

## Important Notes

### Language Detection
- Browser language is auto-detected on first visit
- Format: `navigator.language` (e.g., "it-IT" → "it")
- Falls back to `en` if not supported

### Persistent Preference
- User's language choice is saved in `localStorage`
- Key: `selectedLanguage`
- Persists across sessions

### No Page Reload
- Language switching is instant
- No page refresh required
- All content updates dynamically

### Missing Translations
- Falls back to English automatically
- Check browser console for missing keys (during development only)

## Custom Dropdown Benefits

The custom dropdown (instead of native `<select>`) provides:
- **No page scroll** when opening dropdown
- **Always opens downward** from header
- **Consistent styling** across browsers
- **Better mobile experience**

## Troubleshooting

### Translation not appearing?
1. Check `data-i18n` attribute matches translation key exactly
2. Verify translation exists in `window.TRANSLATIONS[lang]`
3. Check for JavaScript errors in console

### Dropdown not working?
1. Ensure `assets/application.js` is loaded
2. Check for conflicting JavaScript
3. Verify `#language-dropdown-btn` and `#language-dropdown-menu` exist

### Language not persisting?
1. Check if `localStorage` is enabled
2. Look for `selectedLanguage` key in browser DevTools → Application → Local Storage
