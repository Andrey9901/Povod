import Header from './Header'; // Шапка есть на всех страницах

class CatalogPage {
    // --- Селекторы ---
    get pageTitle() {
        return cy.get('h1', { timeout: 10000 });
    }

    get pageDescription() {
        return cy.get('section.catalog-content .container > p').first();
    }

    get searchInput() {
        return cy.get('#search-input');
    }

    get searchButton() {
        return cy.get('.search-button');
    }

    get productsContainer() {
        return cy.get('section.catalog-content .products').first(); // Первый блок .products (основной каталог)
    }

    getProductCardByName(name) {
        // Ищет карточку товара, содержащую указанное имя в h3
        return this.productsContainer.find('.product').filter(`:contains("${name}")`);
    }

    getFirstProductCard() {
        return this.productsContainer.find('.product').first();
    }

    getProductNameFromCard(productCardElement) {
        return productCardElement.find('h3');
    }

    getProductPriceFromCard(productCardElement) {
        return productCardElement.find('.price');
    }

    getAddToCartButtonFromCard(productCardElement) {
        return productCardElement.find('.add-to-cart-button');
    }

    // --- Методы для взаимодействия ---
    visit() {
        cy.visit('/catalog');
        this.pageTitle.should('be.visible').and('contain', 'Каталог товаров');
        return this;
    }

    searchForProduct(productName) {
        if (productName) {
            this.searchInput.should('be.visible').clear().type(productName);
        } else {
            this.searchInput.should('be.visible').clear(); // Просто очищаем, если productName пустой
        }
        this.searchButton.should('be.visible').click();
        return this;
    }

    // --- Методы для проверок ---
    verifyProductIsVisible(productName) {
        this.getProductCardByName(productName).should('be.visible');
        return this;
    }

    verifyProductIsNotVisible(productName) {
        this.getProductCardByName(productName).should('not.exist');
        return this;
    }

    verifyHeaderIsVisible() {
        Header.isVisible();
        Header.navLinkCatalog.should('be.visible');
    }

    verifyNumberOfProductsDisplayed(count) {
        this.productsContainer.find('.product').should('have.length', count);
    }

    verifyAtLeastOneProductDisplayed() {
        this.productsContainer.find('.product').should('have.length.gte', 1);
    }
}

export default new CatalogPage();