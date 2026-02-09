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

    // Complete Index toggle functionality with smooth slide animation
    window.toggleToc = function(tocId, button) {
        const tocContent = document.getElementById(tocId);
        const chevron = button.querySelector('.toc-chevron');

        if (tocContent.classList.contains('toc-expanded')) {
            // Collapse
            tocContent.style.maxHeight = '0px';
            tocContent.style.opacity = '0';
            tocContent.style.marginTop = '0px';
            tocContent.classList.remove('toc-expanded');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('data-state', 'closed');
            chevron.style.transform = 'rotate(0deg)';
        } else {
            // Expand
            tocContent.style.maxHeight = tocContent.scrollHeight + 'px';
            tocContent.style.opacity = '1';
            tocContent.style.marginTop = '0.75rem';
            tocContent.classList.add('toc-expanded');
            button.setAttribute('aria-expanded', 'true');
            button.setAttribute('data-state', 'open');
            chevron.style.transform = 'rotate(180deg)';
        }
    };

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

    // Language selector - client-side translation switching
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            if (typeof switchLanguage === 'function') {
                switchLanguage(this.value);
            }
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

    // Bundle direct checkout handlers - using Shopify cart for multi-currency support
    // Product variant IDs (set these in Shopify or fetch dynamically)
    const SHOPIFY_VARIANT_IDS = {
        'basic-bundle': window.SHOPIFY_VARIANT_BASIC || null,
        'premium-bundle': window.SHOPIFY_VARIANT_PREMIUM || null
    };

    // Helper: Clear cart
    async function clearCart() {
        try {
            await fetch('/cart/clear.js', { method: 'POST' });
            console.log('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    // Helper: Remove specific item from cart
    async function removeItemFromCart(key) {
        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: key, quantity: 0 })
            });
            console.log('Item removed:', key);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    // Helper: Get cart contents
    async function getCart() {
        try {
            const response = await fetch('/cart.js');
            return await response.json();
        } catch (error) {
            console.error('Error getting cart:', error);
            return { items: [] };
        }
    }

    // Handle bundle button clicks - add to Shopify cart and redirect to checkout
    document.querySelectorAll('[data-bundle-handler]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const bundleType = this.getAttribute('data-bundle-handler');
            const variantId = SHOPIFY_VARIANT_IDS[bundleType];

            console.log('Button clicked:', bundleType, 'Variant ID:', variantId);

            // Add loading state
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<span class="animate-pulse">Loading...</span>';

            if (variantId) {
                try {
                    // Step 1: Clear entire cart first
                    console.log('Step 1: Clearing cart...');
                    const clearResponse = await fetch('/cart/clear.js', { method: 'POST' });
                    console.log('Cart cleared:', clearResponse.ok);

                    // Small delay to ensure cart is cleared
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // Step 2: Add the new item
                    console.log('Step 2: Adding item to cart...', variantId);
                    const addResponse = await fetch('/cart/add.js', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            items: [{ id: variantId, quantity: 1 }]
                        })
                    });
                    console.log('Item added:', addResponse.ok);

                    // Step 3: Redirect to checkout
                    console.log('Step 3: Redirecting to checkout...');
                    window.location.href = '/checkout';
                } catch (error) {
                    console.error('Error processing checkout:', error);
                    // Restore button and fallback to product page
                    this.disabled = false;
                    this.innerHTML = originalText;
                    window.location.href = `/products/${bundleType}`;
                }
            } else {
                // Variant ID not set, redirect to product page
                console.warn('Variant ID not set for:', bundleType);
                this.disabled = false;
                this.innerHTML = originalText;
                window.location.href = `/products/${bundleType}`;
            }
        });
    });
});

// Custom Language Dropdown
document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtn = document.getElementById('language-dropdown-btn');
    const dropdownMenu = document.getElementById('language-dropdown-menu');
    const languageCurrent = document.getElementById('language-current');
    const languageSelector = document.getElementById('language-selector');
    const languageOptions = document.querySelectorAll('.language-option');

    // Toggle dropdown
    dropdownBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdownMenu?.classList.add('hidden');
    });

    // Prevent dropdown from closing when clicking inside
    dropdownMenu?.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle language selection
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;

            // Update current display
            languageCurrent.textContent = text;

            // Update hidden select
            languageSelector.value = value;

            // Trigger change event for translations
            languageSelector.dispatchEvent(new Event('change'));

            // Close dropdown
            dropdownMenu.classList.add('hidden');
        });
    });
});

// Prevent page scroll on currency dropdown (if exists)
document.addEventListener('DOMContentLoaded', function() {
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        let scrollPos = 0;
        currencySelector.addEventListener('mousedown', function() {
            scrollPos = window.scrollY;
        });
        currencySelector.addEventListener('change', function() {
            setTimeout(() => window.scrollTo(0, scrollPos), 0);
        });
    }
});

// FAQ accordion functionality
window.toggleFaq = function(button) {
    const card = button.parentElement;
    const answer = card.querySelector('.faq-answer');
    const icon = button.querySelector('.faq-icon');

    if (!answer || !icon) return;

    const isOpen = !answer.classList.contains('hidden');

    // Close all other FAQs
    document.querySelectorAll('.faq-card').forEach(otherCard => {
        if (otherCard !== card) {
            const otherAnswer = otherCard.querySelector('.faq-answer');
            const otherIcon = otherCard.querySelector('.faq-icon');
            if (otherAnswer) otherAnswer.classList.add('hidden');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
    });

    // Toggle current FAQ
    if (isOpen) {
        answer.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    } else {
        answer.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    }
};
