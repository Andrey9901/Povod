import Header from './Header'; // Профиль тоже имеет шапку

class ProfilePage {
    get userNameDisplay() { return cy.get('#user-name', { timeout: 15000 }); }
    get userEmailDisplay() { return cy.get('#user-email', { timeout: 10000 }); }
    get avatarImage() { return cy.get('#user-avatar'); }
    get avatarUploadInput() { return cy.get('#avatar-upload'); }

    visit() {
        cy.visit('/profile');
        this.pageTitle.should('be.visible').and('contain', 'Личный кабинет');
        return this;
    }
    shouldDisplayUserName(username) { this.userNameDisplay.should('be.visible').and('contain', username); }
    shouldDisplayUserEmail(email) { this.userEmailDisplay.should('be.visible').and('contain', email); }
    checkHeaderNavigation() {
        Header.isVisible();
        Header.navLinkMain.should('be.visible');
        Header.logoutLink.should('be.visible').and('contain', 'Выйти');
    }
    uploadAvatar(filePath) { this.avatarUploadInput.selectFile(filePath, { force: true }); }
}
export default new ProfilePage();