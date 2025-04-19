describe('Магазин Povod - Тесты Страницы Конструктора', () => {

    beforeEach(() => {
        // Переходим на страницу конструктора перед каждым тестом
        cy.visit('/constructor');
        cy.log('Переход на страницу конструктора (/constructor)');
    });

    it('должен корректно отображать основные элементы страницы конструктора', () => {
        cy.log('Проверка отображения элементов конструктора...');

        // 1. Проверяем шапку 
        cy.get('.logo').should('be.visible');
        cy.contains('nav a', 'Конструктор').should('be.visible');
        cy.get('.cart-icon').should('be.visible');

        // 2. Проверяем заголовок страницы
        cy.title().should('eq', 'Конструктор одежды - Povod');

        // 3. Проверяем основной заголовок и подзаголовок
        cy.contains('h1', 'Конструктор одежды').should('be.visible');
        cy.contains('p', 'Создайте свою уникальную одежду с помощью нашего конструктора').should('be.visible');

        // 4. Проверяем блок предпросмотра
        cy.contains('h2', 'Предпросмотр:').should('be.visible');
        cy.get('#clothing-preview').should('be.visible');
        cy.get('img#clothing-image')
            .should('be.visible')
            .and('have.attr', 'src', 'base-tshirt.jpg'); // Проверяем начальное изображение
        cy.get('#customization-layer').should('exist'); // Проверяем наличие слоя для кастомизации

        // 5. Проверяем панель настроек
        cy.contains('h2', 'Настройки:').should('be.visible');
        cy.contains('label[for="color-select"]', 'Выберите цвет:').should('be.visible');
        cy.get('select#color-select').should('be.visible');
        cy.contains('label[for="text-input"]', 'Добавьте текст:').should('be.visible');
        cy.get('input#text-input')
            .should('be.visible')
            .and('have.attr', 'placeholder', 'Введите текст');
        cy.get('button#apply-changes')
            .should('be.visible')
            .and('contain.text', 'Применить изменения');
        cy.get('button#save-design')
            .should('be.visible')
            .and('contain.text', 'Сохранить дизайн');

        // 6. Проверяем начальное значение цвета
        cy.get('select#color-select').should('have.value', 'white');

        // 7. Проверяем подвал 
        cy.contains('footer p', '© 2025 Povod').should('be.visible');

        cy.log('Все основные элементы страницы конструктора отображаются.');
    });

    it('должен позволять выбрать другой цвет', () => {
        const targetColorText = 'Красный';
        const targetColorValue = 'red';
        cy.log(`Проверка выбора цвета "${targetColorText}"...`);

        // Выбираем цвет "Красный" по его видимому тексту
        cy.get('select#color-select')
            .select(targetColorText)
            .should('have.value', targetColorValue); // Проверяем, что value изменилось на 'red'

        // Примечание: Проверить, что само изображение ИЗМЕНИЛОСЬ, сложнее.
        // Это требует либо знания, как скрипт constructor.js меняет DOM/стили/src,
        // либо использования инструментов визуального регрессионного тестирования.
        // Сейчас мы проверяем только то, что пользователь МОЖЕТ выбрать опцию.
        cy.log(`Цвет "${targetColorText}" выбран.`);
    });

    it('должен позволять ввести текст', () => {
        const customText = 'Мой уникальный дизайн!';
        cy.log('Проверка ввода текста...');

        cy.get('input#text-input')
            .type(customText)
            .should('have.value', customText);

        cy.log('Текст успешно введен.');
    });

    it('должен реагировать на нажатие кнопки "Применить изменения"', () => {
        cy.log('Проверка нажатия кнопки "Применить изменения"...');

        // Можно сначала что-то изменить, например, цвет
        cy.get('select#color-select').select('Синий');
        cy.get('input#text-input').type('Тест');

        cy.get('button#apply-changes').click();

        // Что проверить после клика? Зависит от constructor.js.
        // Возможно, текст появляется на #customization-layer?
        // Например (если текст добавляется):
        // cy.get('#customization-layer').should('contain.text', 'Тест');
        // Или меняется класс/стиль у #clothing-preview?
        // cy.get('#clothing-preview').should('have.class', 'some-class-after-apply');

        // Пока просто логируем факт нажатия, т.к. не знаем точного эффекта.
        cy.log('Кнопка "Применить изменения" нажата. Дальнейшие проверки требуют знания логики JS.');
    });

    it('должен реагировать на нажатие кнопки "Сохранить дизайн"', () => {
        cy.log('Проверка нажатия кнопки "Сохранить дизайн"...');

        // Опционально: делаем какие-то изменения перед сохранением
        cy.get('select#color-select').select('Черный');
        cy.get('input#text-input').type('Сохранить!');
        cy.get('button#apply-changes').click(); // Возможно, нужно применить перед сохранением?

        cy.get('button#save-design').click();

        // Пока просто логируем факт нажатия.
        cy.log('Кнопка "Сохранить дизайн" нажата. Проверка результата требует более сложных методов.');
    });

}); 