// Elite 24 Finds - Product Display and Filtering

class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.displayProducts(this.products);
        this.updateLastUpdated();
    }

    async loadProducts() {
        try {
            const response = await fetch('products.json');
            if (response.ok) {
                this.products = await response.json();
            } else {
                this.showEmptyState('No products available yet. Check back soon!');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showEmptyState('Error loading products. Please refresh the page.');
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');

        searchInput.addEventListener('input', () => this.filterProducts());
        categoryFilter.addEventListener('change', () => this.filterProducts());
    }

    filterProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;

        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || product.category === category;
            return matchesSearch && matchesCategory;
        });

        this.displayProducts(this.filteredProducts);
    }

    displayProducts(products) {
        const grid = document.getElementById('productsGrid');

        if (products.length === 0) {
            this.showEmptyState('No products found. Try adjusting your search.');
            return;
        }

        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const savings = product.originalPrice - product.price;
        const savingsPercent = Math.round((savings / product.originalPrice) * 100);
        const rating = product.rating || 0;
        const stars = this.generateStars(rating);

        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.imageUrl}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/280x200?text=Product+Image'">
                    ${product.discount > 0 ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                </div>
                <div class="product-content">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.title}</h3>
                    
                    ${rating > 0 ? `
                        <div class="product-rating">
                            <span class="stars">${stars}</span>
                            <span>(${product.reviewCount || 0} reviews)</span>
                        </div>
                    ` : ''}
                    
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice > product.price ? `
                            <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
                        ` : ''}
                        ${savings > 0 ? `
                            <div class="savings">You save: $${savings.toFixed(2)} (${savingsPercent}%)</div>
                        ` : ''}
                    </div>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-features">
                        ${product.inStock ? '<span class="feature-badge">✓ In Stock</span>' : '<span class="feature-badge" style="background: #ffe8e8; color: #dc3545;">Out of Stock</span>'}
                        ${product.isPrime ? '<span class="feature-badge">⚡ Prime</span>' : ''}
                    </div>
                    
                    <div class="product-footer">
                        <a href="${product.affiliateUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                            View on Amazon
                        </a>
                        <button class="btn btn-secondary btn-small" onclick="shareProduct('${product.title}', '${product.affiliateUrl}')">
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '½';
        stars += '☆'.repeat(5 - Math.ceil(rating));
        return stars;
    }

    showEmptyState(message) {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = `
            <div class="empty-state">
                <h2>📦 ${message}</h2>
            </div>
        `;
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        });
        lastUpdatedElement.textContent = timeString + ' UTC';
    }
}

// Share functionality
function shareProduct(title, url) {
    if (navigator.share) {
        navigator.share({
            title: 'Elite 24 Finds',
            text: `Check out this deal: ${title}`,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        const text = `${title}\n${url}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Product link copied to clipboard!');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});
