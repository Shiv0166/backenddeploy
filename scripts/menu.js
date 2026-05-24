// Menu page functionality
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    const menuGrid = document.getElementById('menuGrid');
    const categoryFilter = document.querySelector('.category-filter');
    const categories = ['all', ...new Set(menuItems.map(item => item.category))];
    
    renderCategoryButtons(categories, categoryFilter, menuGrid);

    // Initial render
    renderMenuItems(menuItems, menuGrid);
});

function renderCategoryButtons(categories, categoryFilter, menuGrid) {
    if (!categoryFilter) return;
    categoryFilter.innerHTML = categories
        .map((category, index) => `
            <button class="filter-btn ${index === 0 ? 'active' : ''}" data-category="${category}">
                ${category === 'all' ? 'All' : category}
            </button>
        `)
        .join('');

    const filterButtons = categoryFilter.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            currentCategory = category;

            const filteredItems = category === 'all'
                ? menuItems
                : menuItems.filter(item => item.category === category);

            renderMenuItems(filteredItems, menuGrid);
        });
    });
}

// Render menu items
function renderMenuItems(items, container) {
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 2rem;">No items found in this category.</p>';
        return;
    }
    
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
