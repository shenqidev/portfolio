// Global Variables
let cart = [];
let products = [];
let ads = [];
let comments = {};
let likes = {};
let userDetails = {};
let pingInterval;
let startTime = Date.now();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    loadLocalStorage();
    await loadData();
    getUserDetails();
    initPingBot();
    displayProducts();
    displayAds();
    updateCartCount();
    updateCartDisplay();
    startUptimeCounter();
}

// Load data from localStorage
function loadLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedComments = localStorage.getItem('comments');
    const savedLikes = localStorage.getItem('likes');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedComments) comments = JSON.parse(savedComments);
    if (savedLikes) likes = JSON.parse(savedLikes);
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('comments', JSON.stringify(comments));
    localStorage.setItem('likes', JSON.stringify(likes));
}

// Load Products and Data
async function loadData() {
    // Products data with real pricing based on DigitalOcean and similar providers
    products = [
        {
            id: 'vps-basic',
            name: 'VPS Basic',
            description: 'Perfect for small projects and testing. Get started with reliable hosting.',
            price: 6.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
            features: [
                '1 vCPU Core',
                '1GB RAM',
                '25GB SSD Storage',
                '1TB Transfer',
                '99.9% Uptime',
                '24/7 Support'
            ]
        },
        {
            id: 'vps-standard',
            name: 'VPS Standard',
            description: 'Ideal for growing applications with more resources and better performance.',
            price: 12.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103658.png',
            features: [
                '2 vCPU Cores',
                '2GB RAM',
                '50GB SSD Storage',
                '2TB Transfer',
                '99.9% Uptime',
                'Priority Support'
            ]
        },
        {
            id: 'vps-premium',
            name: 'VPS Premium',
            description: 'High-performance hosting for demanding applications and heavy traffic.',
            price: 24.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103665.png',
            features: [
                '4 vCPU Cores',
                '8GB RAM',
                '160GB SSD Storage',
                '5TB Transfer',
                '99.99% Uptime',
                'Premium Support'
            ]
        },
        {
            id: 'admin-panel',
            name: 'Admin Panel',
            description: 'Complete control panel for managing your servers and services efficiently.',
            price: 15.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            features: [
                'Custom Dashboard',
                'User Management',
                'Server Monitoring',
                'Automated Backups',
                'Security Tools',
                'API Access'
            ]
        },
        {
            id: 'pterodactyl-unlimited',
            name: 'Pterodactyl Unlimited',
            description: 'Unlimited game server hosting with Pterodactyl panel. Host as many servers as you need.',
            price: 35.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/2972/2972351.png',
            features: [
                'Unlimited Servers',
                'Game Server Support',
                'Pterodactyl Panel',
                'Automated Updates',
                'DDoS Protection',
                'Full Root Access'
            ]
        },
        {
            id: 'vps-enterprise',
            name: 'VPS Enterprise',
            description: 'Enterprise-grade hosting with maximum resources for mission-critical applications.',
            price: 48.00,
            icon: 'https://cdn-icons-png.flaticon.com/512/2103/2103679.png',
            features: [
                '8 vCPU Cores',
                '16GB RAM',
                '320GB SSD Storage',
                '10TB Transfer',
                '99.99% Uptime',
                'Dedicated Support'
            ]
        }
    ];

    // Partner Ads
    ads = [
        {
            id: 'ad-1',
            name: 'DigitalOcean',
            description: 'Cloud Infrastructure for Developers',
            link: 'https://www.digitalocean.com',
            icon: 'https://www.vectorlogo.zone/logos/digitalocean/digitalocean-icon.svg'
        },
        {
            id: 'ad-2',
            name: 'Cloudflare',
            description: 'Web Performance & Security',
            link: 'https://www.cloudflare.com',
            icon: 'https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg'
        },
        {
            id: 'ad-3',
            name: 'AWS',
            description: 'Amazon Web Services Cloud',
            link: 'https://aws.amazon.com',
            icon: 'https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg'
        },
        {
            id: 'ad-4',
            name: 'Vultr',
            description: 'SSD Cloud Servers',
            link: 'https://www.vultr.com',
            icon: 'https://www.vectorlogo.zone/logos/vultr/vultr-icon.svg'
        },
        {
            id: 'ad-5',
            name: 'Linode',
            description: 'Simplified Cloud Computing',
            link: 'https://www.linode.com',
            icon: 'https://www.vectorlogo.zone/logos/linode/linode-icon.svg'
        }
    ];

    // Initialize comments and likes for products
    products.forEach(product => {
        if (!comments[product.id]) comments[product.id] = [];
        if (!likes[product.id]) likes[product.id] = 0;
    });
}

