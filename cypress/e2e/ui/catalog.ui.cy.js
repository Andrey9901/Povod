// cypress/e2e/ui/catalog.ui.cy.js
import CatalogPage from '../../pageObjects/CatalogPage';
import Header from '../../pageObjects/Header'; // Header все еще может быть нужен

describe('UI Тесты - Страница Каталога (с POM)', () => {

    beforeEach(() => {
        CatalogPage.visit(); // Используем метод visit из POM
    });

    it('должна успешно загружаться и содержать правильный заголовок', () => {
        cy.title().should('include', 'Каталог - Povod'); // Проверка title остается
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

    // --- Сюда добавляем НОВЫЕ тесты для поиска, которые я предлагал ранее ---
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
        // CatalogPage.verifyNumberOfProductsDisplayed(1); // Уточните ожидаемое поведение

        CatalogPage.searchForProduct(''); // Очищаем поиск
        CatalogPage.productsContainer.find('.product').its('length').should('be.gt', 1);
    });
});