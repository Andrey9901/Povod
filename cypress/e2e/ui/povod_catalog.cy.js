describe('Магазин Povod - UI Тесты Страницы Каталога', () => {

    beforeEach(() => {
        // Переходим на страницу каталога перед каждым тестом
        cy.visit('/catalog');
        cy.log('Переход на страницу каталога');
    });

    it('должен корректно отображать основные элементы страницы каталога', () => {
        cy.log('Проверка заголовка и основного описания...');

        // 1. Проверка главного заголовка
        cy.contains('h1', 'Каталог товаров').should('be.visible');

        // 2. Проверка подзаголовка
        cy.contains('p', 'Это povod создать свою идеальную одежду').should('be.visible');

        // 3. Проверка наличия основного блока с товарами
        // Уточняем селектор, чтобы выбрать первый .products, а не тот что в .collection
        cy.get('section.catalog-content > .container > .products')
            .should('be.visible');

        // 4. Проверка, что в основном блоке есть товары
        cy.get('section.catalog-content > .container > .products .product')
            .should('have.length.greaterThan', 0);

        cy.log('Основные элементы каталога отображаются.');
    });

    it('должен отображать детали конкретного товара (например, Свитшот)', () => {
        const productName = 'Вышивка на свитшоте';
        const productPrice = '2500 ₽'; // Убедись, что символ ₽ правильный
        cy.log(`Проверка деталей товара "${productName}"...`);

        // Находим блок продукта по его названию
        cy.contains('.product h3', productName) // Находим h3 с нужным текстом
            .closest('.product') // Находим родительский блок .product
            .should('be.visible') // Убеждаемся, что весь блок виден
            .within(() => { // Выполняем проверки внутри этого блока
                // Проверяем видимость изображения (можно по alt)
                cy.get('img[alt="Товар 1"]').should('be.visible');
                // Проверяем название еще раз (уже внутри блока)
                cy.get('h3').should('have.text', productName);
                // Проверяем цену
                cy.get('p.price').should('contain.text', productPrice); // Используем contain.text из-за возможных пробелов или символа валюты
                // Проверяем кнопку добавления в корзину
                cy.get('button.add-to-cart-button')
                    .should('be.visible')
                    .and('contain.text', 'Добавить в корзину');
            });

        cy.log(`Детали товара "${productName}" отображаются корректно.`);
    });

    it('должен отображать секцию коллекции "Патронус"', () => {
        cy.log('Проверка секции коллекции "Патронус"...');

        // 1. Находим блок коллекции
        cy.get('.collection').should('be.visible').within(() => {
            // 2. Проверяем заголовок коллекции
            cy.contains('h2', 'Коллекция "Патронус"').should('be.visible');
            // 3. Проверяем описание коллекции
            cy.contains('p', 'Особая коллекция для ценителей уникального стиля').should('be.visible');
            // 4. Проверяем наличие блока товаров внутри коллекции
            cy.get('.products').should('be.visible');
            // 5. Проверяем наличие товаров внутри коллекции
            cy.get('.products .product').should('have.length.greaterThan', 0);
            // 6. Проверяем детали конкретного товара в коллекции (например, Худи "Patronus")
            cy.contains('.product h3', 'Худи "Patronus"')
                .closest('.product')
                .within(() => {
                    cy.get('img[alt="Товар 4"]').should('be.visible');
                    cy.get('p.price').should('contain.text', '3500'); // Проверяем цену
                    cy.get('button.add-to-cart-button').should('be.visible');
                });
        });

        cy.log('Секция коллекции "Патронус" отображается корректно.');
    });

    it('должен позволять добавить товар в корзину', () => {
        const productName = 'Вышивка на худи';
        cy.log(`Тестирование добавления товара "${productName}" в корзину...`);

        // Предполагаем, что счетчик корзины виден и изначально равен '0' (из шапки)
        // Если шапки нет или счетчик ведет себя иначе, эту проверку нужно адаптировать
        cy.get('.cart-count').should('be.visible').invoke('text').then(initialCount => {
            cy.log(`Начальное значение счетчика корзины: ${initialCount}`);

            // Находим нужный товар и кнопку внутри него
            cy.contains('.product h3', productName)
                .closest('.product')
                .find('button.add-to-cart-button')
                .should('be.visible')
                .click(); // Кликаем "Добавить в корзину"

            cy.log(`Кнопка "Добавить в корзину" для товара "${productName}" нажата.`);

           
            const expectedCount = (parseInt(initialCount) + 1).toString();
            cy.get('.cart-count')
                .should('be.visible')
                // Можно добавить небольшую задержку или ожидание, если счетчик обновляется асинхронно
                // cy.wait(500); // Простая пауза (лучше избегать)
                // или ждать изменения текста (более надежно, если текст меняется не мгновенно)
                .should('not.have.text', initialCount, { timeout: 5000 }) // Ждем до 5 сек, пока текст НЕ равен старому значению
                .invoke('text')
                .should('eq', expectedCount); // Проверяем новое значение

            cy.log(`Счетчик корзины обновился на ${expectedCount}.`);

            // Опционально: можно перейти в корзину и проверить, что товар там появился
            // cy.get('a.cart-icon').click();
            // cy.url().should('include', '/cart'); // Замените на реальный URL корзины
            // cy.contains('.cart-item .item-name', productName).should('be.visible'); 
        });


    });

});