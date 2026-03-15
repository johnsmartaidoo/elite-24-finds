// Admin Dashboard JavaScript

const ADMIN_PASSWORD_KEY = 'elite24_admin_password';
const ANALYTICS_KEY = 'elite24_analytics';
const PRODUCTS_KEY = 'elite24_products';
const SETTINGS_KEY = 'elite24_settings';
const DEFAULT_ADMIN_PASSWORD = 'elite24admin123'; // Change this!

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    loadAnalytics();
    loadProducts();
    loadSettings();
});

function initializeAdmin() {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    
    if (password === storedPassword) {
        sessionStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').textContent = 'Invalid password';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('admin_logged_in');
    document.getElementById('adminPassword').value = '';
    showLogin();
}

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    updateDashboard();
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
}

function updateDashboard() {
    const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || { totalClicks: 0, clicks: [] };
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const lastUpdated = localStorage.getItem('last_updated') || 'Never';
    
    document.getElementById('totalClicks').textContent = analytics.totalClicks || 0;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('lastUpdatedTime').textContent = lastUpdated;
    document.getElementById('automationStatus').textContent = 'Active ✓';
    
    updateAnalyticsDisplay();
    updateProductsList();
}

function updateAnalyticsDisplay() {
    const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || { totalClicks: 0, productClicks: {} };
    const topProductsList = document.getElementById('topProductsList');
    
    // Get top 5 products by clicks
    const sortedProducts = Object.entries(analytics.productClicks || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    topProductsList.innerHTML = sortedProducts.map(([productId, clicks]) => `
        <div class="product-item">
            <span class="product-name">Product #${productId}</span>
            <span class="product-clicks">${clicks} clicks</span>
        </div>
    `).join('');
}

function updateProductsList() {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const productsList = document.getElementById('productsList');
    
    productsList.innerHTML = products.map((product, index) => `
        <div class="product-row">
            <div>${product.title}</div>
            <div>$${product.price}</div>
            <div>${product.category}</div>
            <div>${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}</div>
            <button onclick="deleteProduct(${index})">Delete</button>
        </div>
    `).join('');
}

function showAddProductForm() {
    document.getElementById('addProductForm').style.display = 'block';
}

function cancelAddProduct() {
    document.getElementById('addProductForm').style.display = 'none';
    clearProductForm();
}

function clearProductForm() {
    document.getElementById('productTitle').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productOriginalPrice').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productCategory').value = '';
}

function addProduct() {
    const title = document.getElementById('productTitle').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value);
    const imageUrl = document.getElementById('productImageUrl').value;
    const category = document.getElementById('productCategory').value;
    
    if (!title || !price || !originalPrice || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    
    const newProduct = {
        id: products.length + 1,
        title,
        description,
        price,
        originalPrice,
        discount,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        affiliateUrl: `https://amazon.com/s?k=${encodeURIComponent(title)}&tag=homestore0ba-20`,
        rating: 4.5,
        reviewCount: 100,
        inStock: true,
        isPrime: true
    };
    
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    
    cancelAddProduct();
    updateProductsList();
    alert('Product added successfully!');
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
        products.splice(index, 1);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        updateProductsList();
    }
}

function loadAnalytics() {
    // Initialize analytics if not exists
    if (!localStorage.getItem(ANALYTICS_KEY)) {
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify({
            totalClicks: 0,
            productClicks: {},
            clicks: []
        }));
    }
}

function loadProducts() {
    // Load products from main products.json
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            if (!localStorage.getItem(PRODUCTS_KEY)) {
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            }
            updateProductsList();
        });
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
        automationInterval: 1,
        associateId: 'homestore0ba-20',
        pinterestId: 'homestore0315'
    };
    
    document.getElementById('automationInterval').value = settings.automationInterval;
    document.getElementById('associateId').value = settings.associateId;
    document.getElementById('pinterestId').value = settings.pinterestId;
}

function saveSettings() {
    const settings = {
        automationInterval: parseInt(document.getElementById('automationInterval').value),
        associateId: document.getElementById('associateId').value,
        pinterestId: document.getElementById('pinterestId').value
    };
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    alert('Settings saved successfully!');
}

function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword').value;
    
    if (!newPassword || newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
    document.getElementById('newAdminPassword').value = '';
    alert('Admin password changed successfully!');
}

function runAutomationNow() {
    alert('Bot automation triggered! The bot will search for deals and update products.');
    localStorage.setItem('last_updated', new Date().toLocaleString());
    updateDashboard();
}

function exportData() {
    const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || {};
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    
    const data = {
        analytics,
        products,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elite24-data-${new Date().getTime()}.json`;
    link.click();
}

function clearAnalytics() {
    if (confirm('Are you sure you want to clear all analytics data?')) {
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify({
            totalClicks: 0,
            productClicks: {},
            clicks: []
        }));
        updateDashboard();
        alert('Analytics cleared successfully!');
    }
}

// Track clicks from main website
function trackClick(productId) {
    const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || {
        totalClicks: 0,
        productClicks: {}
    };
    
    analytics.totalClicks = (analytics.totalClicks || 0) + 1;
    analytics.productClicks[productId] = (analytics.productClicks[productId] || 0) + 1;
    analytics.clicks = analytics.clicks || [];
    analytics.clicks.push({
        productId,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 clicks
    if (analytics.clicks.length > 1000) {
        analytics.clicks = analytics.clicks.slice(-1000);
    }
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
}
