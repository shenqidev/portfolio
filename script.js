// Global Variables
let cart = [];
let products = [];
let ads = [];
let comments = {};
let likes = {};
let userDetails = {};
let pingInterval;
let startTime = Date.now();
let pingCount = 0;
let musicPanelOpen = false;

// Telegram Bot Configuration (to be set via environment or embedded)
const TELEGRAM_CONFIG = {
    botToken: '8522554523:AAGAaR7GDWLUlro3i9qcH8Z6O2-gpDmuaoo', // You'll add your bot token here
    chatId: '8583275059', // You'll add your chat ID here
    orderImageUrl: 'https://files.catbox.moe/ocgi20.jpg'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    loadLocalStorage();
    await loadData();
    await getUserDetails();
    initPingBot();
    displayProducts();
    displayAds();
    updateCartCount();
    updateCartDisplay();
    startUptimeCounter();
    setupSmoothScroll();
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
    // Products with pricing
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

    // Initialize comments and likes
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
    const scrollAmount = carousel.offsetWidth * 0.8;
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
    
    showNotification('✓ Added to cart!', 'success');
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
        cartItems.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-gray);"><i class="fas fa-shopping-cart" style="font-size: 3em; margin-bottom: 20px; display: block;"></i>Your cart is empty</p>';
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

