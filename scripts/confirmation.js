// Confirmation page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get order data from session storage
    const orderData = sessionStorage.getItem('lastOrder');
    
    if (!orderData) {
        // No order found, redirect to menu
        window.location.href = 'menu.html';
        return;
    }
    
    const order = JSON.parse(orderData);
    
    // Display order number
    const orderNumberElement = document.getElementById('orderNumber');
    if (orderNumberElement) {
        orderNumberElement.textContent = order.orderNumber;
    }
    
    // Clear the order from session storage after displaying
    // sessionStorage.removeItem('lastOrder');
});
