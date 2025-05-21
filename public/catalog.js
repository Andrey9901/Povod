document.addEventListener('DOMContentLoaded', () => {
    // Получаем все кнопки "Добавить в корзину"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productCard = event.target.closest('.product'); // Находим родительскую карточку товара
            const sizeSelect = productCard.querySelector('.size-select'); // Находим выпадающий список размеров
            const selectedSize = sizeSelect.value; // Получаем выбранный размер

            if (!selectedSize) {
                alert('Пожалуйста, выберите размер.');
                return;
            }

            // Здесь можно добавить товар в корзину
            console.log(`Товар добавлен в корзину. Размер: ${selectedSize}`);
        });
    });
});