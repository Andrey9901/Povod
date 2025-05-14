import CatalogPage from '../../pageObjects/CatalogPage';
import Header from '../../pageObjects/Header';

describe('UI Тесты - Страница Каталога (с POM)', () => {

    beforeEach(() => {
        CatalogPage.visit(); // Используем метод visit из POM
    });

    it('должна успешно загружаться и содержать правильный заголовок', () => {
        cy.title().should('include', 'Каталог - Povod');
        CatalogPage.pageTitle.should('contain', 'Каталог товаров'); // Используем POM
    });

    it('должна отображать хотя бы один товар', () => {
        CatalogPage.productsContainer.should('be.visible'); // Используем POM
        const firstProduct = CatalogPage.getFirstProductCard(); // Используем POM
        firstProduct.should('be.visible');
        CatalogPage.getProductNameFromCard(firstProduct).should('not.be.empty'); // Используем POM
    });

    it('должна содержать шапку с навигацией', () => {
        Header.isVisible();
        Header.navLinkCatalog.should('be.visible');
    });

    it('должна корректно выполнять поиск существующего товара', () => {
        const productNameToSearch = 'Вышивка на свитшоте';
        CatalogPage.searchForProduct(productNameToSearch);
        CatalogPage.verifyProductIsVisible(productNameToSearch);
    });

    it('должна корректно выполнять поиск: не находить несуществующий товар', () => {
        const nonExistentProduct = 'СуперНесуществующийЭксклюзив9000';
        CatalogPage.searchForProduct(nonExistentProduct);
        CatalogPage.productsContainer.find('.product').filter(`:contains("${nonExistentProduct}")`).should('not.exist');
    });

    it('должна отображать все товары после очистки поля поиска', () => {
        const productNameToSearch = 'Вышивка на свитшоте';
        CatalogPage.searchForProduct(productNameToSearch);
        CatalogPage.searchForProduct(''); // Очищаем поиск
        CatalogPage.productsContainer.find('.product').its('length').should('be.gt', 1);
    });
});