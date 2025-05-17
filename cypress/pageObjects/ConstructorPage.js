import Header from './Header';

class ConstructorPage {
    // --- Селекторы ---
    get pageTitle() {
    }

    get previewContainerTitle() {
        return cy.get('.preview-container h2');
    }

    get clothingPreviewArea() {
        return cy.get('#clothing-preview');
    }

    get clothingImageInPreview() {
        return cy.get('#clothing-preview #clothing-image');
    }

    get customizationLayer() {
        return cy.get('#customization-layer');
    }

    get colorSelect() {
        return cy.get('#color-select');
    }

    getTextInput() {
        return cy.get('#text-input');
    }

    get applyChangesButton() {
        return cy.get('#apply-changes');
    }

    get saveDesignButton() {
        return cy.get('#save-design');
    }

    // --- Методы для взаимодействия ---
    visit() {
        cy.visit('/constructor');
        cy.get('.preview-container h2').should('be.visible').and('contain', 'Предпросмотр:');
        return this;
    }

    selectColor(colorValue) {
        this.colorSelect.should('be.visible').select(colorValue);
        this.colorSelect.should('have.value', colorValue);
        return this;
    }

    enterText(text) {
        if (text) {
            this.getTextInput().should('be.visible').clear().type(text);
        } else {
            this.getTextInput().should('be.visible').clear();
        }
        return this;
    }

    applyChanges() {
        this.applyChangesButton.should('be.visible').click();
        return this;
    }

    saveDesign() {
        cy.intercept('POST', '/api/create-product').as('createProductApi');
        this.saveDesignButton.should('be.visible').click();
        return this;
    }

    // --- Методы для проверок ---
    verifyHeaderIsVisible() {
        Header.isVisible();
        Header.navLinkConstructor.should('be.visible');
    }

    verifyPreviewImageIsVisible() {
        this.clothingImageInPreview.should('be.visible');
        return this;
    }

    verifyPreviewBackgroundColor(expectedColor) {
        this.clothingImageInPreview.should('have.css', 'background-color', expectedColor);
        return this;
    }

    verifyTextInPreview(expectedText) {
        this.customizationLayer.should('contain.text', expectedText);
        return this;
    }

    waitForAndVerifySaveDesignApiSuccess() {
        cy.wait('@createProductApi').then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
            expect(interception.response.body).to.have.property('message', 'Продукт успешно создан');
            expect(interception.response.body.product).to.exist;
        });
        return this;
    }

    waitForAndVerifySaveDesignApiRequestData() {
        cy.wait('@createProductApi').then((interception) => {
            expect(interception.request.method).to.eq('POST');
        });
        return this;
    }
}

export default new ConstructorPage();