const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const DETAILS_FILE = path.join(DATA_DIR, 'details.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize JSON files if they don't exist
function initializeFile(filePath, defaultContent) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
}

initializeFile(CARTS_FILE, []);
initializeFile(COMMENTS_FILE, {});
initializeFile(DETAILS_FILE, {});
initializeFile(LIKES_FILE, {});

// Helper functions to read/write JSON
function readJSON(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// API Routes

// Get all carts
app.get('/api/carts', (req, res) => {
    const carts = readJSON(CARTS_FILE);
    res.json(carts || []);
});

// Save cart
app.post('/api/carts', (req, res) => {
    const carts = readJSON(CARTS_FILE) || [];
    const newCart = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    carts.push(newCart);
    
    if (writeJSON(CARTS_FILE, carts)) {
        res.json({ success: true, cart: newCart });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save cart' });
    }
});

// Get comments for a product
app.get('/api/comments/:productId', (req, res) => {
    const comments = readJSON(COMMENTS_FILE) || {};
    res.json(comments[req.params.productId] || []);
});

// Add comment
app.post('/api/comments/:productId', (req, res) => {
    const comments = readJSON(COMMENTS_FILE) || {};
    const productId = req.params.productId;
    
    if (!comments[productId]) {
        comments[productId] = [];
    }
    
    const newComment = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    comments[productId].push(newComment);
    
    if (writeJSON(COMMENTS_FILE, comments)) {
        res.json({ success: true, comment: newComment });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save comment' });
    }
});

// Get likes
app.get('/api/likes', (req, res) => {
    const likes = readJSON(LIKES_FILE);
    res.json(likes || {});
});

// Update likes
app.post('/api/likes/:productId', (req, res) => {
    const likes = readJSON(LIKES_FILE) || {};
    const productId = req.params.productId;
    
    likes[productId] = req.body.count || 0;
    
    if (writeJSON(LIKES_FILE, likes)) {
        res.json({ success: true, count: likes[productId] });
    } else {
        res.status(500).json({ success: false, error: 'Failed to update likes' });
    }
});

// Save user details
app.post('/api/details', (req, res) => {
    const details = readJSON(DETAILS_FILE) || {};
    const sessionId = req.body.sessionId || Date.now().toString();
    
    details[sessionId] = {
        ...req.body,
        timestamp: new Date().toISOString()
    };
    
    if (writeJSON(DETAILS_FILE, details)) {
        res.json({ success: true, sessionId });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save details' });
    }
});

// Ping endpoint for keepalive
app.head('/', (req, res) => {
    res.status(200).end();
});

app.get('/ping', (req, res) => {
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
