// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!requireAuth()) {
        return;
    }
    
    // Check if cart is empty
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'menu.html';
        return;
    }
    
    // Render order summary
    renderCheckoutSummary();
    
    // Handle form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        // Pre-fill email with current user's email
        const currentUser = getCurrentUser();
        if (currentUser) {
            document.getElementById('email').value = currentUser.email;
        }
        
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCheckout();
        });
    }
});

// Render checkout summary
function renderCheckoutSummary() {
    const cart = getCart();
    const checkoutItems = document.getElementById('checkoutItems');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div>
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Update summary totals
    const subtotal = getCartTotal();
    const tax = subtotal * 0.1;
    const delivery = 5.00;
    const total = subtotal + tax + delivery;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('delivery').textContent = `$${delivery.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Handle checkout
async function handleCheckout() {
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value,
        notes: document.getElementById('notes').value,
    };
    
    // Validate form (basic validation)
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
        alert('Please fill in all payment information');
        return;
    }
    
    try {
        const currentUser = getCurrentUser();
        const payload = {
            userEmail: currentUser?.email || formData.email,
            customerInfo: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                notes: formData.notes,
            },
            payment: {
                cardNumber: formData.cardNumber,
                expiry: formData.expiry,
            },
            items: getCart().map(item => ({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                category: item.category,
            })),
            notes: formData.notes,
        };

        const response = await fetch(apiUrl('/api/checkout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '',
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Checkout failed');
        }

        sessionStorage.setItem('lastOrder', JSON.stringify({
            orderNumber: data.orderNumber,
            items: payload.items,
            total: data.total || calculateTotal(),
            customerInfo: formData,
            timestamp: new Date().toISOString(),
        }));
        clearCart();
        window.location.href = 'confirmation.html';
    } catch (error) {
        alert(error.message || 'Checkout failed');
    }
}

// Calculate total
function calculateTotal() {
    const subtotal = getCartTotal();
    const tax = subtotal * 0.1;
    const delivery = 5.00;
    return subtotal + tax + delivery;
}
