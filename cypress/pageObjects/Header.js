class Header {
    // Селекторы элементов шапки
    get logoLink() {
        return cy.get('header.header a[href="/"]');
    }

    get navMenu() {
        return cy.get('header.header nav.menu');
    }

    get navLinkMain() {
        return this.navMenu.find('ul li a[href="/"]');
    }

    get navLinkCatalog() {
        return this.navMenu.find('ul li a[href="/catalog"]');
    }

    get navLinkConstructor() {
        return this.navMenu.find('ul li a[href="/constructor"]');
    }

    get navLinkAbout() {
        return this.navMenu.find('ul li a[href="/about"]');
    }

    get searchIcon() {
        return cy.get('header.header .header-actions a.action-icon i.fa-search').parent('a');
    }

    get loginIconLink() {
        // Эта ссылка меняется на "Выйти" после логина
        return cy.get('header.header .header-actions a.action-icon[href="/login"]');
    }

    get logoutLink() {
        // Эта ссылка появляется после логина
        return cy.get('header.header .header-actions a#logout-link.action-icon');
    }

    get cartIconLink() {
        return cy.get('header.header .header-actions a.action-icon.cart-icon');
    }

    get cartCount() {
        return this.cartIconLink.find('span.cart-count');
    }

    // Методы для взаимодействия
    clickLogo() {
        this.logoLink.click();
    }

    navigateToMain() {
        this.navLinkMain.click();
    }

    navigateToCatalog() {
        this.navLinkCatalog.click();
    }

    navigateToConstructor() {
        this.navLinkConstructor.click();
    }

    navigateToAbout() {
        this.navLinkAbout.click();
    }

    navigateToLogin() {
        this.loginIconLink.click();
    }

    clickLogout() {
        this.logoutLink.click();
    }

    // Методы для проверок
    isVisible() {
        return cy.get('header.header').should('be.visible');
    }

    navLinkMainShouldBeVisibleAndContain(text) {
        this.navLinkMain.should('be.visible').and('contain', text);
    }
}

export default new Header();