describe('API Тесты - Вход Пользователя (POST /login)', () => {
    const testUsername = 'testuser_1743902638646';
    const testPassword = '$2b$10$Uv2ebs.mzLHDsHRWpsF2guqCa4/paZ/gTTUd9uuSUX86gXMQqR2Mq'; 
    const testEmail = 'another_test_1743902638646@example.com'; 

    // --- Хук: Выполняется один раз перед всеми тестами в этом блоке ---
    // Создаем тестового пользователя, если его нет, чтобы тесты входа были надежными
    before(() => {
        cy.log(`Проверка/создание пользователя для тестов входа: ${testUsername}`);

        // Сначала пытаемся зарегистрировать пользователя.
        // Используем failOnStatusCode: false, так как он может уже существовать.
        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: {
                username: testUsername,
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword
            },
            failOnStatusCode: false // Не падать, если пользователь уже есть (статус 409)
        }).then((response) => {
            if (response.status === 302 || response.status === 409) {
                cy.log(`Пользователь ${testUsername} существует или успешно создан.`);
            } else {
                // Если произошла другая ошибка при создании пользователя
                cy.log(`Ошибка при создании тестового пользователя: Статус ${response.status}, Тело: ${JSON.stringify(response.body)}`);
                // Можно уронить тесты, если пользователь критичен
                // throw new Error('Не удалось создать тестового пользователя');
                // Или просто вывести предупреждение
                cy.log('ПРЕДУПРЕЖДЕНИЕ: Не удалось создать тестового пользователя, тесты входа могут быть нестабильны.');
            }
        });
    });
    // --------------------------------------------------------------------


    it('Успешный вход: должен возвращать статус 302 (редирект) и устанавливать сессионную куку', () => {
        cy.log(`Попытка входа с валидными данными: ${testUsername}`);

        cy.request({
            method: 'POST',
            url: '/login',
            form: true, // Используем form-data
            body: {
                username: testUsername,
                password: testPassword
            },
            followRedirect: false, // Не следовать за редиректом на /profile
            failOnStatusCode: false
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);

            // 1. Проверяем статус редиректа
            expect(response.status).to.eq(302); // Found (Redirect)

            // 2. Проверяем заголовок Location
            expect(response.headers).to.have.property('location');
            expect(response.headers.location).to.contain('/profile');

            // 3. Проверяем, что сервер установил сессионную куку
            // Имя куки обычно 'connect.sid' для express-session, но может быть изменено
            cy.getCookie('connect.sid').should('exist'); // Проверяем сам факт наличия куки

            cy.log('Успешный вход: получен редирект и сессионная кука.');
        });
    });

    it('Ошибка: Неверный пароль - должен возвращать статус 401', () => {
        const wrongPassword = 'wrongpassword123';
        cy.log(`Попытка входа с неверным паролем для пользователя: ${testUsername}`);

        cy.request({
            method: 'POST',
            url: '/login',
            form: true,
            body: {
                username: testUsername,
                password: wrongPassword
            },
            failOnStatusCode: false // Ожидаем ошибку (401)
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(401); // Unauthorized
            // Проверяем текст ошибки в теле ответа
            expect(response.body).to.contain('Неверное имя пользователя или пароль.');
        });
    });

    it('Ошибка: Несуществующий пользователь - должен возвращать статус 401', () => {
        const nonExistentUsername = `nonexistent_${Date.now()}`;
        cy.log(`Попытка входа с несуществующим пользователем: ${nonExistentUsername}`);

        cy.request({
            method: 'POST',
            url: '/login',
            form: true,
            body: {
                username: nonExistentUsername,
                password: 'anypassword'
            },
            failOnStatusCode: false // Ожидаем ошибку (401)
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(401); // Unauthorized
            expect(response.body).to.contain('Неверное имя пользователя или пароль.');
        });
    });

    it('Ошибка: Пустое имя пользователя - должен возвращать статус 400', () => {
        cy.log('Попытка входа с пустым именем пользователя');

        cy.request({
            method: 'POST',
            url: '/login',
            form: true,
            body: {
                username: '', // Пустое имя
                password: testPassword
            },
            failOnStatusCode: false // Ожидаем ошибку (400)
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(400); // Bad Request
            expect(response.body).to.contain('Имя пользователя и пароль обязательны.');
        });
    });

    it('Ошибка: Пустой пароль - должен возвращать статус 400', () => {
        cy.log('Попытка входа с пустым паролем');

        cy.request({
            method: 'POST',
            url: '/login',
            form: true,
            body: {
                username: testUsername,
                password: '' // Пустой пароль
            },
            failOnStatusCode: false // Ожидаем ошибку (400)
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(400); // Bad Request
            expect(response.body).to.contain('Имя пользователя и пароль обязательны.');
        });
    });

});