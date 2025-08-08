// Main application logic
class SouvenirApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8001/api';
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.cart = [];
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.filters = {
            category: 'all',
            priceRange: 'all',
            sort: 'featured',
            bestsellersOnly: false,
            inStockOnly: false,
            search: ''
        };
        this.viewMode = 'grid';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderPriceRanges();
        this.renderProducts();
        this.renderBestsellers();
        this.updateCartUI();
        this.updateWishlistUI();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        const menuIcon = document.getElementById('menuIcon');

        mobileMenuBtn?.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
            const isOpen = !mobileNav.classList.contains('hidden');
            menuIcon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        // Search functionality
        const searchInputs = [
            document.getElementById('searchInput'),
            document.getElementById('mobileSearchInput')
        ];

        searchInputs.forEach(input => {
            input?.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                // Sync search inputs
                searchInputs.forEach(syncInput => {
                    if (syncInput !== e.target) {
                        syncInput.value = e.target.value;
                    }
                });
                this.filterProducts();
            });
        });

        // Cart functionality
        const cartButtons = [
            document.getElementById('cartBtn'),
            document.getElementById('mobileCartBtn'),
            document.getElementById('buyNowBtn')
        ];

        cartButtons.forEach(btn => {
            btn?.addEventListener('click', () => {
                this.openCart();
            });
        });

        document.getElementById('cartCloseBtn')?.addEventListener('click', () => {
            this.closeCart();
        });

        // Cart overlay click outside to close
        document.getElementById('cartOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'cartOverlay') {
                this.closeCart();
            }
        });

        // Filter functionality
        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.filterProducts();
        });

        document.getElementById('bestsellersOnly')?.addEventListener('change', (e) => {
            this.filters.bestsellersOnly = e.target.checked;
            this.filterProducts();
        });

        document.getElementById('inStockOnly')?.addEventListener('change', (e) => {
            this.filters.inStockOnly = e.target.checked;
            this.filterProducts();
        });

        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // View mode toggle
        const viewButtons = [
            { button: document.getElementById('gridViewBtn'), sibling: document.getElementById('listViewBtn') },
            { button: document.getElementById('desktopGridViewBtn'), sibling: document.getElementById('desktopListViewBtn') }
        ];

        viewButtons.forEach(({ button, sibling }) => {
            button?.addEventListener('click', () => {
                this.viewMode = 'grid';
                button.classList.add('active');
                sibling?.classList.remove('active');
                this.updateViewMode();
            });

            sibling?.addEventListener('click', () => {
                this.viewMode = 'list';
                sibling.classList.add('active');
                button?.classList.remove('active');
                this.updateViewMode();
            });
        });

        // Mobile filter overlay
        document.getElementById('mobileFilterBtn')?.addEventListener('click', () => {
            this.openFilters();
        });

        document.getElementById('filterCloseBtn')?.addEventListener('click', () => {
            this.closeFilters();
        });

        document.getElementById('filterOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'filterOverlay') {
                this.closeFilters();
            }
        });

        // Checkout functionality
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.proceedToCheckout();
        });
    }

    renderCategories() {
        const categoryFilters = document.getElementById('categoryFilters');
        if (!categoryFilters) return;

        const categoryHTML = categories.map(category => `
            <label class="filter-option category-option">
                <input type="checkbox" class="filter-checkbox" data-category="${category.id}" ${category.id === 'all' ? 'checked' : ''}>
                <span>${category.name}</span>
                <span class="category-count">${category.count}</span>
            </label>
        `).join('');

        categoryFilters.innerHTML = categoryHTML;

        // Add event listeners
        categoryFilters.querySelectorAll('input[data-category]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Uncheck other categories
                    categoryFilters.querySelectorAll('input[data-category]').forEach(otherInput => {
                        if (otherInput !== e.target) {
                            otherInput.checked = false;
                        }
                    });
                    this.filters.category = e.target.dataset.category;
                } else {
                    // If unchecked, default to 'all'
                    this.filters.category = 'all';
                    categoryFilters.querySelector('input[data-category="all"]').checked = true;
                }
                this.filterProducts();
            });
        });
    }

    renderPriceRanges() {
        const priceFilters = document.getElementById('priceFilters');
        if (!priceFilters) return;

        const priceHTML = priceRanges.map(range => `
            <label class="filter-option">
                <input type="checkbox" class="filter-checkbox" data-price="${range.id}" ${range.id === 'all' ? 'checked' : ''}>
                <span>${range.name}</span>
            </label>
        `).join('');

        priceFilters.innerHTML = priceHTML;

        // Add event listeners
        priceFilters.querySelectorAll('input[data-price]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // Uncheck other price ranges
                    priceFilters.querySelectorAll('input[data-price]').forEach(otherInput => {
                        if (otherInput !== e.target) {
                            otherInput.checked = false;
                        }
                    });
                    this.filters.priceRange = e.target.dataset.price;
                } else {
                    // If unchecked, default to 'all'
                    this.filters.priceRange = 'all';
                    priceFilters.querySelector('input[data-price="all"]').checked = true;
                }
                this.filterProducts();
            });
        });
    }

    renderBestsellers() {
        const bestsellersGrid = document.getElementById('bestsellersGrid');
        if (!bestsellersGrid) return;

        const bestsellerProducts = this.products.filter(product => product.bestseller).slice(0, 4);
        
        bestsellersGrid.innerHTML = bestsellerProducts.map(product => this.createProductCard(product)).join('');
        
        // Add event listeners to bestseller cards
        this.addProductCardListeners(bestsellersGrid);
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        if (!productsGrid) return;

        // Show loading state
        loadingState.style.display = 'flex';
        emptyState.style.display = 'none';
        productsGrid.innerHTML = '';

        // Simulate loading delay
        setTimeout(() => {
            loadingState.style.display = 'none';
            
            if (this.filteredProducts.length === 0) {
                emptyState.style.display = 'flex';
            } else {
                emptyState.style.display = 'none';
                productsGrid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
                this.addProductCardListeners(productsGrid);
            }

            // Update results title
            const resultsTitle = document.getElementById('resultsTitle');
            if (resultsTitle) {
                resultsTitle.textContent = `All Products (${this.filteredProducts.length})`;
            }
        }, 300);
    }

    createProductCard(product) {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        const isInWishlist = this.wishlist.includes(product.id);

        return `
            <div class="product-card fade-in">
                ${product.bestseller ? '<div class="product-badge">Bestseller</div>' : ''}
                
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>

                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>

                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>

                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">${product.rating} (${product.reviews})</span>
                    </div>

                    <div class="product-pricing">
                        <div class="price-section">
                            <div class="price-row">
                                <span class="current-price">Rs. ${product.price}</span>
                                ${product.originalPrice > product.price ? 
                                    `<span class="original-price">Rs. ${product.originalPrice}</span>` : ''}
                            </div>
                            ${discountPercent > 0 ? 
                                `<div class="discount-badge">${discountPercent}% OFF</div>` : ''}
                        </div>
                    </div>

                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${product.id}" ${product.inStock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${product.inStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        
                        ${product.inStock > 0 && product.inStock <= 5 ? 
                            `<p class="stock-warning">Only ${product.inStock} left in stock!</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        
        return Array(fullStars).fill('<i class="fas fa-star star"></i>').join('') +
               Array(emptyStars).fill('<i class="fas fa-star star empty"></i>').join('');
    }

    addProductCardListeners(container) {
        // Add to cart listeners
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId);
            });
        });

        // Wishlist listeners
        container.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.toggleWishlist(productId);
            });
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.inStock) {
                existingItem.quantity += 1;
                this.showToast(`Updated ${product.name} quantity in cart!`, 'success');
            } else {
                this.showToast(`Cannot add more ${product.name}. Stock limit reached.`, 'error');
                return;
            }
        } else {
            this.cart.push({ ...product, quantity: 1 });
            this.showToast(`Added ${product.name} to cart!`, 'success');
        }

        this.saveCart();
        this.updateCartUI();
        this.updateFloatingButton();
    }

    toggleWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const index = this.wishlist.indexOf(productId);
        
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showToast(`Removed ${product.name} from wishlist!`, 'success');
        } else {
            this.wishlist.push(productId);
            this.showToast(`Added ${product.name} to wishlist!`, 'success');
        }

        this.saveWishlist();
        this.updateWishlistUI();
        this.renderProducts();
        this.renderBestsellers();
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity === 0) {
            this.removeFromCart(productId);
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
            this.updateFloatingButton();
        }
    }

    removeFromCart(productId) {
        const product = this.cart.find(item => item.id === productId);
        if (product) {
            this.showToast(`Removed ${product.name} from cart!`, 'success');
        }
        
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.updateFloatingButton();
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.updateFloatingButton();
    }

    updateCartUI() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalSavings = this.cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

        // Update cart counts
        document.querySelectorAll('[id$="CartCount"]').forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });

        // Update cart title
        const cartTitle = document.getElementById('cartTitle');
        if (cartTitle) {
            cartTitle.textContent = `Shopping Cart (${totalItems})`;
        }

        // Show/hide cart content
        const cartEmpty = document.getElementById('cartEmpty');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        if (this.cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartItems.style.display = 'none';
            cartFooter.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
            cartFooter.style.display = 'block';

            // Render cart items
            cartItems.innerHTML = this.cart.map(item => this.createCartItem(item)).join('');
            this.addCartItemListeners();

            // Update totals
            document.getElementById('cartSubtotal').textContent = `Rs. ${totalPrice}`;
            document.getElementById('cartTotal').textContent = `Rs. ${totalPrice}`;
            
            const savingsRow = document.getElementById('cartSavingsRow');
            if (totalSavings > 0) {
                document.getElementById('cartSavings').textContent = `Rs. ${totalSavings}`;
                savingsRow.style.display = 'flex';
            } else {
                savingsRow.style.display = 'none';
            }
        }
    }

    createCartItem(item) {
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">Rs. ${item.price} each</p>
                    
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase" data-product-id="${item.id}" ${item.quantity >= item.inStock ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <button class="remove-btn" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-total">
                        <p class="item-total-price">Rs. ${item.price * item.quantity}</p>
                        ${item.originalPrice > item.price ? 
                            `<p class="item-savings">You save Rs. ${(item.originalPrice - item.price) * item.quantity}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addCartItemListeners() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.quantity-btn').dataset.productId);
                const action = e.target.closest('.quantity-btn').dataset.action;
                const cartItem = this.cart.find(item => item.id === productId);
                
                if (cartItem) {
                    const newQuantity = action === 'increase' ? 
                        cartItem.quantity + 1 : 
                        Math.max(0, cartItem.quantity - 1);
                    
                    this.updateCartQuantity(productId, newQuantity);
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.remove-btn').dataset.productId);
                this.removeFromCart(productId);
            });
        });
    }

    updateWishlistUI() {
        const wishlistCount = this.wishlist.length;
        
        document.querySelectorAll('[id$="WishlistCount"]').forEach(el => {
            el.textContent = wishlistCount;
        });

        // Update wishlist buttons in product cards
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            if (this.wishlist.includes(productId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateFloatingButton() {
        const floatingBtn = document.getElementById('floatingBuyBtn');
        const buyNowText = document.getElementById('buyNowText');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            floatingBtn.style.display = 'block';
            buyNowText.textContent = `Buy Now • ${totalItems} item${totalItems > 1 ? 's' : ''}`;
        } else {
            floatingBtn.style.display = 'none';
        }
    }

    filterProducts() {
        let filtered = [...this.products];

        // Search filter
        if (this.filters.search) {
            const query = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === this.filters.category);
        }

        // Price range filter
        if (this.filters.priceRange !== 'all') {
            const range = priceRanges.find(r => r.id === this.filters.priceRange);
            if (range) {
                filtered = filtered.filter(product => 
                    product.price >= range.min && 
                    (range.max === Infinity || product.price <= range.max)
                );
            }
        }

        // Bestseller filter
        if (this.filters.bestsellersOnly) {
            filtered = filtered.filter(product => product.bestseller);
        }

        // Stock filter
        if (this.filters.inStockOnly) {
            filtered = filtered.filter(product => product.inStock > 0);
        }

        // Sorting
        switch (this.filters.sort) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'popularity':
                filtered.sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                // Featured - bestsellers first, then by rating
                filtered.sort((a, b) => {
                    if (a.bestseller && !b.bestseller) return -1;
                    if (!a.bestseller && b.bestseller) return 1;
                    return b.rating - a.rating;
                });
        }

        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateFilterBadge();
    }

    updateFilterBadge() {
        const activeFiltersCount = [
            this.filters.category !== 'all',
            this.filters.priceRange !== 'all',
            this.filters.sort !== 'featured',
            this.filters.bestsellersOnly,
            this.filters.inStockOnly,
            this.filters.search !== ''
        ].filter(Boolean).length;

        document.querySelectorAll('[id$="FilterBadge"]').forEach(badge => {
            badge.textContent = activeFiltersCount;
            badge.style.display = activeFiltersCount > 0 ? 'block' : 'none';
        });

        const filterBadge = document.getElementById('filterBadge');
        if (filterBadge) {
            filterBadge.textContent = activeFiltersCount;
            filterBadge.style.display = activeFiltersCount > 0 ? 'inline' : 'none';
        }
    }

    clearFilters() {
        this.filters = {
            category: 'all',
            priceRange: 'all',
            sort: 'featured',
            bestsellersOnly: false,
            inStockOnly: false,
            search: ''
        };

        // Reset UI elements
        document.getElementById('sortSelect').value = 'featured';
        document.getElementById('bestsellersOnly').checked = false;
        document.getElementById('inStockOnly').checked = false;
        document.querySelectorAll('#searchInput, #mobileSearchInput').forEach(input => {
            input.value = '';
        });

        // Reset checkboxes
        document.querySelectorAll('input[data-category]').forEach(input => {
            input.checked = input.dataset.category === 'all';
        });
        document.querySelectorAll('input[data-price]').forEach(input => {
            input.checked = input.dataset.price === 'all';
        });

        this.filterProducts();
    }

    updateViewMode() {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.className = `products-grid ${this.viewMode}-view`;
        }
    }

    openCart() {
        const cartOverlay = document.getElementById('cartOverlay');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartOverlay = document.getElementById('cartOverlay');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    openFilters() {
        const filterOverlay = document.getElementById('filterOverlay');
        const mobileFilterContent = document.getElementById('mobileFilterContent');
        const desktopFilter = document.querySelector('.filter-card');
        
        // Clone desktop filter content to mobile
        mobileFilterContent.innerHTML = desktopFilter.innerHTML;
        
        // Reattach event listeners for mobile filters
        this.setupMobileFilterListeners();
        
        filterOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeFilters() {
        const filterOverlay = document.getElementById('filterOverlay');
        filterOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    setupMobileFilterListeners() {
        const mobileContent = document.getElementById('mobileFilterContent');
        
        // Sort select
        mobileContent.querySelector('#sortSelect')?.addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            document.getElementById('sortSelect').value = e.target.value;
            this.filterProducts();
        });

        // Additional filters
        mobileContent.querySelector('#bestsellersOnly')?.addEventListener('change', (e) => {
            this.filters.bestsellersOnly = e.target.checked;
            document.getElementById('bestsellersOnly').checked = e.target.checked;
            this.filterProducts();
        });

        mobileContent.querySelector('#inStockOnly')?.addEventListener('change', (e) => {
            this.filters.inStockOnly = e.target.checked;
            document.getElementById('inStockOnly').checked = e.target.checked;
            this.filterProducts();
        });

        // Category filters
        mobileContent.querySelectorAll('input[data-category]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.category = e.target.dataset.category;
                    
                    // Sync with desktop
                    document.querySelectorAll('input[data-category]').forEach(desktopInput => {
                        desktopInput.checked = desktopInput.dataset.category === this.filters.category;
                    });
                    
                    // Uncheck other mobile categories
                    mobileContent.querySelectorAll('input[data-category]').forEach(otherInput => {
                        if (otherInput !== e.target) {
                            otherInput.checked = false;
                        }
                    });
                    
                    this.filterProducts();
                }
            });
        });

        // Price filters
        mobileContent.querySelectorAll('input[data-price]').forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.priceRange = e.target.dataset.price;
                    
                    // Sync with desktop
                    document.querySelectorAll('input[data-price]').forEach(desktopInput => {
                        desktopInput.checked = desktopInput.dataset.price === this.filters.priceRange;
                    });
                    
                    // Uncheck other mobile prices
                    mobileContent.querySelectorAll('input[data-price]').forEach(otherInput => {
                        if (otherInput !== e.target) {
                            otherInput.checked = false;
                        }
                    });
                    
                    this.filterProducts();
                }
            });
        });

        // Clear filters
        mobileContent.querySelector('#clearFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }

    proceedToCheckout() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        this.showToast(`Proceeding to checkout with ${totalItems} items worth Rs. ${totalPrice}`, 'success');
        
        // In a real app, redirect to checkout page
        // window.location.href = '/checkout';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');

        // Set content
        toastMessage.textContent = message;
        
        // Set icon and style based on type
        if (type === 'success') {
            toastIcon.className = 'toast-icon fas fa-check-circle';
            toast.className = 'toast success';
        } else if (type === 'error') {
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
            toast.className = 'toast error';
        }

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SouvenirApp();
    
    // Make app globally accessible for debugging
    window.souvenirApp = app;
});