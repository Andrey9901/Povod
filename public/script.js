// Функция для фильтрации товаров
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // Инициализация счетчика корзины
    updateCartCount();

    // Слушаем ввод текста в поле поиска
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

    // Добавление товара в корзину
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product');
            const productName = product.querySelector('h3').textContent;
            const productPrice = product.querySelector('.price').textContent;

            // Проверяем, есть ли товар уже в корзине
            const existingItem = cartItems.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({ name: productName, price: productPrice, quantity: 1 });
            }

            // Обновляем localStorage
            localStorage.setItem('cart', JSON.stringify(cartItems));
            updateCartCount();
            alert(`${productName} добавлен в корзину!`);
        });
    });

    // Обновление счетчика корзины
    function updateCartCount() {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
});