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
    // DYNAMIC PRICING - Fetches real prices from Shopify
    // ======================================================
    (async function() {
        const DEFAULT_PRICES = {
            'basic-bundle': { price: 29, original: 54 },
            'premium-bundle': { price: 59, original: 140 }
        };

        const CURRENCY_SYMBOLS = {
            'EUR': '€', 'USD': '$', 'GBP': '£', 'CAD': 'C$',
            'AUD': 'A$', 'JPY': '¥', 'PLN': 'zł', 'RON': 'lei',
            'HUF': 'Ft', 'CZK': 'Kč', 'SEK': 'kr', 'DKK': 'kr',
            'NOK': 'kr', 'BGN': 'лв', 'CHF': 'Fr', 'TRY': '₺'
        };

        // Get currency from Liquid-injected global
        const shopCurrency = window.SHOPIFY_CURRENCY || 'EUR';

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
                console.log('==================================================');
                console.log('Dynamic Pricing: Fetching product data');
                console.log('Template/Pricing Section:', document.querySelector('[data-pricing-section]')?.id || 'Unknown section');
                console.log('Product Handle:', handle);
                console.log('Full URL:', url);
                console.log('Current Currency:', shopCurrency);

                const response = await fetch(url);
                console.log('Response Status:', response.status, response.statusText);

                if (response.ok) {
                    const product = await response.json();
                    console.log('Product Response:', {
                        id: product.id,
                        title: product.title,
                        handle: product.handle,
                        variants: product.variants?.map(v => ({
                            id: v.id,
                            price: v.price,
                            compare_at_price: v.compare_at_price,
                            available: v.available
                        }))
                    });

                    if (product.variants && product.variants[0]) {
                        const variant = product.variants[0];
                        let priceNum = typeof variant.price === 'string' ? parseInt(variant.price) : variant.price;
                        let compareNum = variant.compare_at_price ? (typeof variant.compare_at_price === 'string' ? parseInt(variant.compare_at_price) : variant.compare_at_price) : null;

                        const finalPrice = (priceNum / 100).toFixed(2);
                        const finalCompare = compareNum ? (compareNum / 100).toFixed(2) : null;

                        console.log(`✅ SUCCESS: ${handle} = ${finalPrice} ${shopCurrency} (original: ${finalCompare || 'N/A'})`);

                        return {
                            price: finalPrice,
                            compareAtPrice: finalCompare,
                            currency: shopCurrency
                        };
                    } else {
                        console.log('❌ ERROR: No variants found for', handle);
                    }
                } else {
                    console.log('❌ ERROR: Response not OK', response.status, response.statusText);
                    console.log('This is expected on localhost. Deploy to live store for dynamic pricing.');
                }
            } catch (error) {
                console.log('❌ EXCEPTION: Fetch error for', handle, error);
                console.log('Error details:', error.message);
            }
            return null;
        }

        function formatPrice(amount, currency) {
            const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
            // Always round to full number, no decimals
            const roundedAmount = Math.round(parseFloat(amount));
            return symbol + roundedAmount;
        }

        function calculateDiscountPercent(original, current) {
            if (!original || original <= current) return 0;
            return Math.round(((original - current) / original) * 100);
        }

        // Find ALL pricing sections on the page
        const pricingContainers = document.querySelectorAll('[data-pricing-section]');
        console.log(`Dynamic Pricing: Found ${pricingContainers.length} pricing sections`);

        if (pricingContainers.length === 0) return;

        // Fetch prices for both bundles
        const shopifyPrices = {};
        for (const handle of ['basic-bundle', 'premium-bundle']) {
            const data = await fetchProductPrice(handle);
            if (data) {
                shopifyPrices[handle] = data;
            }
        }

        console.log('Dynamic Pricing: Fetched prices:', shopifyPrices);

        // Update ALL pricing sections
        pricingContainers.forEach(container => {
            for (const [bundleKey, defaults] of Object.entries(DEFAULT_PRICES)) {
                const priceEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-price`);
                const originalEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-original-price`);
                const discountEl = container.querySelector(`[data-product-pricing="${bundleKey}"] .data-discount-badge`);

                if (!priceEl) continue;

                const shopifyData = shopifyPrices[bundleKey];
                const currentPrice = shopifyData ? parseFloat(shopifyData.price) : defaults.price;
                const originalPrice = shopifyData && shopifyData.compareAtPrice ? parseFloat(shopifyData.compareAtPrice) : defaults.original;
                const currency = shopCurrency;
                const discount = calculateDiscountPercent(originalPrice, currentPrice);

                const formattedPrice = formatPrice(currentPrice, currency) + ' ';
                const formattedOriginal = formatPrice(originalPrice, currency);

                priceEl.textContent = formattedPrice;
                if (originalEl) {
                    originalEl.textContent = formattedOriginal;
                    // Hide original price if no discount
                    if (!shopifyData || !shopifyData.compareAtPrice || parseFloat(shopifyData.compareAtPrice) <= currentPrice) {
                        originalEl.style.display = 'none';
                    } else {
                        originalEl.style.display = '';
                    }
                }
                if (discountEl) {
                    if (discount > 0) {
                        discountEl.textContent = '-' + discount + '%';
                        discountEl.style.display = '';
                    } else {
                        // Hide discount badge if no discount
                        discountEl.style.display = 'none';
                    }
                }

                console.log(`Dynamic Pricing: Updated ${bundleKey} -> ${formattedPrice}, discount: ${discount}%`);
            }
        });

        // Update standalone prices (like in guarantee section)
        const guaranteePriceEl = document.getElementById('guarantee-price');
        if (guaranteePriceEl && shopifyPrices['premium-bundle']) {
            const premiumPrice = parseFloat(shopifyPrices['premium-bundle'].price);
            guaranteePriceEl.textContent = formatPrice(premiumPrice, shopCurrency);
            console.log(`Dynamic Pricing: Updated guarantee price -> ${formatPrice(premiumPrice, shopCurrency)}`);
        }

        console.log('Dynamic Pricing: Complete!');
    })();
});
