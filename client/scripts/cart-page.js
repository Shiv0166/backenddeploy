// Cart page functionality
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    
    // Checkout button event listener
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            // Check if user is logged in
            if (!getCurrentUser()) {
                alert('Please login to proceed to checkout');
                window.location.href = 'login.html';
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }
});

// Render cart items
function renderCart() {
    const cart = getCart();
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        cartSummary.style.display = 'block';
        
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Update summary
        updateCartSummary();
        
        // Add event listeners
        addCartEventListeners();
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = getCartTotal();
    const tax = subtotal * 0.1;
    const delivery = 5.00;
    const total = subtotal + tax + delivery;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('delivery').textContent = `$${delivery.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Add event listeners to cart buttons
function addCartEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const action = this.getAttribute('data-action');
            const cart = getCart();
            const item = cart.find(cartItem => cartItem.id === itemId);
            
            if (item) {
                if (action === 'increase') {
                    updateQuantity(itemId, item.quantity + 1);
                } else if (action === 'decrease') {
                    updateQuantity(itemId, item.quantity - 1);
                }
                renderCart();
            }
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to remove this item?')) {
                removeFromCart(itemId);
                renderCart();
            }
        });
    });
}
