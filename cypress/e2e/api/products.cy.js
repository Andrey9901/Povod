describe('API Продуктов - /products', () => {
    let currentSeededProductForIt;

    beforeEach(() => {
        cy.log('CYPRESS: Начало beforeEach для API Продуктов');
        return cy.task('clearProducts').then((clearResult) => {
            cy.log('CYPRESS: clearProducts завершено. Результат:', clearResult === null ? 'OK' : JSON.stringify(clearResult));

            const uniqueSuffix = Date.now();
            const productData = {
                userId: `seed_user_${uniqueSuffix}`,
                color: `seed_color_${uniqueSuffix}`,
                designImage: `seed_image_${uniqueSuffix}.jpg`
            };
            cy.log('CYPRESS: Данные для seedProduct:', JSON.stringify(productData));

            return cy.task('seedProduct', productData);
        }).then((seededProduct) => {
            cy.log('CYPRESS: seedProduct вернул (сырой объект):', JSON.stringify(seededProduct));

            expect(seededProduct, 'seededProduct не должен быть undefined/null после задачи').to.exist.and.not.be.null;
            expect(seededProduct).to.be.an('object');
            expect(seededProduct, 'seededProduct должен иметь свойство _id').to.have.property('_id');

            const id = seededProduct._id;
            expect(id, '_id должен быть определен').to.exist.and.not.be.null;
            expect(id, '_id должен быть строкой').to.be.a('string');

            cy.task('isObjectIdValid', id).then((isValid) => {
                expect(isValid, `ID продукта "${id}" должен быть валидным ObjectId`).to.be.true;
                cy.log(`CYPRESS: ID "${id}" ${isValid ? 'является' : 'НЕ является'} валидным ObjectId (проверено через cy.task).`);
            });

            currentSeededProductForIt = seededProduct;
            cy.log('CYPRESS: currentSeededProductForIt._id установлен в:', currentSeededProductForIt._id);

            cy.log('CYPRESS: Конец beforeEach');
        });
    });

    describe('GET /products', () => {
        it('должен получать список продуктов (массив), содержащий созданный продукт', () => {
            expect(currentSeededProductForIt, 'currentSeededProductForIt должен быть доступен в тесте').to.exist;
            expect(currentSeededProductForIt._id, 'currentSeededProductForIt._id должен быть доступен').to.exist;
            const seededId = currentSeededProductForIt._id.toString();
            cy.log(`CYPRESS: Тест GET /products, ищем продукт с ID: ${seededId}`);

            cy.request('GET', '/products').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');
                cy.log('CYPRESS: Получен список продуктов, длина:', response.body.length);

                expect(response.body.length, 'Список продуктов не должен быть пустым после сидинга').to.be.greaterThan(0);

                const foundProduct = response.body.find(p => p._id.toString() === seededId);
                expect(foundProduct, `Продукт с ID ${seededId} должен быть в списке. Список ID: ${JSON.stringify(response.body.map(p => p._id))}`).to.exist;
                if (foundProduct) {
                    expect(foundProduct.color).to.eq(currentSeededProductForIt.color);
                }
            });
        });
    });

    describe('GET /products/:id', () => {
        it('должен получать конкретный продукт по ID', () => {
            expect(currentSeededProductForIt, 'currentSeededProductForIt должен быть доступен в тесте').to.exist;
            expect(currentSeededProductForIt._id, 'currentSeededProductForIt._id должен быть доступен').to.exist;
            const seededId = currentSeededProductForIt._id.toString();
            cy.log(`CYPRESS: Тест GET /products/:id, запрашиваем ID: ${seededId}`);

            cy.request({
                method: 'GET',
                url: `/products/${seededId}`,
                failOnStatusCode: false
            }).then((response) => {
                if (response.status !== 200) {
                    cy.log('CYPRESS: Ошибка при запросе GET /products/:id. Статус:', response.status, 'Тело:', JSON.stringify(response.body));
                }
                expect(response.status).to.eq(200, `Ожидали 200 для продукта с ID ${seededId}, но получили ${response.status}. Тело ответа: ${JSON.stringify(response.body)}`);
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('_id', seededId);
                expect(response.body.color).to.eq(currentSeededProductForIt.color);
            });
        });

        it('должен возвращать 404, если продукт с таким ID не найден (но ID валиден)', () => {
            cy.task('generateValidObjectId').then((nonExistentValidId) => { // Используем задачу для генерации ID
                cy.log(`CYPRESS: Тест GET /products/:id, запрашиваем несуществующий валидный ID: ${nonExistentValidId}`);
                cy.request({ method: 'GET', url: `/products/${nonExistentValidId}`, failOnStatusCode: false })
                    .then((response) => {
                        expect(response.status).to.eq(404);
                        expect(response.body).to.have.property('message', 'Продукт не найден.');
                    });
            });
        });

        it('должен возвращать 400, если ID имеет неверный формат', () => {
            const invalidId = 'invalid-object-id-format';
            cy.log(`CYPRESS: Тест GET /products/:id, запрашиваем невалидный ID: ${invalidId}`);
            cy.request({ method: 'GET', url: `/products/${invalidId}`, failOnStatusCode: false })
                .then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', 'Некорректный формат ID продукта.');
                });
        });
    });
});