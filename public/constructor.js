const clothingImage = document.getElementById('clothing-image');
const customizationLayer = document.getElementById('customization-layer');
const colorSelect = document.getElementById('color-select');
const textInput = document.getElementById('text-input');
const applyButton = document.getElementById('apply-changes');
const saveDesignButton = document.getElementById('save-design');

// Объект, содержащий пути к изображениям для каждого цвета
const shirtImages = {
    white: 'base-tshirt.jpg',  // Путь к белой футболке
    black: 'black-tshirt.jpg',  // Путь к черной футболке
    red: 'red-tshirt.jpg',      // Путь к красной футболке
    blue: 'blue-tshirt.jpg',    // Путь к синей футболке
    green: 'green-tshirt.png'   // Путь к зеленой футболке
};

// Обработчик изменения цвета
colorSelect.addEventListener('change', function () {
    const selectedColor = this.value; // Получаем выбранный цвет
    // eslint-disable-next-line security/detect-object-injection
    if (shirtImages[selectedColor]) {
        // Если для выбранного цвета есть изображение, обновляем src
        // eslint-disable-next-line security/detect-object-injection
        clothingImage.src = shirtImages[selectedColor];
    } else {
        console.error('Изображение для выбранного цвета не найдено.');
    }
});

// Обработчик применения изменений
applyButton.addEventListener('click', function () {
    customizationLayer.innerHTML = ''; // Очищаем предыдущую кастомизацию
    const text = textInput.value.trim();
    if (text) {
        const textElement = document.createElement('div');
        textElement.textContent = text;
        textElement.style.position = 'absolute';
        textElement.style.top = '50%';
        textElement.style.left = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.fontSize = '24px';
        textElement.style.color = '#000';
        textElement.style.fontWeight = 'bold';
        textElement.style.pointerEvents = 'none';
        customizationLayer.appendChild(textElement);
    }
});

// Функция сохранения дизайна
async function saveDesign() {
    try {
        // Создаем изображение с помощью html2canvas
        const canvas = await html2canvas(document.querySelector('#clothing-preview'));
        canvas.toBlob(async function (blob) {
            const formData = new FormData();
            formData.append('designImage', blob, 'design.png');
            formData.append('color', colorSelect.value);

            // Отправляем данные на сервер
            const response = await fetch('/api/create-product', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Ошибка при сохранении дизайна.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseErr) { // Используем переменную parseErr
                    // Логируем ошибку парсинга JSON, если тело ответа не JSON или пустое
                    console.warn('Не удалось распарсить JSON из ответа сервера об ошибке:', parseErr);
                    // Оставляем сообщение по умолчанию
                }
                throw new Error(errorMessage);
            }

            // Если все успешно, получаем JSON ответ (даже если он не используется дальше)
            await response.json();
            alert('Дизайн успешно сохранен!');
        });
    } catch (error) { // Этот catch для ошибок fetch или throw new Error выше
        console.error('Ошибка при сохранении дизайна (внешний try-catch):', error);
        alert(`Произошла ошибка при сохранении дизайна: ${error.message}`);
    }
}

// Добавляем обработчик для кнопки сохранения
saveDesignButton.addEventListener('click', saveDesign);