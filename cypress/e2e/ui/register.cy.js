describe('Магазин Povod - Тесты Страницы Регистрации', () => {

    beforeEach(() => {
        // Переходим на страницу регистрации перед каждым тестом
        cy.visit('/register');
        cy.log('Переход на страницу регистрации (/register)');
    });

    it('должен корректно отображать элементы страницы регистрации', () => {
        cy.log('Проверка отображения элементов формы регистрации...');

        // Логотип и заголовок
        cy.get('img.auth-logo').should('be.visible');
        cy.contains('h1', 'Регистрация').should('be.visible');

        // Поля формы
        cy.contains('label[for="username"]', 'Имя пользователя:').should('be.visible');
        cy.get('input#username').should('be.visible').and('have.attr', 'placeholder', 'Введите имя пользователя');

        cy.contains('label[for="email"]', 'Email:').should('be.visible');
        cy.get('input#email').should('be.visible').and('have.attr', 'placeholder', 'Введите email');

        cy.contains('label[for="password"]', 'Пароль:').should('be.visible');
        cy.get('input#password').should('be.visible').and('have.attr', 'placeholder', 'Введите пароль');
        cy.contains('small', 'Минимум 8 символов').should('be.visible'); // Проверка подсказки

        cy.contains('label[for="confirm-password"]', 'Подтвердите пароль:').should('be.visible');
        cy.get('input#confirm-password').should('be.visible').and('have.attr', 'placeholder', 'Повторите пароль');

        // Кнопка и ссылка
        cy.contains('button.auth-button', 'Зарегистрироваться').should('be.visible');
        cy.contains('p.auth-link', 'Уже есть аккаунт?').should('be.visible');
        cy.contains('a[href="/login"]', 'Войдите').should('be.visible');

        cy.log('Все основные элементы страницы регистрации отображаются.');
    });

    it('должен переходить на страницу входа при клике на ссылку "Войдите"', () => {
        cy.log('Проверка перехода на страницу входа...');

        cy.contains('a[href="/login"]', 'Войдите').click();

        // Проверяем URL
        cy.url().should('include', '/login');

        // Проверяем заголовок на новой странице
        cy.contains('h1', 'Вход').should('be.visible');

        cy.log('Успешный переход на страницу входа.');
    });

    it('должен показывать alert, если пароли не совпадают', () => {
        cy.log('Тестирование несовпадения паролей...');

        // Перехватываем и проверяем alert
        cy.on('window:alert', (text) => {
            expect(text).to.contains('Пароли не совпадают.');
        });

        cy.get('#username').type('testuser');
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('ValidPassword123!');
        cy.get('#confirm-password').type('DifferentPassword123!'); // Несовпадающий пароль
        cy.contains('button.auth-button', 'Зарегистрироваться').click();

        // Убедимся, что остались на странице регистрации
        cy.url().should('include', '/register');
        cy.log('Alert о несовпадении паролей должен был появиться.');
    });

    it('должен показывать alert, если пароль короче 8 символов', () => {
        cy.log('Тестирование короткого пароля...');

        cy.on('window:alert', (text) => {
            expect(text).to.contains('Пароль должен содержать не менее 8 символов.');
        });

        cy.get('#username').type('testuser');
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('Pass1!'); // Короткий пароль
        cy.get('#confirm-password').type('Pass1!');
        cy.contains('button.auth-button', 'Зарегистрироваться').click();

        cy.url().should('include', '/register');
        cy.log('Alert о коротком пароле должен был появиться.');
    });

    it('должен показывать alert, если пароль не соответствует требованиям сложности', () => {
        cy.log('Тестирование сложности пароля (только буквы)...');

        cy.on('window:alert', (text) => {
            expect(text).to.contains('Пароль должен содержать хотя бы одну заглавную букву, строчную букву, цифру и специальный символ.');
        });

        cy.get('#username').type('testuser');
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('password'); // Не соответствует требованиям
        cy.get('#confirm-password').type('password');
        cy.contains('button.auth-button', 'Зарегистрироваться').click();

        cy.url().should('include', '/register');
        cy.log('Alert о сложности пароля должен был появиться.');
    });



    it('должен успешно отправлять форму при вводе валидных данных', () => {
        cy.log('Тестирование сценария с валидными данными...');

        // Генерируем уникальное имя пользователя или email, чтобы избежать конфликтов при повторных запусках
        const uniqueId = Date.now();
        const validUsername = `user_${uniqueId}`;
        const validEmail = `user_${uniqueId}@example.com`;
        const validPassword = 'ValidPassword123!';

        cy.get('#username').type(validUsername);
        cy.get('#email').type(validEmail);
        cy.get('#password').type(validPassword);
        cy.get('#confirm-password').type(validPassword); // Совпадающий пароль
        cy.contains('button.auth-button', 'Зарегистрироваться').click();

        cy.url().should('not.include', '/register'); // Убедимся, что ушли со страницы регистрации
        cy.url().should('include', '/login'); // Пример: ожидаем переход на страницу входа

        cy.log('Форма отправлена с валидными данными. Ожидается перенаправление.');
    });

});