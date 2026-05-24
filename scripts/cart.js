// Shopping cart management
const CART_KEY = 'foodhub_cart';
const CART_API_BASE = '/api/cart';

// Get cart items
function getCart() {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
}

// Save cart
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    syncCartToServer(cart);
}

// Add item to cart
function addToCart(item) {
    const cart = getCart();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    saveCart(cart);
    showNotification(`${item.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== itemId);
    saveCart(updatedCart);
}

// Update item quantity
function updateQuantity(itemId, quantity) {
    const cart = getCart();
    const item = cart.find(cartItem => cartItem.id === itemId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Clear cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    clearCartOnServer();
}

// Update cart badge
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCartItemCount();
        badge.textContent = count;
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

async function syncCartToServer(cart) {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) return;

    try {
        await fetch(CART_API_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '',
            },
            body: JSON.stringify({
                userEmail: currentUser.email,
                items: cart.map(item => ({
                    itemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category,
                })),
            }),
        });
    } catch (error) {
        console.error('Cart sync failed', error);
    }
}

async function loadCartFromServer() {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) return;

    try {
        const response = await fetch(`${CART_API_BASE}?userEmail=${encodeURIComponent(currentUser.email)}`, {
            headers: { Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '' },
        });
        if (!response.ok) return;

        const data = await response.json();
        if (!Array.isArray(data.items)) return;

        const normalized = data.items.map(item => ({
            id: item.itemId,
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.image || '',
            category: item.category || 'General',
        }));

        localStorage.setItem(CART_KEY, JSON.stringify(normalized));
        updateCartBadge();
    } catch (error) {
        console.error('Cart load failed', error);
    }
}

async function clearCartOnServer() {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) return;
    try {
        await fetch(`${CART_API_BASE}?userEmail=${encodeURIComponent(currentUser.email)}`, {
            method: 'DELETE',
            headers: { Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '' },
        });
    } catch (error) {
        console.error('Cart clear on server failed', error);
    }
}

// Initialize cart badge on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        updateCartBadge();
        loadCartFromServer();
    });
} else {
    updateCartBadge();
    loadCartFromServer();
}