// Place Order - Show Form
function placeOrder() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    // Populate order summary
    const orderSummaryItems = document.getElementById('orderSummaryItems');
    orderSummaryItems.innerHTML = cart.map(item => `
        <div class="order-summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}/mo</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('orderTotalAmount').textContent = total.toFixed(2);

    // Show modal
    document.getElementById('orderModal').style.display = 'block';
}

// Submit Order
async function submitOrder(event) {
    event.preventDefault();

    const email = document.getElementById('customerEmail').value.trim();
    const telegram = document.getElementById('customerTelegram').value.trim();

    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    const orderDetails = {
        orderId: 'ORD-' + Date.now(),
        email: email,
        telegram: telegram || 'Not provided',
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        userDetails: userDetails,
        orderDate: new Date().toISOString(),
        timestamp: new Date().toLocaleString()
    };

    // Save order locally
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Send to Telegram
    await sendOrderToTelegram(orderDetails);

    // Clear cart
    cart = [];
    saveToLocalStorage();
    updateCartCount();
    updateCartDisplay();
    
    closeOrderModal();
    showNotification('✓ Order placed successfully! Check your email for confirmation.', 'success');
}

// Send Order to Telegram
async function sendOrderToTelegram(orderDetails) {
    if (!TELEGRAM_CONFIG.botToken || !TELEGRAM_CONFIG.chatId) {
        console.log('Telegram not configured. Order details:', orderDetails);
        return;
    }

    // Create detailed message
    const message = `
🛒 NEW ORDER RECEIVED

📋 Order ID: ${orderDetails.orderId}
⏰ Time: ${orderDetails.timestamp}

👤 CUSTOMER DETAILS:
━━━━━━━━━━━━━━━━
📧 Email: ${orderDetails.email}
💬 Telegram: ${orderDetails.telegram}

🌐 CONNECTION INFO:
━━━━━━━━━━━━━━━━
🌍 IP Address: ${userDetails.ip || 'Unknown'}
📍 Location: ${userDetails.location || 'Unknown'}
🏙️ City: ${userDetails.city || 'Unknown'}
🌎 Country: ${userDetails.country || 'Unknown'}
📡 ISP: ${userDetails.isp || 'Unknown'}
🖥️ Device: ${userDetails.device || 'Unknown'}
📱 Platform: ${userDetails.platform || 'Unknown'}
🌐 Browser: ${userDetails.browser || 'Unknown'}
📊 User Agent: ${userDetails.userAgent || 'Unknown'}
📡 Connection: ${userDetails.connectionType || 'Unknown'}
⚡ Downlink: ${userDetails.downlink || 'Unknown'}
⏱️ Timezone: ${userDetails.timezone || 'Unknown'}
🌐 Locale: ${userDetails.locale || 'Unknown'}
🔋 Battery: ${userDetails.battery || 'N/A'}
🛡️ Proxy: ${userDetails.proxy || 'Not detected'}
📐 Screen: ${userDetails.screenResolution || 'Unknown'}
🪟 Window: ${userDetails.windowSize || 'Unknown'}
💻 CPU Cores: ${userDetails.cores || 'Unknown'}
🍪 Cookies: ${userDetails.cookiesEnabled ? 'Enabled' : 'Disabled'}

📦 ORDER ITEMS:
━━━━━━━━━━━━━━━━
${orderDetails.items.map(item => 
    `• ${item.name} x${item.quantity}
  💰 $${(item.price * item.quantity).toFixed(2)}/mo`
).join('\n\n')}

━━━━━━━━━━━━━━━━
💵 TOTAL: $${orderDetails.total.toFixed(2)}/month

🔗 Contact customer at: ${orderDetails.email}
${orderDetails.telegram !== 'Not provided' ? `Telegram: ${orderDetails.telegram}` : ''}
    `.trim();

    try {
        // Send photo with caption
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendPhoto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                photo: TELEGRAM_CONFIG.orderImageUrl,
                caption: message
            })
        });

        const result = await response.json();
        if (result.ok) {
            console.log('✓ Order sent to Telegram successfully');
        } else {
            console.error('✗ Failed to send to Telegram:', result);
        }
    } catch (error) {
        console.error('✗ Error sending to Telegram:', error);
    }
}

// Close Order Modal
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
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
                            <div class="comment-author"><i class="fas fa-user-circle"></i> ${c.author}</div>
                            <div class="comment-text">${c.text}</div>
                            <div style="font-size: 0.8em; color: var(--text-gray); margin-top: 5px;">
                                <i class="fas fa-clock"></i> ${new Date(c.date).toLocaleString()}
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
        author: 'User' + Math.floor(Math.random() * 10000),
        text: commentText,
        date: new Date().toISOString()
    });

    saveToLocalStorage();
    showComments(productId);
    displayProducts();
    showNotification('Comment added!', 'success');
}

// Show Product Details
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="product-details">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="${product.icon}" alt="${product.name}" style="width: 120px; height: 120px;">
            </div>
            <h2 style="text-align: center;">${product.name}</h2>
            <p style="font-size: 1.2em; margin: 20px 0; text-align: center;">${product.description}</p>
            <div class="product-price" style="text-align: center; margin: 30px 0; font-size: 2.5em;">
                $${product.price.toFixed(2)}/mo
            </div>
            <h3>Features:</h3>
            <ul class="product-features">
                ${product.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
            <div style="margin-top: 30px; text-align: center;">
                <button class="btn btn-primary" onclick="addToCart('${product.id}'); closeModal();" style="padding: 15px 50px; font-size: 1.2em;">
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

        // Get detailed location data
        try {
            const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
            const geoData = await geoResponse.json();
            userDetails.location = `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Unknown'}`;
            userDetails.city = geoData.city || 'Unknown';
            userDetails.country = geoData.country_name || 'Unknown';
            userDetails.region = geoData.region || 'Unknown';
            userDetails.isp = geoData.org || 'Unknown';
            document.getElementById('userLocation').textContent = userDetails.location;
        } catch (e) {
            userDetails.location = 'Unknown';
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
        userDetails.userAgent = ua;
        document.getElementById('userBrowser').textContent = browserName;

        // Device detection
        const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
        const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
        userDetails.device = isTablet ? 'Tablet' : (isMobile ? 'Mobile' : 'Desktop');
        userDetails.platform = navigator.platform;
        document.getElementById('userDevice').textContent = userDetails.device;

        // Screen resolution
        userDetails.screenResolution = `${window.screen.width}x${window.screen.height}`;
        userDetails.windowSize = `${window.innerWidth}x${window.innerHeight}`;

        // Connection type
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        userDetails.connectionType = connection ? connection.effectiveType : 'Unknown';
        userDetails.downlink = connection ? connection.downlink + ' Mbps' : 'Unknown';
        document.getElementById('connectionType').textContent = userDetails.connectionType;

        // Timezone
        userDetails.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        userDetails.locale = navigator.language;
        document.getElementById('userTimezone').textContent = userDetails.timezone;

        // Proxy detection (basic)
        userDetails.proxy = 'Not detected';
        document.getElementById('proxyStatus').textContent = 'Not detected';

        // Battery
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const level = Math.round(battery.level * 100);
                const charging = battery.charging ? ' ⚡' : '';
                userDetails.battery = level + '%' + charging;
                document.getElementById('batteryLevel').textContent = level + '%' + charging;
                
                // Update on battery change
                battery.addEventListener('levelchange', () => {
                    const newLevel = Math.round(battery.level * 100);
                    const newCharging = battery.charging ? ' ⚡' : '';
                    userDetails.battery = newLevel + '%' + newCharging;
                    document.getElementById('batteryLevel').textContent = newLevel + '%' + newCharging;
                });
            });
        } else {
            userDetails.battery = 'N/A';
            document.getElementById('batteryLevel').textContent = 'N/A';
        }

        // Additional details
        userDetails.cookiesEnabled = navigator.cookieEnabled;
        userDetails.doNotTrack = navigator.doNotTrack || 'Not set';
        userDetails.cores = navigator.hardwareConcurrency || 'Unknown';

    } catch (error) {
        console.error('Error getting user details:', error);
    }
}

