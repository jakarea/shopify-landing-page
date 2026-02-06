// ============================================
// ENKLAB THEME - MAIN JAVASCRIPT
// ============================================
// Cart is now handled via Shopify AJAX API in theme.liquid
// This file is kept for any additional theme functionality
// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Currency prices will be updated by CurrencyManager
  if (typeof window.CurrencyManager !== 'undefined') {
    window.CurrencyManager.init();
  }
});
// Listen for currency changes
window.addEventListener('currencyChanged', function(e) {
  // Update any prices that have data-price-eur attribute
  document.querySelectorAll('[data-price-eur]').forEach(el => {
    const usdPrice = parseFloat(el.dataset.priceUsd);
    if (typeof window.CurrencyManager !== 'undefined') {
      el.textContent = window.CurrencyManager.formatPrice(usdPrice);
    }
  });
});