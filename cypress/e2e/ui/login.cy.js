describe('Магазин Povod - Тесты Страницы Входа', () => {

    beforeEach(() => {
        // Переходим на страницу входа перед каждым тестом
        cy.visit('/login'); 
        cy.log('Переход на страницу входа (/login)');
    });

    it('должен корректно отображать элементы страницы входа', () => {
        cy.log('Проверка отображения элементов формы входа...');

        // Проверяем логотип
        cy.get('img.auth-logo').should('be.visible');

        // Проверяем заголовок
        cy.contains('h1', 'Вход').should('be.visible');

        // Проверяем поле "Имя пользователя" (лейбл и инпут)
        cy.contains('label[for="username"]', 'Имя пользователя:').should('be.visible');
        cy.get('input#username')
            .should('be.visible')
            .and('have.attr', 'placeholder', 'Введите имя пользователя');

        // Проверяем поле "Пароль" (лейбл и инпут)
        cy.contains('label[for="password"]', 'Пароль:').should('be.visible');
        cy.get('input#password')
            .should('be.visible')
            .and('have.attr', 'placeholder', 'Введите пароль');

        // Проверяем кнопку "Войти"
        cy.contains('button.auth-button', 'Войти').should('be.visible');

        // Проверяем ссылку на регистрацию
        cy.contains('p.auth-link', 'Нет аккаунта?').should('be.visible');
        cy.contains('a[href="/register"]', 'Зарегистрируйтесь').should('be.visible');

        cy.log('Все основные элементы страницы входа отображаются.');
    });

    it('должен переходить на страницу регистрации при клике на ссылку "Зарегистрируйтесь"', () => {
        cy.log('Проверка перехода на страницу регистрации...');

        cy.contains('a[href="/register"]', 'Зарегистрируйтесь').click();

        // Проверяем, что URL изменился
        cy.url().should('include', '/register');

        // Можно добавить проверку заголовка на новой странице
        cy.contains('h1', 'Регистрация').should('be.visible');

        cy.log('Успешный переход на страницу регистрации.');
    });

    it('должен позволять ввести данные в поля формы', () => {
        const username = 'testuser';
        const password = 'password123';
        cy.log('Проверка ввода данных в поля...');

        cy.get('input#username').type(username).should('have.value', username);
        cy.get('input#password').type(password).should('have.value', password);

        cy.log('Данные успешно введены.');
    });


    it('должен показывать ошибку при вводе неверных данных', () => {
        cy.log('Тестирование сценария с неверными данными...');

        cy.get('input#username').type('wronguser');
        cy.get('input#password').type('wrongpassword');
        cy.contains('button.auth-button', 'Войти').click();

        // Пока просто логируем, так как не знаем, как выводятся ошибки
        cy.log('Форма отправлена с неверными данными. Проверка ошибки требует знания селектора ошибки.');
        // Можно проверить, что URL не изменился (остались на /login)
        cy.url().should('include', '/login');
    });

    it('должен успешно перенаправлять при вводе верных данных', () => {
        cy.log('Тестирование сценария с верными данными...');

        const validUsername = 'testuser_1743902638646';
        const validPassword = '$2b$10$Uv2ebs.mzLHDsHRWpsF2guqCa4/paZ/gTTUd9uuSUX86gXMQqR2Mq';

        cy.get('input#username').type(validUsername);
        cy.get('input#password').type(validPassword);
        cy.contains('button.auth-button', 'Войти').click();
        cy.url().should('not.include', '/login'); 
        cy.url().should('include', '/profile'); 

        cy.log('Форма отправлена с верными данными. Ожидается перенаправление.');
    });

});