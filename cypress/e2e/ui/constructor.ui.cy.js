// cypress/e2e/ui/constructor.ui.cy.js
import ConstructorPage from '../../pageObjects/ConstructorPage';
import LoginPage from '../../pageObjects/LoginPage'; // Импортируем LoginPage
// import Header from '../../pageObjects/Header'; // Если нужен

describe('UI Тесты - Страница Конструктора (с POM)', () => {
    let testUserData; // Для доступа к данным пользователя

    before(() => {
        cy.fixture('testUser').then((user) => { // Загружаем один раз для всего describe
            testUserData = user;
            // Регистрация пользователя (код из пункта 2 выше)
            // Убедитесь, что пользователь будет существовать к моменту запуска тестов
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: {
                    username: testUserData.username,
                    email: testUserData.email,
                    password: testUserData.password,
                    confirmPassword: testUserData.password
                },
                failOnStatusCode: false
            }).then((response) => {
                if (response.status !== 201 && response.status !== 409) {
                    throw new Error(`Failed to register/confirm test user. Status: ${response.status}`);
                }
                cy.log(response.status === 201 ? `User ${testUserData.username} registered.` : `User ${testUserData.username} already exists.`);
            });
        });
    });

    // Тесты, не требующие авторизации (если такие есть для конструктора)
    describe('Общие проверки (без авторизации)', () => {
        beforeEach(() => {
            ConstructorPage.visit();
        });

        it('должна успешно загружаться и содержать правильный заголовок', () => {
            cy.title().should('include', 'Конструктор одежды - Povod');
            ConstructorPage.pageTitle.should('contain', 'Конструктор одежды');
            ConstructorPage.verifyHeaderIsVisible(); // Header.isVisible() и Header.navLinkConstructor...
        });

        it('должна отображать область предпросмотра с изображением', () => {
            ConstructorPage.previewContainerTitle.should('contain', 'Предпросмотр:');
            ConstructorPage.clothingPreviewArea.should('be.visible');
            ConstructorPage.verifyPreviewImageIsVisible();
        });

        it('должна изменять цвет фона изображения в предпросмотре', () => {
            ConstructorPage.selectColor('red');
            ConstructorPage.applyChanges();
            ConstructorPage.verifyPreviewBackgroundColor('rgb(255, 0, 0)'); // Адаптируйте RGB если нужно
        });

        it('должна добавлять текст в область предпросмотра', () => {
            const testText = 'My Unique Design';
            ConstructorPage.enterText(testText);
            ConstructorPage.applyChanges();
            ConstructorPage.verifyTextInPreview(testText);
        });
    });


    // Тесты, ТРЕБУЮЩИЕ авторизации
    describe('Действия авторизованного пользователя', () => {
        beforeEach(() => {
            // Логинимся перед каждым тестом в этом блоке
            expect(testUserData, 'Test user data should be loaded').to.not.be.undefined; // Проверка, что testUserData загружены
            LoginPage.visit();
            LoginPage.login(testUserData.username, testUserData.password);
            // Опционально: убедиться, что логин прошел успешно, например, редиректом на профиль
            cy.url().should('include', '/profile', { timeout: 10000 });
            // Затем переходим на страницу конструктора
            ConstructorPage.visit();
        });

        it('должна "сохранять" дизайн (проверка вызова API) для авторизованного пользователя', () => {
            const selectedColor = 'green';
            const enteredText = 'Test Save Auth';

            ConstructorPage.selectColor(selectedColor);
            ConstructorPage.enterText(enteredText);
            ConstructorPage.applyChanges();

            ConstructorPage.saveDesign(); // Этот метод уже содержит cy.intercept('POST', '/api/create-product').as('createProductApi');
            ConstructorPage.waitForAndVerifySaveDesignApiSuccess(); // Ожидаем 201
        });
    });
});