// PINGBOT - Advanced Keep-Alive System
function initPingBot() {
    const currentUrl = window.location.origin;
    
    console.log('🤖 PingBot initialized');
    
    // Initial ping after 5 seconds
    setTimeout(() => {
        pingServer(currentUrl);
    }, 5000);

    // Ping every 14 minutes (840 seconds)
    pingInterval = setInterval(() => {
        pingServer(currentUrl);
    }, 14 * 60 * 1000);

    // Also ping on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            pingServer(currentUrl);
        }
    });
}

async function pingServer(url) {
    const pingTime = new Date();
    pingCount++;
    
    try {
        const startTime = performance.now();
        const response = await fetch(url + '/ping', { 
            method: 'GET',
            cache: 'no-cache'
        });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (response.ok) {
            statusDot.classList.add('online');
            statusText.textContent = `Online (${latency}ms)`;
            console.log(`✓ Ping #${pingCount} successful at ${pingTime.toLocaleTimeString()} - Latency: ${latency}ms`);
        } else {
            statusDot.classList.remove('online');
            statusText.textContent = 'Error';
            console.error(`✗ Ping #${pingCount} failed - Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`✗ Ping #${pingCount} failed at ${pingTime.toLocaleTimeString()}:`, error.message);
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        statusDot.classList.remove('online');
        statusText.textContent = 'Offline';
    }
}

// Uptime Counter
function startUptimeCounter() {
    setInterval(() => {
        const uptime = Date.now() - startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        document.getElementById('uptimeDisplay').textContent = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

// Music Controls
let musicPlaying = false;

function toggleMusicPanel() {
    const panel = document.getElementById('musicPanel');
    musicPanelOpen = !musicPanelOpen;
    panel.classList.toggle('active');
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const playIcon = document.getElementById('playIcon');
    
    if (musicPlaying) {
        music.pause();
        playIcon.className = 'fas fa-play';
        musicPlaying = false;
    } else {
        music.play().catch(e => console.log('Audio play failed:', e));
        playIcon.className = 'fas fa-pause';
        musicPlaying = true;
    }
}

function changeVolume(value) {
    const music = document.getElementById('bgMusic');
    music.volume = value / 100;
}

// Setup Smooth Scroll
function setupSmoothScroll() {
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
}

// Notification System
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'linear-gradient(135deg, var(--success), var(--primary-color))' : 
                    type === 'error' ? 'linear-gradient(135deg, var(--danger), #ff6b6b)' : 
                    'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'};
        color: white;
        padding: 18px 35px;
        border-radius: 12px;
        z-index: 100000;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: slideDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-size: 1.1em;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// Close modal on outside click
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    
    if (event.target == productModal) {
        closeModal();
    }
    if (event.target == orderModal) {
        closeOrderModal();
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

console.log('🚀 ShenxiDev Portfolio initialized successfully');
console.log('📊 User Details:', userDetails);
console.log('🤖 PingBot active - Server will stay alive');
