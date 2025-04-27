// Получаем элементы DOM
const clothingImage = document.getElementById('clothing-image');
const customizationLayer = document.getElementById('customization-layer');
const colorSelect = document.getElementById('color-select');
const textInput = document.getElementById('text-input');
const applyButton = document.getElementById('apply-changes');
const saveDesignButton = document.getElementById('save-design');

// Обработчик изменения цвета
colorSelect.addEventListener('change', function () {
    clothingImage.style.backgroundColor = this.value;
});

// Обработчик применения изменений
applyButton.addEventListener('click', function () {
    // Очищаем предыдущую кастомизацию
    customizationLayer.innerHTML = '';

    // Добавляем текст, если он есть
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
        const canvas = await html2canvas(document.querySelector("#clothing-preview"));
        canvas.toBlob(async function (blob) {
            const formData = new FormData();
            formData.append('designImage', blob, 'design.png');
            formData.append('color', colorSelect.value);

            // Отправляем данные на сервер
            const response = await fetch('/api/create-order', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении дизайна.');
            }

            const data = await response.json();
            alert('Дизайн успешно сохранен!');
        });
    } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert('Произошла ошибка при сохранении дизайна.');
    }
}

// Добавляем обработчик для кнопки сохранения
saveDesignButton.addEventListener('click', saveDesign);