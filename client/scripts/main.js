// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load popular items (first 3 items from menu)
    const popularItemsContainer = document.getElementById('popularItems');
    
    if (popularItemsContainer) {
        const popularItems = menuItems.slice(0, 3);
        renderMenuItems(popularItems, popularItemsContainer);
    }
});

// Render menu items
function renderMenuItems(items, container) {
    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-category">${item.category}</span>
                    <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to add to cart buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            const item = menuItems.find(menuItem => menuItem.id === itemId);
            if (item) {
                addToCart(item);
            }
        });
    });
}
