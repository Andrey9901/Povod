describe('Магазин Povod - UI Тесты Главной Страницы', () => {

    beforeEach(() => {
        // Посещаем главную страницу перед каждым тестом
        cy.visit('/');
        cy.log('Переход на главную страницу');
    });

    it('должен корректно загружать главную страницу и отображать элементы шапки', () => {
        cy.log('Проверка заголовка страницы и элементов шапки...');

        // 1. Проверка заголовка страницы
        cy.title().should('eq', 'Povod - Магазин одежды');

        // 2. Проверка видимости логотипа
        cy.get('.logo').should('be.visible');

        // 3. Проверка видимости ссылок в меню навигации
        cy.contains('nav a', 'Каталог').should('be.visible');
        cy.contains('nav a', 'Конструктор').should('be.visible');
        cy.contains('nav a', 'О нас').should('be.visible');

        // 4. Проверка видимости иконок действий в шапке
        cy.get('a.action-icon:has(.fa-search)').should('be.visible'); // Поиск
        cy.get('a.action-icon[href="/login"]').should('be.visible'); // Логин
        cy.get('a.cart-icon').should('be.visible'); // Корзина

        // 5. Проверка начального значения счетчика корзины
        cy.get('.cart-count').should('be.visible').and('have.text', '0');

        cy.log('Заголовок страницы и элементы шапки видны.');
    });

    it('должен корректно отображать содержимое главного баннера', () => {
        cy.log('Проверка содержимого главного баннера...');

        // 1. Проверка заголовка баннера
        cy.get('.banner h1').should('be.visible').and('have.text', 'POVOD');

        // 2. Проверка текста (слогана) в баннере
        cy.get('.banner p')
            .should('be.visible')
            .and('contain.text', 'Потому что стиль — это не просто одежда, это твоя история.');

        // 3. Проверка кнопки "КУПИТЬ СЕЙЧАС"
        cy.contains('.banner a.btn', 'КУПИТЬ СЕЙЧАС')
            .should('be.visible')
            .and('have.attr', 'href', '/catalog');

        cy.log('Содержимое баннера отображается корректно.');
    });

    it('должен отображать секцию популярных товаров', () => {
        cy.log('Проверка секции популярных товаров...');

        // 1. Проверка заголовка секции
        cy.contains('h2', 'Популярные товары').should('be.visible');

        // 2. Проверка подзаголовка секции
        cy.contains('.product-collection p', 'Зачем ждать повода, если ты уже им стал?').should('be.visible');

        // 3. Проверка наличия контейнера для товаров
        cy.get('.products').should('be.visible');

        // 4. Проверка наличия хотя бы одного товара
        cy.get('.products .product').should('have.length.greaterThan', 0);
        // Проверка конкретных товаров по alt тексту
        cy.get('.products img[alt="Товар 1"]').should('be.visible');
        cy.get('.products img[alt="Товар 2"]').should('be.visible');
        cy.get('.products img[alt="Товар 3"]').should('be.visible');

        cy.log('Секция популярных товаров отображается.');
    });

    it('должен отображать footer', () => {
        cy.log('Проверка содержимого подвала...');

        // 1. Проверка видимости подвала
        cy.get('footer.footer').should('be.visible');

        // 2. Проверка текста копирайта
        cy.contains('footer p', '© 2025 Povod. Все права защищены.').should('be.visible');

        cy.log('Подвал отображается корректно.');
    });

    it('должен переходить на страницу Каталога при клике на кнопку в баннере', () => {
        cy.log('Тестирование перехода с кнопки баннера...');

        // Кликаем на кнопку "КУПИТЬ СЕЙЧАС"
        cy.contains('.banner a.btn', 'КУПИТЬ СЕЙЧАС').click();

        // Проверяем, что URL изменился и содержит '/catalog'
        cy.url().should('include', '/catalog');

        cy.log('Успешный переход на /catalog');
    });

    it('должен переходить на страницу Логина при клике на иконку пользователя', () => {
        cy.log('Тестирование перехода на страницу логина...');

        // Кликаем на иконку пользователя
        cy.get('a.action-icon[href="/login"]').click();

        // Проверяем, что URL изменился и содержит '/login'
        cy.url().should('include', '/login');

        cy.log('Успешный переход на /login');
    });

});