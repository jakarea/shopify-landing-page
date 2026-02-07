/**
 * VINTED TRACKER PRO - MAIN JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', function() {

    // Flip card functionality
    const flipCards = document.querySelectorAll('.flip-card');
    console.log('Found flip cards:', flipCards.length);

    // Handle clicks on flip-card containers
    flipCards.forEach(card => {
        const cardInner = card.querySelector('.flip-card-inner');
        if (cardInner) {
            card.addEventListener('click', () => {
                console.log('Flip card clicked, toggling flipped class');
                cardInner.classList.toggle('flipped');
            });
        }
    });

    // Also handle clicks on flip-card-inner elements directly
    document.querySelectorAll('.flip-card-inner').forEach(inner => {
        inner.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to parent
            console.log('Flip card inner clicked, toggling flipped class');
            inner.classList.toggle('flipped');
        });
    });

    // Complete Index toggle functionality
    window.toggleToc = function(tocId, button) {
        const tocContent = document.getElementById(tocId);
        const chevron = button.querySelector('.toc-chevron');

        if (tocContent.hidden) {
            // Expand
            tocContent.hidden = false;
            button.setAttribute('aria-expanded', 'true');
            button.setAttribute('data-state', 'open');
            chevron.style.transform = 'rotate(180deg)';
        } else {
            // Collapse
            tocContent.hidden = true;
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('data-state', 'closed');
            chevron.style.transform = 'rotate(0deg)';
        }
    };

    // FAQ accordion functionality
    document.querySelectorAll('.faq-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const chevron = button.querySelector('.faq-chevron');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Close all other FAQs
            document.querySelectorAll('.faq-toggle').forEach(otherButton => {
                if (otherButton !== button) {
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherButton.nextElementSibling.classList.add('hidden');
                    const otherChevron = otherButton.querySelector('.faq-chevron');
                    if (otherChevron) {
                        otherChevron.style.transform = 'rotate(0deg)';
                    }
                }
            });

            // Toggle current FAQ
            if (isExpanded) {
                button.setAttribute('aria-expanded', 'false');
                content.classList.add('hidden');
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            } else {
                button.setAttribute('aria-expanded', 'true');
                content.classList.remove('hidden');
                if (chevron) {
                    chevron.style.transform = 'rotate(180deg)';
                }
            }
        });
    });

    // Countdown Timer
    const COUNTDOWN_DURATION = 9720; // 2h 42m in seconds
    let timeLeft = COUNTDOWN_DURATION;
    let timerInterval = null;

    function updateTimer() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        const timerEl = document.getElementById('countdown');
        if (timerEl) {
            timerEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (timeLeft > 0) {
            timeLeft--;
        } else {
            clearInterval(timerInterval);
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#sign-in') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Language selector (client-side - placeholder for future Shopify integration)
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            console.log('Language changed to:', this.value);
        });
    }

    // Currency selector (client-side - placeholder for future Shopify integration)
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.addEventListener('change', function() {
            console.log('Currency changed to:', this.value);
        });
    }

    // Scroll-down arrow click handler
    const scrollDownArrow = document.querySelector('.animate-bounce.cursor-pointer[onclick*="scrollIntoView"]');
    if (scrollDownArrow) {
        scrollDownArrow.addEventListener('click', function(e) {
            const storySection = document.getElementById('story');
            if (storySection) {
                e.preventDefault();
                storySection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Bundle direct checkout handlers
    const CHECKOUT_URL = 'https://vinted-tracker.com';

    // Product handles
    const BUNDLE_PRODUCTS = {
        'basic-bundle': 'basic-bundle',
        'premium-bundle': 'premium-bundle'
    };

    // Handle bundle button clicks - redirect to checkout
    document.querySelectorAll('[data-bundle-handler]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const bundleType = this.getAttribute('data-bundle-handler');
            const productHandle = BUNDLE_PRODUCTS[bundleType];

            // Add loading state
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<span class="animate-pulse">Loading...</span>';

            if (productHandle) {
                try {
                    // Fetch product to get variant ID
                    const response = await fetch(`${CHECKOUT_URL}/products/${productHandle}.js`);
                    const product = await response.json();

                    if (product && product.variants && product.variants[0]) {
                        const variantId = product.variants[0].id;
                        // Redirect to checkout with item
                        window.location.href = `${CHECKOUT_URL}/cart/${variantId}:1`;
                    } else {
                        // Fallback to product page
                        window.location.href = `${CHECKOUT_URL}/products/${productHandle}`;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    window.location.href = `${CHECKOUT_URL}/products/${productHandle}`;
                }
            }
        });
    });

    // ======================================================
    // DYNAMIC PRICING - Fetches real prices from Shopify with currency conversion
    // ======================================================
    (async function() {
        // Default prices in EUR (fallback if Shopify fetch fails)
        const DEFAULT_PRICES_EUR = {
            'basic-bundle': { price: 29, original: 54 },
            'premium-bundle': { price: 59, original: 140 }
        };

        const CURRENCY_SYMBOLS = {
            'EUR': '€', 'USD': '$', 'GBP': '£', 'CAD': 'C$',
            'AUD': 'A$', 'JPY': '¥', 'PLN': 'zł', 'RON': 'lei',
            'HUF': 'Ft', 'CZK': 'Kč', 'SEK': 'kr', 'DKK': 'kr',
            'NOK': 'kr', 'BGN': 'лв', 'CHF': 'Fr', 'TRY': '₺',
            'BDT': '৳'
        };

        // Get shop base currency (the currency products are stored in, e.g., BDT)
        const shopBaseCurrency = window.SHOPIFY_BASE_CURRENCY || 'EUR';
        // Get visitor's presentation currency (the currency to show prices in)
        const presentationCurrency = window.SHOPIFY_CURRENCY || 'EUR';
        const presentationSymbol = window.SHOPIFY_CURRENCY_SYMBOL || CURRENCY_SYMBOLS[presentationCurrency] || '€';

        // Create a shared currency object that both sections can access and update
        window.SHOP_CURRENT_CURRENCY = {
            code: presentationCurrency,
            symbol: presentationSymbol,
            baseCurrency: shopBaseCurrency
        };

        console.log('=== CURRENCY DEBUG ===');
        console.log('Shop Base Currency:', shopBaseCurrency);
        console.log('Presentation Currency:', presentationCurrency);
        console.log('Presentation Symbol:', presentationSymbol);

        // Get currency - use live reference to shared object
        const getShopCurrency = () => window.SHOP_CURRENT_CURRENCY.code;
        // Get base currency
        const getBaseCurrency = () => window.SHOP_CURRENT_CURRENCY.baseCurrency;

        // Exchange rates relative to EUR
        const RATES_TO_EUR = {
            'EUR': 1,
            'USD': 1.08, 'GBP': 0.86, 'CAD': 1.47, 'AUD': 1.62,
            'JPY': 162, 'PLN': 4.32, 'RON': 4.97, 'HUF': 385,
            'CZK': 25.3, 'SEK': 11.2, 'DKK': 7.45, 'NOK': 11.4,
            'BGN': 1.96, 'CHF': 0.94, 'TRY': 35.2,
            'BDT': 117 // 1 EUR = 117 BDT (approximate)
        };

        // Get exchange rate from one currency to another via EUR
        function getExchangeRate(from, to) {
            if (from === to) return 1;
            const fromRate = RATES_TO_EUR[from] || 1;
            const toRate = RATES_TO_EUR[to] || 1;
            return (1 / fromRate) * toRate;
        }

        // Convert price from shop base currency to presentation currency
        function convertToPresentationPrice(amountInBaseCurrency) {
            const baseCurrency = getBaseCurrency();
            const presentationCurrency = getShopCurrency();

            console.log(`convertToPresentationPrice: ${amountInBaseCurrency} ${baseCurrency} → ? ${presentationCurrency}`);

            if (baseCurrency === presentationCurrency) {
                return amountInBaseCurrency;
            }

            // Convert via EUR: baseCurrency → EUR → presentationCurrency
            const rateToEur = RATES_TO_EUR[baseCurrency] || 1;
            const rateFromEur = RATES_TO_EUR[presentationCurrency] || 1;
            const rate = (1 / rateToEur) * rateFromEur;

            const result = amountInBaseCurrency * rate;
            console.log(`  → ${result.toFixed(2)} ${presentationCurrency} (rate: ${rate})`);
            return result;
        }

        function getBaseUrl() {
            if (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) {
                return window.Shopify.routes.root;
            }
            return '/';
        }

        async function fetchProductPrice(handle) {
            try {
                const baseUrl = getBaseUrl();
                const url = baseUrl + `products/${handle}.js`;

                const response = await fetch(url);
                console.log('Fetched', handle, 'status:', response.status);

                if (response.ok) {
                    const product = await response.json();

                    if (product.variants && product.variants[0]) {
                        const variant = product.variants[0];
                        let priceNum = typeof variant.price === 'string' ? parseInt(variant.price) : variant.price;

                        // Convert from minor units to major units
                        let priceInMajorUnits = priceNum / 100;

                        console.log(`${handle}: Shopify price = ${priceInMajorUnits} ${variant.price_currency || 'EUR'}`);

                        // If price is unreasonably high (> 100), Shopify Markets is misconfigured
                        if (priceInMajorUnits > 100) {
                            console.warn(`Shopify returned price ${priceInMajorUnits} which is too high, ignoring`);
                            return null; // Use defaults instead
                        }

                        return {
                            price: priceInMajorUnits.toFixed(2),
                            currency: getShopCurrency()
                        };
                    }
                }
            } catch (error) {
                console.log('Fetch error for', handle, error);
            }
            return null;
        }

        function formatPrice(amount, currency) {
            const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
            const roundedAmount = Math.round(parseFloat(amount));
            return symbol + roundedAmount;
        }

        function calculateDiscountPercent(original, current) {
            if (!original || original <= current) return 0;
            return Math.round(((original - current) / original) * 100);
        }

        // Find ALL pricing sections on the page
        const pricingContainers = document.querySelectorAll('[data-pricing-section]');
        console.log(`Found ${pricingContainers.length} pricing sections`);

        if (pricingContainers.length === 0) return;

        // Fetch prices for both bundles (but we'll use defaults anyway)
        const shopifyPrices = {};
        for (const handle of ['basic-bundle', 'premium-bundle']) {
            const data = await fetchProductPrice(handle);
            if (data) {
                shopifyPrices[handle] = data;
            }
        }

        console.log('Shopify prices:', shopifyPrices);

        // ALWAYS use default EUR prices and convert to visitor's currency
        // This ensures correct prices regardless of Shopify configuration
        pricingContainers.forEach(container => {
            const currentCurrency = getShopCurrency();

            console.log(`Updating prices for currency: ${currentCurrency}`);

            for (const [bundleKey, eurDefaults] of Object.entries(DEFAULT_PRICES_EUR)) {
                const priceEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-price`);
                const originalEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-original-price`);
                const discountEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-discount-badge`);

                if (!priceEl) continue;

                // Convert EUR default to visitor's currency
                const currentPrice = convertToPresentationPrice(eurDefaults.price);
                const formattedPrice = formatPrice(currentPrice, currentCurrency) + ' ';

                priceEl.textContent = formattedPrice;

                // Hide original price and discount (no fake discounts)
                if (originalEl) {
                    originalEl.style.display = 'none';
                }
                if (discountEl) {
                    discountEl.style.display = 'none';
                }

                console.log(`${bundleKey}: €${eurDefaults.price} → ${formattedPrice}`);
            }
        });

        // Update standalone prices (like in guarantee section)
        const guaranteePriceEl = document.getElementById('guarantee-price');
        if (guaranteePriceEl) {
            const currentCurrency = getShopCurrency();
            const premiumPrice = convertToPresentationPrice(DEFAULT_PRICES_EUR['premium-bundle'].price);
            guaranteePriceEl.textContent = formatPrice(premiumPrice, currentCurrency);
            console.log(`Guarantee price: ${formatPrice(premiumPrice, currentCurrency)}`);
        }

        console.log('Dynamic Pricing: Complete!');
    })();

    // ======================================================
    // CURRENCY CONVERSION - Using AJAX (no page reload)
    // ======================================================
    (function() {
        const currencySelector = document.getElementById('currency-selector');
        if (!currencySelector) return;

        // Default prices in EUR
        const EUR_PRICES = {
            'basic-bundle': { price: 29, original: 54 },
            'premium-bundle': { price: 59, original: 140 }
        };

        // Get current currency from shared object (already set by dynamic pricing section)
        let currentCurrency = (window.SHOP_CURRENT_CURRENCY && window.SHOP_CURRENT_CURRENCY.code) || window.SHOPIFY_CURRENCY || 'EUR';
        const baseCurrency = (window.SHOP_CURRENT_CURRENCY && window.SHOP_CURRENT_CURRENCY.baseCurrency) || 'EUR';

        console.log('Currency Converter: Initial currency:', currentCurrency, 'Base currency:', baseCurrency);

        // Currency symbols
        const CURRENCY_SYMBOLS = {
            'EUR': '€', 'USD': '$', 'GBP': '£', 'CAD': 'C$',
            'AUD': 'A$', 'JPY': '¥', 'PLN': 'zł', 'RON': 'lei',
            'HUF': 'Ft', 'CZK': 'Kč', 'SEK': 'kr', 'DKK': 'kr',
            'NOK': 'kr', 'BGN': 'лв', 'CHF': 'Fr', 'TRY': '₺',
            'BDT': '৳'
        };

        // Exchange rates relative to EUR
        const RATES_TO_EUR = {
            'EUR': 1,
            'USD': 1.08, 'GBP': 0.86, 'CAD': 1.47, 'AUD': 1.62,
            'JPY': 162, 'PLN': 4.32, 'RON': 4.97, 'HUF': 385,
            'CZK': 25.3, 'SEK': 11.2, 'DKK': 7.45, 'NOK': 11.4,
            'BGN': 1.96, 'CHF': 0.94, 'TRY': 35.2,
            'BDT': 117
        };

        // Get exchange rate from one currency to another via EUR
        function getExchangeRate(from, to) {
            if (from === to) return 1;
            const fromRate = RATES_TO_EUR[from] || 1;
            const toRate = RATES_TO_EUR[to] || 1;
            return (1 / fromRate) * toRate;
        }

        // Update the shared currency object
        function updateSharedCurrency(currency) {
            if (window.SHOP_CURRENT_CURRENCY) {
                window.SHOP_CURRENT_CURRENCY.code = currency;
                window.SHOP_CURRENT_CURRENCY.symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
                console.log('Updated shared currency to:', currency, 'symbol:', window.SHOP_CURRENT_CURRENCY.symbol);
            }
        }

        // Convert price from EUR to target currency
        function convertPriceFromEur(eurPrice, targetCurrency) {
            if (targetCurrency === 'EUR') return eurPrice;
            const rate = getExchangeRate('EUR', targetCurrency);
            return Math.round(eurPrice * rate);
        }

        // Format price with currency symbol
        function formatPrice(amount, currency) {
            const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
            const roundedAmount = Math.round(amount);
            return symbol + roundedAmount;
        }

        // Update all prices on the page
        function updatePrices(currency) {
            console.log('=== UPDATING PRICES TO', currency, '===');
            console.log('Currency symbol will be:', CURRENCY_SYMBOLS[currency]);

            // Update all pricing sections
            document.querySelectorAll('[data-pricing-section]').forEach(container => {
                ['basic-bundle', 'premium-bundle'].forEach(bundleKey => {
                    const priceEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-price`);
                    const originalEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-original-price`);
                    const discountEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-discount-badge`);

                    if (!priceEl) return;

                    const defaults = EUR_PRICES[bundleKey];
                    const convertedPrice = convertPriceFromEur(defaults.price, currency);
                    const convertedOriginal = convertPriceFromEur(defaults.original, currency);
                    const discount = Math.round(((defaults.original - defaults.price) / defaults.original) * 100);

                    const formattedPrice = formatPrice(convertedPrice, currency) + ' ';
                    priceEl.textContent = formattedPrice;

                    if (originalEl) {
                        originalEl.textContent = formatPrice(convertedOriginal, currency);
                    }
                    if (discountEl) {
                        discountEl.textContent = '-' + discount + '%';
                    }

                    console.log(`${bundleKey}: €${defaults.price} → ${formattedPrice}`);
                });
            });

            // Update guarantee price
            const guaranteePriceEl = document.getElementById('guarantee-price');
            if (guaranteePriceEl) {
                const convertedPrice = convertPriceFromEur(EUR_PRICES['premium-bundle'].price, currency);
                guaranteePriceEl.textContent = formatPrice(convertedPrice, currency);
                console.log(`Guarantee price: ${formatPrice(convertedPrice, currency)}`);
            }
        }

        // Handle currency change via AJAX
        currencySelector.addEventListener('change', async function() {
            const newCurrency = this.value;
            console.log('=== CURRENCY CHANGED TO', newCurrency, '===');

            // Show loading state
            this.disabled = true;
            const originalText = this.options[this.selectedIndex].text;
            this.options[this.selectedIndex].text = 'Loading...';

            try {
                // Make AJAX request to Shopify to update currency
                const formData = new FormData();
                formData.append('currency', newCurrency);
                formData.append('return_to', window.location.pathname);

                const response = await fetch('/localization/update', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                // Always update client-side prices regardless of AJAX result
                window.SHOPIFY_CURRENCY = newCurrency;
                currentCurrency = newCurrency;
                updateSharedCurrency(newCurrency);
                updatePrices(newCurrency);

                // Save selected currency to localStorage for next page load
                localStorage.setItem('selected_currency', newCurrency);
                console.log('Saved currency to localStorage:', newCurrency);

                console.log('Currency change complete');
            } catch (error) {
                console.log('AJAX error, updating client-side only', error);
                // Update prices client-side on error
                window.SHOPIFY_CURRENCY = newCurrency;
                currentCurrency = newCurrency;
                updateSharedCurrency(newCurrency);
                updatePrices(newCurrency);
                // Save to localStorage even on error
                localStorage.setItem('selected_currency', newCurrency);
            } finally {
                // Restore selector state
                this.disabled = false;
                this.options[this.selectedIndex].text = originalText.replace('Loading...', '').trim();
            }
        });

        // Set initial selector value to match current shop currency
        currencySelector.value = currentCurrency;

        // Update prices on page load for the detected currency
        console.log('=== INITIAL PRICE UPDATE ===');
        console.log('Detected currency:', currentCurrency);
        updatePrices(currentCurrency);
    })();
});
