/**
 * VINTED TRACKER PRO - MAIN JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', function() {

    // Update detected flag in hero section
    const detectedFlagEl = document.querySelector('.detected-flag');
    if (detectedFlagEl && window.VISITOR_FLAG) {
        detectedFlagEl.textContent = window.VISITOR_FLAG;
    }

    // Flip card functionality
    const flipCards = document.querySelectorAll('.flip-card');

    // Handle clicks on flip-card containers
    flipCards.forEach(card => {
        const cardInner = card.querySelector('.flip-card-inner');
        if (cardInner) {
            card.addEventListener('click', () => {
                cardInner.classList.toggle('flipped');
            });
        }
    });

    // Also handle clicks on flip-card-inner elements directly
    document.querySelectorAll('.flip-card-inner').forEach(inner => {
        inner.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling to parent
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
        });
    }

    // Currency selector (client-side - placeholder for future Shopify integration)
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.addEventListener('change', function() {
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
});
