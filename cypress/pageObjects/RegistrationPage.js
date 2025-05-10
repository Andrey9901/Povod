// cypress/pageObjects/RegistrationPage.js

class RegistrationPage {
    // Селекторы
    get pageTitle() {
        return cy.get('h1', { timeout: 10000 });
    }

    get usernameInput() {
        return cy.get('#username');
    }

    get emailInput() {
        return cy.get('#email');
    }

    get passwordInput() {
        return cy.get('#password');
    }

    get confirmPasswordInput() {
        return cy.get('#confirm-password');
    }

    get registerButton() {
        return cy.get('form#register-form button.auth-button[type="submit"]');
    }

    get loginLink() {
        return cy.get('a[href="/login"]');
    }

    // Селекторы для сообщений об ошибках полей (согласно вашему register.html)
    get usernameError() {
        return cy.get('#username-error');
    }

    get emailError() {
        return cy.get('#email-error');
    }

    get passwordError() {
        return cy.get('#password-error');
    }

    get confirmPasswordError() {
        return cy.get('#confirm-password-error');
    }

    get serverError() { // Общее сообщение об ошибке от сервера
        return cy.get('#server-error');
    }

    // Методы
    visit() {
        cy.visit('/register');
        this.pageTitle.should('be.visible').and('contain', 'Регистрация');
        return this;
    }

    fillUsername(username) {
        this.usernameInput.should('be.visible').type(username);
        return this;
    }

    fillEmail(email) {
        this.emailInput.should('be.visible').type(email);
        return this;
    }

    fillPassword(password) {
        this.passwordInput.should('be.visible').type(password);
        return this;
    }

    fillConfirmPassword(password) {
        this.confirmPasswordInput.should('be.visible').type(password);
        return this;
    }

    submitRegistrationForm() {
        this.registerButton.click();
    }

    // Комплексный метод для регистрации
    register(userData) {
        this.fillUsername(userData.username);
        this.fillEmail(userData.email);
        this.fillPassword(userData.password);
        this.fillConfirmPassword(userData.confirmPassword);
        this.submitRegistrationForm();
    }
}

export default new RegistrationPage();