// Display Products
function displayProducts() {
    const carousel = document.getElementById('productsCarousel');
    carousel.innerHTML = '';

    products.forEach(product => {
        const card = createProductCard(product);
        carousel.appendChild(card);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    
    const isLiked = localStorage.getItem(`liked_${product.id}`) === 'true';
    
    card.innerHTML = `
        <div class="product-header">
            <div class="product-icon">
                <img src="${product.icon}" alt="${product.name}">
            </div>
        </div>
        <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}/mo</div>
            <ul class="product-features">
                ${product.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-secondary" onclick="showProductDetails('${product.id}')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
        <div class="product-engagement">
            <button class="engagement-btn ${isLiked ? 'active' : ''}" onclick="toggleLike('${product.id}')" id="like-${product.id}">
                <i class="fas fa-heart"></i>
                <span id="like-count-${product.id}">${likes[product.id] || 0}</span>
            </button>
            <button class="engagement-btn" onclick="showComments('${product.id}')">
                <i class="fas fa-comment"></i>
                <span>${(comments[product.id] || []).length}</span>
            </button>
        </div>
    `;
    
    return card;
}

// Display Ads
function displayAds() {
    const carousel = document.getElementById('adsCarousel');
    carousel.innerHTML = '';

    ads.forEach(ad => {
        const card = createAdCard(ad);
        carousel.appendChild(card);
    });
}

// Create Ad Card
function createAdCard(ad) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    
    card.innerHTML = `
        <div class="product-header">
            <div class="product-icon">
                <img src="${ad.icon}" alt="${ad.name}" onerror="this.src='https://via.placeholder.com/80'">
            </div>
        </div>
        <div class="product-body">
            <h3>${ad.name}</h3>
            <p>${ad.description}</p>
            <div class="product-actions">
                <a href="${ad.link}" target="_blank" class="btn btn-primary" style="text-decoration: none; display: block; text-align: center;">
                    <i class="fas fa-external-link-alt"></i> Visit Site
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Carousel Navigation
function moveCarousel(direction, carouselId) {
    const carousel = document.getElementById(carouselId + 'Carousel');
    const scrollAmount = 380;
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    saveToLocalStorage();
    updateCartCount();
    updateCartDisplay();
    
    showNotification('Added to cart!', 'success');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveToLocalStorage();
    updateCartCount();
    updateCartDisplay();
    
    showNotification('Removed from cart', 'info');
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Update Cart Display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-gray);">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item fade-in">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}/mo</div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Place Order
async function placeOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const orderDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        userDetails: userDetails,
        orderDate: new Date().toISOString(),
        orderId: 'ORD-' + Date.now()
    };

    // Save order locally
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Create Telegram message
    const message = `
🛒 NEW ORDER - ${orderDetails.orderId}

👤 Customer Details:
IP: ${userDetails.ip || 'N/A'}
Location: ${userDetails.location || 'N/A'}
Device: ${userDetails.device || 'N/A'}
Browser: ${userDetails.browser || 'N/A'}

📦 Order Items:
${cart.map(item => `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}/mo`).join('\n')}

💰 Total: $${orderDetails.total.toFixed(2)}/mo

🕐 Order Time: ${new Date().toLocaleString()}
    `.trim();

    // Simulate sending to Telegram (you would need a bot token and chat ID)
    console.log('Order placed:', message);
    
    // Show success message
    alert(`Order placed successfully!\n\nOrder ID: ${orderDetails.orderId}\n\nThe owner will contact you via Telegram (@shenxioff) shortly.`);
    
    // Clear cart
    cart = [];
    saveToLocalStorage();
    updateCartCount();
    updateCartDisplay();
    
    showNotification('Order placed successfully!', 'success');
}

// Toggle Like
function toggleLike(productId) {
    const likeBtn = document.getElementById(`like-${productId}`);
    const likeCount = document.getElementById(`like-count-${productId}`);
    const isLiked = localStorage.getItem(`liked_${productId}`) === 'true';

    if (isLiked) {
        likes[productId] = Math.max(0, (likes[productId] || 0) - 1);
        localStorage.removeItem(`liked_${productId}`);
        likeBtn.classList.remove('active');
    } else {
        likes[productId] = (likes[productId] || 0) + 1;
        localStorage.setItem(`liked_${productId}`, 'true');
        likeBtn.classList.add('active');
    }

    likeCount.textContent = likes[productId];
    saveToLocalStorage();
}

// Show Comments
function showComments(productId) {
    const product = products.find(p => p.id === productId);
    const productComments = comments[productId] || [];

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${product.name} - Comments</h2>
        <div class="comments-section">
            <div id="commentsList">
                ${productComments.length === 0 ? '<p>No comments yet. Be the first to comment!</p>' : 
                    productComments.map(c => `
                        <div class="comment">
                            <div class="comment-author">${c.author}</div>
                            <div class="comment-text">${c.text}</div>
                            <div style="font-size: 0.8em; color: var(--text-gray); margin-top: 5px;">
                                ${new Date(c.date).toLocaleString()}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
            <div class="comment-form">
                <textarea id="commentText" placeholder="Write your comment..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="submitComment('${productId}')">
                    <i class="fas fa-paper-plane"></i> Submit Comment
                </button>
            </div>
        </div>
    `;

    document.getElementById('productModal').style.display = 'block';
}

// Submit Comment
function submitComment(productId) {
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        showNotification('Please enter a comment', 'error');
        return;
    }

    if (!comments[productId]) comments[productId] = [];
    
    comments[productId].push({
        author: 'User' + Math.floor(Math.random() * 1000),
        text: commentText,
        date: new Date().toISOString()
    });

    saveToLocalStorage();
    showComments(productId);
    displayProducts(); // Refresh to update comment count
    showNotification('Comment added!', 'success');
}

// Show Product Details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="product-details">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${product.icon}" alt="${product.name}" style="width: 100px; height: 100px;">
            </div>
            <h2>${product.name}</h2>
            <p style="font-size: 1.2em; margin: 20px 0;">${product.description}</p>
            <div class="product-price" style="text-align: center; margin: 30px 0;">
                $${product.price.toFixed(2)}/mo
            </div>
            <h3>Features:</h3>
            <ul class="product-features">
                ${product.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
            <div style="margin-top: 30px; text-align: center;">
                <button class="btn btn-primary" onclick="addToCart('${product.id}'); closeModal();" style="padding: 15px 40px; font-size: 1.2em;">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    document.getElementById('productModal').style.display = 'block';
}

// Close Modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Get User Details
async function getUserDetails() {
    try {
        // Get IP and location
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userDetails.ip = ipData.ip;
        document.getElementById('userIP').textContent = ipData.ip;

        // Get location data
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const geoData = await geoResponse.json();
            userDetails.location = `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Unknown'}`;
            document.getElementById('userLocation').textContent = userDetails.location;
        } catch (e) {
            document.getElementById('userLocation').textContent = 'Unknown';
        }

        // Browser detection
        const ua = navigator.userAgent;
        let browserName = 'Unknown';
        if (ua.indexOf('Firefox') > -1) browserName = 'Firefox';
        else if (ua.indexOf('Chrome') > -1) browserName = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browserName = 'Safari';
        else if (ua.indexOf('Edge') > -1) browserName = 'Edge';
        
        userDetails.browser = browserName;
        document.getElementById('userBrowser').textContent = browserName;

        // Device detection
        const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
        userDetails.device = isMobile ? 'Mobile' : 'Desktop';
        document.getElementById('userDevice').textContent = userDetails.device;

        // Connection type
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        userDetails.connectionType = connection ? connection.effectiveType : 'Unknown';
        document.getElementById('connectionType').textContent = userDetails.connectionType;

        // Timezone
        userDetails.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        document.getElementById('userTimezone').textContent = userDetails.timezone;

        // Proxy detection (basic)
        const isProxy = false; // This would need more sophisticated detection
        document.getElementById('proxyStatus').textContent = isProxy ? 'Detected' : 'Not Detected';

        // Battery
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                const charging = battery.charging ? ' (Charging)' : '';
                userDetails.battery = level + '%' + charging;
                document.getElementById('batteryLevel').textContent = level + '%' + charging;
            });
        } else {
            document.getElementById('batteryLevel').textContent = 'N/A';
        }

    } catch (error) {
        console.error('Error getting user details:', error);
    }
}

