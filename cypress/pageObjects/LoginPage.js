// cypress/pageObjects/LoginPage.js

class LoginPage {
    // Селекторы элементов
    get usernameInput() {
        return cy.get('#username');
    }

    get passwordInput() {
        return cy.get('#password');
    }

    get loginButton() {
        return cy.get('form#login-form button.auth-button[type="submit"]');
    }

    get registrationLink() {
        return cy.get('a[href="/register"]');
    }

    get pageTitle() {
        return cy.get('h1', { timeout: 10000 });
    }

    // Селекторы для сообщений об ошибках полей (согласно вашему login.html)
    get usernameError() {
        return cy.get('#username-error');
    }

    get passwordError() {
        return cy.get('#password-error');
    }

    get serverError() { // Общее сообщение об ошибке от сервера
        return cy.get('#server-error');
    }

    // Методы для взаимодействия со страницей
    visit() {
        cy.visit('/login');
        this.pageTitle.should('be.visible').and('contain', 'Вход');
        return this;
    }

    fillUsername(username) {
        this.usernameInput.should('be.visible').type(username);
        return this;
    }

    fillPassword(password) {
        this.passwordInput.should('be.visible').type(password);
        return this;
    }

    submitLoginForm() {
        this.loginButton.click();
    }

    // Комплексный метод для логина
    login(username, password) {
        this.fillUsername(username);
        this.fillPassword(password);
        this.submitLoginForm();
    }

    clickRegistrationLink() {
        this.registrationLink.click();
    }

    // Методы для проверки
    shouldShowLoginError(errorMessage) {
        this.serverError.should('be.visible').and('contain', errorMessage);
    }
}

export default new LoginPage();