document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    updateCartCount();

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            const products = document.querySelectorAll('.product');

            products.forEach(product => {
                const title = product.querySelector('h3').textContent.toLowerCase();
                if (title.includes(query)) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product');
            const productName = product.querySelector('h3').textContent;
            const productPrice = product.querySelector('.price').textContent;
            const existingItem = cartItems.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({ name: productName, price: productPrice, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cartItems));
            updateCartCount();
            alert(`${productName} добавлен в корзину!`);
        });
    });

    function updateCartCount() {
        if (cartCount) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
            menu.classList.remove('active');
        }
    });
});