// PingBot - Keep server alive
function initPingBot() {
    const currentUrl = window.location.origin;
    
    // Ping after 5 seconds
    setTimeout(() => {
        pingServer(currentUrl);
    }, 5000);

    // Ping every 14 minutes (Render free tier timeout is 15 minutes)
    pingInterval = setInterval(() => {
        pingServer(currentUrl);
    }, 14 * 60 * 1000);
}

async function pingServer(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (response.ok) {
            statusDot.classList.add('online');
            statusText.textContent = 'Online';
            console.log('Ping successful at', new Date().toLocaleTimeString());
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Offline';
        }
    } catch (error) {
        console.error('Ping failed:', error);
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        statusDot.classList.remove('online');
        statusText.textContent = 'Error';
    }
}

// Uptime Counter
function startUptimeCounter() {
    setInterval(() => {
        const uptime = Date.now() - startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('uptimeDisplay').textContent = `${hours}h ${minutes}m`;
    }, 1000);
}

// Music Controls
let musicPlaying = false;

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const musicStatus = document.getElementById('musicStatus');
    
    if (musicPlaying) {
        music.pause();
        musicStatus.textContent = 'Play Music';
        musicPlaying = false;
    } else {
        music.play();
        musicStatus.textContent = 'Pause Music';
        musicPlaying = true;
    }
}

function changeVolume(value) {
    const music = document.getElementById('bgMusic');
    music.volume = value / 100;
}

// Notification System
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary-color)'};
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideDown 0.3s ease;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeModal();
    }
}
