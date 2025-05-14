import Header from '../../pageObjects/Header';

describe('UI Тесты - Просмотр информационных страниц (с POM для Header)', () => {

    describe('Страница "О нас"', () => {
        beforeEach(() => {
            cy.visit('/about');
        });

        it('должна успешно загружаться и содержать правильный заголовок', () => {
            cy.title().should('include', 'О нас - Povod');
            cy.get('h1').should('contain', 'О нас');
        });

        it('должна отображать секцию "Наша история"', () => {
            cy.get('.about-section h2').contains('Наша история').should('be.visible');
            cy.get('.about-section').contains('Начав как небольшой проект').should('be.visible');
        });

        it('должна отображать секцию "Как связаться" с контактной информацией', () => {
            cy.get('.about-section h2').contains('Как связаться').should('be.visible');
            cy.get('.about-section ul li').should('contain', 'Email: info@povod.ru');
        });

        it('должна содержать навигационное меню и ссылки в шапке', () => {
            Header.isVisible();
            Header.navLinkMain.should('contain', 'Главная');
            Header.navLinkCatalog.should('contain', 'Каталог');
            Header.navLinkConstructor.should('contain', 'Конструктор');
            Header.navLinkAbout.should('contain', 'О нас');
            Header.loginIconLink.should('be.visible');
        });
    });
});