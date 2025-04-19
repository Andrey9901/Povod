describe('API Тесты - Регистрация Пользователя (POST /register)', () => {

    // Функция для генерации уникальных данных для каждого теста
    const generateUserData = () => {
        const uniqueId = Date.now();
        return {
            username: `testuser_${uniqueId}`,
            email: `test_${uniqueId}@example.com`,
            password: `ValidPassword123!_${uniqueId}`, // Пароль тоже делаем уникальным на всякий случай
        };
    };

    it('Успешная регистрация: должен возвращать статус 302 (редирект) при валидных данных', () => {
        const userData = generateUserData();
        cy.log(`Попытка регистрации с валидными данными: ${JSON.stringify(userData)}`);

        cy.request({
            method: 'POST',
            url: '/register', // Использует baseUrl из cypress.config.js
            form: true, // используется bodyParser.urlencoded, значит, данные идут как form-data
            body: {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.password // Пароли совпадают
            },
            // Опции для обработки редиректа и не-2xx статусов
            followRedirect: false, // НЕ следовать за редиректом на /login
            failOnStatusCode: false // НЕ считать ошибкой статус 302
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            // Ожидаем статус 302 Found, так как сервер делает res.redirect('/login')
            // Хотя в коде указан status(201), redirect() переопределит статус на 302
            expect(response.status).to.eq(302);
            // Проверяем заголовок Location, указывающий на редирект
            expect(response.headers).to.have.property('location');
            expect(response.headers.location).to.contain('/login'); // Ожидаем редирект на /login
        });
    });

    it('Ошибка: Пользователь существует - должен возвращать статус 409', () => {
        const userData = generateUserData();
        cy.log(`Тест ошибки 409. Сначала регистрируем пользователя: ${userData.username}`);

        // Шаг 1: Успешно регистрируем пользователя
        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.password
            },
            followRedirect: false,
            failOnStatusCode: false
        }).then(firstResponse => {
            expect(firstResponse.status).to.eq(302); // Убедимся, что первая регистрация прошла (ожидаем редирект)
            cy.log(`Первая регистрация успешна (статус ${firstResponse.status}). Попытка повторной регистрации...`);

            // Шаг 2: Пытаемся зарегистрировать того же пользователя еще раз
            cy.request({
                method: 'POST',
                url: '/register',
                form: true,
                body: {
                    username: userData.username, // Тот же username
                    email: `another_${userData.email}`, // Другой email, чтобы проверить конфликт по username
                    password: userData.password,
                    confirmPassword: userData.password
                },
                failOnStatusCode: false // Ожидаем ошибку (409)
            }).then((secondResponse) => {
                cy.log(`Ответ сервера при повторной регистрации: Статус ${secondResponse.status}`);
                expect(secondResponse.status).to.eq(409); // Conflict
                // Проверяем текст ошибки в теле ответа
                expect(secondResponse.body).to.contain('Пользователь с таким именем или email уже существует.');
            });
        });
    });

    it('Ошибка: Невалидный email - должен возвращать статус 400 и сообщение об ошибке', () => {
        const userData = generateUserData();
        cy.log('Тест ошибки 400: Невалидный email');

        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: {
                username: userData.username,
                email: 'invalid-email-format', // Неверный формат
                password: userData.password,
                confirmPassword: userData.password
            },
            failOnStatusCode: false // Ожидаем ошибку (400)
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(400); // Bad Request
            // Проверяем JSON-тело с массивом ошибок валидации
            expect(response.body).to.have.property('errors');
            expect(response.body.errors).to.be.an('array').that.is.not.empty;
            // Ищем конкретную ошибку для поля email
            const emailError = response.body.errors.find(err => err.path === 'email');
            expect(emailError).to.exist;
            expect(emailError.msg).to.eq('Неверный формат email');
        });
    });

    it('Ошибка: Пароль слишком короткий - должен возвращать статус 400 и сообщение об ошибке', () => {
        const userData = generateUserData();
        const shortPassword = '123'; // Короче 6 символов
        cy.log('Тест ошибки 400: Короткий пароль');

        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: {
                username: userData.username,
                email: userData.email,
                password: shortPassword,
                confirmPassword: shortPassword
            },
            failOnStatusCode: false
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('errors').that.is.an('array').and.not.empty;
            const passwordError = response.body.errors.find(err => err.path === 'password');
            expect(passwordError).to.exist;
            expect(passwordError.msg).to.eq('Пароль должен содержать минимум 6 символов');
        });
    });

    it('Ошибка: Пароли не совпадают - должен возвращать статус 400 и сообщение об ошибке', () => {
        const userData = generateUserData();
        cy.log('Тест ошибки 400: Пароли не совпадают');

        cy.request({
            method: 'POST',
            url: '/register',
            form: true,
            body: {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                confirmPassword: `different_${userData.password}` // Несовпадающий пароль
            },
            failOnStatusCode: false
        }).then((response) => {
            cy.log(`Ответ сервера: Статус ${response.status}`);
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('errors').that.is.an('array').and.not.empty;
            const confirmPasswordError = response.body.errors.find(err => err.path === 'confirmPassword');
            expect(confirmPasswordError).to.exist;
            expect(confirmPasswordError.msg).to.eq('Пароли не совпадают');
        });
    });

   

});