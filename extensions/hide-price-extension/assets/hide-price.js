(function() {
  'use strict';
  const CONFIG_ID = 'hide-price-app-config';
  const APP_PREFIX = 'hide-price-app';
  let config = null;
  let initialized = false;

  const DEFAULTS = {
    enabled: true,
    hideAddToCart: true,
    hideOnlyOutOfStock: true,
    customMessage: 'Price on Request',
  };

  const SELECTORS = {
    price: '.price, .product-price, .product__price, .money, .price-item, [data-price]',
    addToCart: '[name="add"], button[type="submit"], [data-add-to-cart]',
    productCard: '.product-card, .product-item, .grid__item, [data-product-card]',
    productPage: '.product, .product-single, [data-product], .product__info-wrapper, .product-form',
    productPagePrice: '.product__price, .price--large, .product-single__price, .product-form__price',
  };

  function loadConfig() {
    try {
      const el = document.getElementById(CONFIG_ID);
      config = el ? { ...DEFAULTS, ...JSON.parse(el.textContent) } : DEFAULTS;
    } catch (e) {
      config = DEFAULTS;
    }
  }

  function shouldHide(data) {
    if (!config.enabled || !config.hideOnlyOutOfStock) return config.enabled;
    if (!data) return false;
    if (data.available === false) return true;
    return data.variants?.every(v => !v.available || v.inventory_quantity <= 0);
  }

  function hidePrice(el) {
    if (el.dataset.priceHidden) return;
    el.dataset.priceHidden = '1';
    const msg = document.createElement('span');
    msg.className = `${APP_PREFIX}-message`;
    msg.textContent = config.customMessage;
    el.innerHTML = '';
    el.appendChild(msg);
  }

  function hideBtn(el) {
    if (!config.hideAddToCart) return;
    el.classList.add('hide-price-hidden');
    el.dataset.hidden = '1';
  }

  function getProductData(el) {
    // First check if we have currentProduct data from Liquid (most reliable)
    if (config.currentProduct) {
      return config.currentProduct;
    }

    // For collection pages, check DOM heuristics
    const badge = el.querySelector('.sold-out, .badge--sold-out, [class*="sold-out"]');
    if (badge || el.textContent.toLowerCase().includes('sold out')) {
      return { available: false };
    }

    const btn = el.querySelector(SELECTORS.addToCart);
    if (btn?.disabled || btn?.classList.contains('disabled')) {
      return { available: false };
    }

    // Check data attributes for product availability
    if (el.dataset.available === 'false') {
      return { available: false };
    }

    return null;
  }

  function processProductPage() {
    if (!config.hideOnProductPage) return;
    if (!config.currentProduct) return;

    if (shouldHide(config.currentProduct)) {
      // Hide all price elements on product page
      document.querySelectorAll(SELECTORS.productPagePrice).forEach(hidePrice);
      document.querySelectorAll(SELECTORS.price).forEach(el => {
        // Only hide if within product form/info area
        if (el.closest(SELECTORS.productPage)) {
          hidePrice(el);
        }
      });
      // Hide add to cart buttons
      document.querySelectorAll(SELECTORS.addToCart).forEach(el => {
        if (el.closest(SELECTORS.productPage)) {
          hideBtn(el);
        }
      });
    }
  }

  function processCards() {
    // Check if we should process collection/featured sections
    const isCollection = window.location.pathname.includes('/collections/');
    const isFeatured = !isCollection && document.querySelector(SELECTORS.productCard);

    if (isCollection && !config.hideOnCollection) return;
    if (isFeatured && !config.hideOnFeatured) return;

    document.querySelectorAll(SELECTORS.productCard).forEach(card => {
      const data = getProductData(card);
      if (shouldHide(data)) {
        card.querySelectorAll(SELECTORS.price).forEach(hidePrice);
        card.querySelectorAll(SELECTORS.addToCart).forEach(hideBtn);
      }
    });
  }

  function init() {
    if (initialized) return;
    loadConfig();
    if (!config.enabled) return;

    processProductPage();  // Handle main product page
    processCards();        // Handle collection/featured cards
    
    new MutationObserver(() => {
      clearTimeout(init.timer);
      init.timer = setTimeout(processCards, 100);
    }).observe(document.body, { childList: true, subtree: true });
    
    document.addEventListener('shopify:section:load', () => setTimeout(processCards, 100));
    initialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
