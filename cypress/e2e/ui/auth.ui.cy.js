﻿import LoginPage from '../../pageObjects/LoginPage';
import RegistrationPage from '../../pageObjects/RegistrationPage';
import ProfilePage from '../../pageObjects/ProfilePage';
import Header from '../../pageObjects/Header';

describe('UI Тесты - Аутентификация пользователя (с POM)', () => {
    const runTimestamp = Date.now();

    // Функция для генерации тестовых данных пользователя
    const generateUserData = (testIdPrefix) => {
        const safePrefix = testIdPrefix.length > 12 ? testIdPrefix.substring(0, 12) : testIdPrefix;
        return {
            username: `${safePrefix}_${runTimestamp}`,
            email: `${safePrefix}_${runTimestamp}@ex.com`,
            password: 'Password123!',
            confirmPassword: 'Password123!'
        };
    };

    it('должен успешно регистрировать нового пользователя, выполнять вход и выход', () => {
        const userData = generateUserData('fullflow');

        LoginPage.visit();
        LoginPage.clickRegistrationLink();

        RegistrationPage.pageTitle.should('contain', 'Регистрация');
        RegistrationPage.register(userData);

        cy.url({ timeout: 10000 }).should('include', '/login');
        LoginPage.pageTitle.should('contain', 'Вход');
        LoginPage.login(userData.username, userData.password);

        cy.url({ timeout: 10000 }).should('include', '/profile');
        ProfilePage.shouldDisplayUserName(userData.username);
        ProfilePage.shouldDisplayUserEmail(userData.email);
        ProfilePage.checkHeaderNavigation();

        Header.logoutLink.should('be.visible').click();

        cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
        Header.loginIconLink.should('be.visible');
    });

    it('должен показывать ошибку при попытке логина с неверным паролем', () => {
        const apiUserData = generateUserData('apifail');

        cy.request({ method: 'POST', url: '/auth/register', body: { ...apiUserData, confirmPassword: apiUserData.password } })
            .its('status').should('eq', 201);

        LoginPage.visit();
        LoginPage.login(apiUserData.username, 'WrongPassword123!');

        cy.url({ timeout: 5000 }).should('include', '/login');
        LoginPage.shouldShowLoginError('Неверное имя пользователя или пароль'); // Это сообщение от сервера
    });

    describe('Негативные сценарии - Регистрация', () => {
        beforeEach(() => {
            // Добавляем novalidate к форме перед каждым тестом в этом блоке,
            // чтобы наша JS валидация точно отрабатывала и заполняла <small> теги.
            RegistrationPage.visit();
            RegistrationPage.usernameInput.closest('form').invoke('attr', 'novalidate', 'novalidate');
        });

        it('должен показывать ошибки валидации при отправке пустой формы регистрации', () => {
            RegistrationPage.submitRegistrationForm();
            RegistrationPage.usernameError.should('be.visible').and('contain', 'Имя пользователя: 3-30 символов.');
            RegistrationPage.emailError.should('be.visible').and('contain', 'Введите корректный email.');
            RegistrationPage.passwordError.should('be.visible').and('contain', 'Пароль: минимум 8 символов.');
            RegistrationPage.confirmPasswordError.should('be.visible');
            cy.url().should('include', '/register');
        });

        it('должен показывать ошибку, если поле "Подтвердите пароль" пустое, а поле "Пароль" заполнено', () => {
            RegistrationPage.fillUsername('testuser_confempty'); // Имя валидной длины
            RegistrationPage.fillEmail('confempty@example.com');
            RegistrationPage.fillPassword('Password123!');
            // Оставляем confirmPassword пустым
            RegistrationPage.submitRegistrationForm();
            // В этом случае password ('Password123!') !== confirmPassword ('') -> true
            RegistrationPage.confirmPasswordError.should('be.visible').and('contain', 'Пароли не совпадают.');
            cy.url().should('include', '/register');
        });

        it('должен показывать ошибку при несовпадающих паролях (оба не пустые)', () => {
            RegistrationPage.fillUsername('testuser_nomatch'); // Имя валидной длины
            RegistrationPage.fillEmail('nomatch@example.com');
            RegistrationPage.fillPassword('Password123!');
            RegistrationPage.fillConfirmPassword('Password321@');
            RegistrationPage.submitRegistrationForm();
            RegistrationPage.confirmPasswordError.should('be.visible').and('contain', 'Пароли не совпадают.');
            cy.url().should('include', '/register');
        });

        it('должен показывать ошибку сервера при попытке регистрации с существующим именем пользователя', () => {
            const existingUserData = generateUserData('exUser'); // Используем короткий префикс
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: { ...existingUserData, confirmPassword: existingUserData.password }
            }).its('status').should('eq', 201);

            RegistrationPage.visit(); // beforeEach уже сделал visit, но для ясности можно
            RegistrationPage.usernameInput.closest('form').invoke('attr', 'novalidate', 'novalidate'); // Убедимся, что JS валидация сработает

            RegistrationPage.fillUsername(existingUserData.username); // Валидное имя (по длине)
            RegistrationPage.fillEmail(`another_${runTimestamp}@example.com`);
            RegistrationPage.fillPassword(existingUserData.password);
            RegistrationPage.fillConfirmPassword(existingUserData.password);
            RegistrationPage.submitRegistrationForm();
            RegistrationPage.serverError.should('contain', 'Имя пользователя уже используется');
            cy.url().should('include', '/register');
        });

        it('должен показывать ошибку сервера при попытке регистрации с существующим email', () => {
            const existingEmailData = generateUserData('exEmail'); 
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: { ...existingEmailData, confirmPassword: existingEmailData.password }
            }).its('status').should('eq', 201);

            RegistrationPage.visit();
            RegistrationPage.usernameInput.closest('form').invoke('attr', 'novalidate', 'novalidate');

            RegistrationPage.fillUsername(`another_${runTimestamp}`); 
            RegistrationPage.fillEmail(existingEmailData.email);
            RegistrationPage.fillPassword(existingEmailData.password);
            RegistrationPage.fillConfirmPassword(existingEmailData.password);
            RegistrationPage.submitRegistrationForm();

            RegistrationPage.serverError.should('contain', 'Email уже используется');
            cy.url().should('include', '/register');
        });
    });

    describe('Негативные сценарии - Логин', () => {
        beforeEach(() => {
            LoginPage.visit();
            LoginPage.usernameInput.closest('form').invoke('attr', 'novalidate', 'novalidate');
        });

        it('должен показывать ошибку при попытке входа с несуществующим именем пользователя', () => {
            LoginPage.login(`nonexistent_${Date.now()}`, 'Password123!');
            LoginPage.shouldShowLoginError('Неверное имя пользователя или пароль');
            cy.url().should('include', '/login');
        });

        it('должен показывать ошибки валидации при отправке пустой формы логина', () => {
            LoginPage.submitLoginForm();
            LoginPage.usernameError.should('be.visible').and('contain', 'Введите имя пользователя.');
            LoginPage.passwordError.should('be.visible').and('contain', 'Введите пароль.');
            cy.url().should('include', '/login');
        });
    });
});