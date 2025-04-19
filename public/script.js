// Функция для фильтрации товаров
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const products = document.querySelectorAll('.product');

    // Слушаем ввод текста в поле поиска
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        // Проходим по всем товарам
        products.forEach(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();

            // Показываем или скрываем товар в зависимости от совпадения
            if (title.includes(query)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });
});

