// cypress/e2e/ui/main_page.ui.cy.js
import Header from '../../pageObjects/Header';

describe('UI Тесты - Главная страница', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('должна успешно загружаться и иметь правильный заголовок страницы (title)', () => {
        cy.title().should('eq', 'Povod - Магазин одежды');
    });

    it('должна отображать шапку с логотипом, навигацией и иконками действий', () => {
        Header.isVisible();
        Header.logoLink.should('be.visible').and('have.attr', 'href', '/');
        Header.navMenu.should('be.visible');
        Header.navLinkCatalog.should('be.visible').and('contain', 'Каталог').and('have.attr', 'href', '/catalog');
        Header.navLinkConstructor.should('be.visible').and('contain', 'Конструктор').and('have.attr', 'href', '/constructor');
        Header.navLinkAbout.should('be.visible').and('contain', 'О нас').and('have.attr', 'href', '/about');
        Header.searchIcon.should('be.visible');
        Header.loginIconLink.should('be.visible').and('have.attr', 'href', '/login');
        Header.cartIconLink.should('be.visible');
        Header.cartCount.should('be.visible').and('contain', '0');
    });

    it('должна отображать главный баннер с заголовком, текстом и кнопкой', () => {
        cy.get('section.banner').should('be.visible').within(() => {
            cy.get('.container h1').should('be.visible').and('contain', 'POVOD');
            cy.get('.container p').should('be.visible').and('contain', 'Потому что стиль — это не просто одежда, это твоя история.');
            cy.get('.container a.btn')
                .should('be.visible')
                .and('contain', 'КУПИТЬ СЕЙЧАС')
                .and('have.attr', 'href', '/catalog');
        });
    });

    it('должна отображать секцию "Популярные товары" с заголовком и товарами', () => {
        cy.get('section.product-collection').should('be.visible').within(() => {
            cy.get('h2').should('be.visible').and('contain', 'Популярные товары');
            cy.get('p').first().should('be.visible').and('contain', 'Зачем ждать повода, если ты уже им стал?');

            cy.get('.products .product').should('have.length.gte', 1) // Находим карточки
                .each(($card, index) => {                             // Для каждой карточки
                    cy.wrap($card).find('img') // Находим img
                        .should('be.visible')  // Сразу продолжаем цепочку от результата .find('img')
                        .should(jqImg => {     // И еще раз продолжаем
                            const altText = jqImg.attr('alt');
                            expect(altText, `Атрибут alt изображения #${index + 1} (src: ${jqImg.attr('src')}) должен существовать`).to.exist;
                            expect(altText.trim(), `Атрибут alt изображения #${index + 1} (src: ${jqImg.attr('src')}) не должен быть пустым`).to.not.be.empty;
                        });
                });
        });
    });

    it('должна отображать подвал (footer) с текстом авторских прав', () => {
        cy.get('footer.footer').should('be.visible').within(() => {
            cy.get('.container p').should('be.visible').and('contain', '© 2025 Povod. Все права защищены.');
        });
    });
});