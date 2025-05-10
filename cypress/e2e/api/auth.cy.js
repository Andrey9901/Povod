// cypress/e2e/api/auth.cy.js
describe('API Аутентификации', () => {
    // Helper function to generate unique user data for each test run if needed,
    // or specific suffixes for different test cases.
    const generateUserData = (suffix) => {
        const timestamp = Date.now(); // Ensures uniqueness across test runs
        return {
            username: `testuser_${suffix}_${timestamp}`,
            email: `test_${suffix}_${timestamp}@example.com`,
            password: 'Password123!',
            confirmPassword: 'Password123!' // Default to matching for simplicity
        };
    };

    // --- Тесты Регистрации ---
    describe('POST /auth/register', () => {
        it('должен успешно регистрировать нового пользователя и возвращать его данные (без пароля)', () => {
            const newUserInput = generateUserData('reg_success');
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: newUserInput,
                // failOnStatusCode: false // Not needed if expecting 201
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.be.an('object');
                expect(response.body.success).to.be.true;
                expect(response.body.message).to.eq('Регистрация прошла успешно.');
                expect(response.body.user).to.be.an('object');
                expect(response.body.user).to.have.property('username', newUserInput.username);
                expect(response.body.user).to.have.property('email', newUserInput.email);
                expect(response.body.user).to.have.property('_id');
                expect(response.body.user).to.not.have.property('password'); // Важно: пароль не должен возвращаться
            });
        });

        it('должен возвращать ошибку 409 при регистрации с существующим именем пользователя', () => {
            const existingUser = generateUserData('existing_uname');
            // 1. Регистрируем пользователя
            cy.request({ method: 'POST', url: '/auth/register', body: existingUser }).its('status').should('eq', 201);

            // 2. Пытаемся зарегистрировать снова с тем же username
            const attemptWithSameUsername = { ...existingUser, email: `new_${Date.now()}@example.com` }; // Новый email
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: attemptWithSameUsername,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(409);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.contain('Имя пользователя уже используется');
            });
        });

        it('должен возвращать ошибку 409 при регистрации с существующим email', () => {
            const existingUser = generateUserData('existing_email_api');
            // 1. Регистрируем пользователя
            cy.request({ method: 'POST', url: '/auth/register', body: existingUser }).its('status').should('eq', 201);

            // 2. Пытаемся зарегистрировать другого с тем же email
            const attemptWithSameEmail = { ...existingUser, username: `new_user_${Date.now()}` }; // Новое имя пользователя
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: attemptWithSameEmail,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(409);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.contain('Email уже используется');
            });
        });

        it('должен возвращать ошибку 400, если пароли не совпадают', () => {
            const newUserInput = generateUserData('pwd_mismatch');
            newUserInput.confirmPassword = 'differentPassword123!';
            cy.request({
                method: 'POST',
                url: '/auth/register',
                body: newUserInput,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.eq('Пароли не совпадают.');
            });
        });

        it('должен возвращать ошибку 400, если отсутствует поле username', () => {
            const { email, password, confirmPassword } = generateUserData('reg_no_user');
            cy.request({ method: 'POST', url: '/auth/register', body: { email, password, confirmPassword }, failOnStatusCode: false })
                .then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.success).to.be.false;
                    expect(response.body.message).to.contain('Все поля');
                });
        });

        it('должен возвращать ошибку 400, если отсутствует поле email', () => {
            const { username, password, confirmPassword } = generateUserData('reg_no_email');
            cy.request({ method: 'POST', url: '/auth/register', body: { username, password, confirmPassword }, failOnStatusCode: false })
                .then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.success).to.be.false;
                    expect(response.body.message).to.contain('Все поля');
                });
        });

        it('должен возвращать ошибку 400, если отсутствует поле password', () => {
            const { username, email, confirmPassword } = generateUserData('reg_no_pass');
            cy.request({ method: 'POST', url: '/auth/register', body: { username, email, confirmPassword }, failOnStatusCode: false })
                .then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.success).to.be.false;
                    expect(response.body.message).to.contain('Все поля');
                });
        });

        it('должен возвращать ошибку 400, если отсутствует поле confirmPassword', () => {
            const { username, email, password } = generateUserData('reg_no_confirmpass');
            cy.request({ method: 'POST', url: '/auth/register', body: { username, email, password }, failOnStatusCode: false })
                .then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body.success).to.be.false;
                    expect(response.body.message).to.contain('Все поля');
                });
        });

        // Можно добавить тесты на длину полей, если есть серверная валидация
        // it('должен возвращать ошибку 400, если username слишком короткий', () => { ... });
    });

    // --- Тесты Логина ---
    describe('POST /auth/login', () => {
        let registeredUserData; // Для хранения данных пользователя, созданного в before()

        before(() => {
            // Создаем одного пользователя перед всеми тестами логина
            registeredUserData = generateUserData('login_setup');
            cy.request({ method: 'POST', url: '/auth/register', body: registeredUserData })
                .its('status').should('eq', 201);
        });

        it('должен успешно аутентифицировать зарегистрированного пользователя', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                body: { username: registeredUserData.username, password: registeredUserData.password }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                expect(response.body.message).to.eq('Вход выполнен успешно.');
                expect(response.body.user).to.be.an('object');
                expect(response.body.user.username).to.eq(registeredUserData.username);
                expect(response.body.user).to.not.have.property('password');
            });
        });

        it('должен возвращать ошибку 401 при неверном пароле', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                body: { username: registeredUserData.username, password: 'wrongPassword123!' },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.eq('Неверное имя пользователя или пароль.');
            });
        });

        it('должен возвращать ошибку 401 при несуществующем имени пользователя', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                body: { username: `nonexistent_${Date.now()}`, password: 'Password123!' },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.eq('Неверное имя пользователя или пароль.');
            });
        });

        it('должен возвращать ошибку 400, если отсутствует поле username при логине', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                body: { password: registeredUserData.password },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.contain('Имя пользователя и пароль обязательны');
            });
        });

        it('должен возвращать ошибку 400, если отсутствует поле password при логине', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                body: { username: registeredUserData.username },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.success).to.be.false;
                expect(response.body.message).to.contain('Имя пользователя и пароль обязательны');
            });
        });
    });

    // --- Тест Выхода ---
    describe('GET /auth/logout', () => {
        beforeEach(() => {
            // Для каждого теста выхода сначала логинимся, чтобы была активная сессия
            // Используем нового пользователя для каждого теста выхода, чтобы избежать конфликтов сессий
            const userToLogin = generateUserData('logout_setup');
            cy.request({ method: 'POST', url: '/auth/register', body: userToLogin }); // Регистрируем
            cy.request({ // Логинимся, чтобы установить сессию. Cypress сохранит куки для последующих запросов в рамках этого it()
                method: 'POST',
                url: '/auth/login',
                body: { username: userToLogin.username, password: userToLogin.password }
            }).its('status').should('eq', 200);
        });

        it('должен успешно выполнять выход для аутентифицированного пользователя', () => {
            cy.request({
                method: 'GET',
                url: '/auth/logout',
                // failOnStatusCode: false // Не нужен, если ожидаем 200
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                expect(response.body.message).to.eq('Выход выполнен успешно.');

                // Дополнительная проверка: пытаемся получить доступ к защищенному ресурсу (если есть)
                // или проверяем, что сессионная кука удалена (это сложнее напрямую)
                // Например, если бы /api/profile был защищен и вернул бы 401 после logout
                // cy.request({ url: '/api/profile', failOnStatusCode: false }).its('status').should('eq', 401);
            });
        });

        it('повторный запрос на выход должен также вернуть успех (или специфическое сообщение)', () => {
            // Первый выход
            cy.request({ method: 'GET', url: '/auth/logout' }).its('status').should('eq', 200);
            // Второй выход
            cy.request({ method: 'GET', url: '/auth/logout', failOnStatusCode: false }) // failOnStatusCode: false на случай, если поведение отличается
                .then((response) => {
                    expect(response.status).to.eq(200); // Обычно сервер просто говорит "ок, вышли" даже если сессии уже нет
                    expect(response.body.success).to.be.true;
                    // Сообщение может быть тем же или другим, зависит от реализации
                    // expect(response.body.message).to.eq('Выход выполнен успешно.'); 
                });
        });
    });
});