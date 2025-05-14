document.addEventListener('DOMContentLoaded', async () => {
    console.log('Profile.js: DOMContentLoaded, starting fetch.'); // Лог старта

    // Находим элементы DOM один раз
    const nameElement = document.getElementById('user-name');
    const emailElement = document.getElementById('user-email');
    const avatarElement = document.getElementById('user-avatar');
    const ordersListElement = document.getElementById('orders-list');
    const ordersCountElement = document.getElementById('orders-count');
    const avatarUploadInput = document.getElementById('avatar-upload');

    // Проверяем наличие всех необходимых элементов
    if (!nameElement || !emailElement || !avatarElement || !ordersListElement || !ordersCountElement || !avatarUploadInput) {
        console.error('Profile page: One or more required HTML elements not found!');
        // Можно показать сообщение об ошибке пользователю
        if (ordersListElement) ordersListElement.innerHTML = '<p>Ошибка: Не найдены все элементы интерфейса.</p>';
        return; // Прерываем выполнение скрипта
    }

    // Функция для загрузки и отображения данных профиля
    async function fetchAndDisplayProfile() {
        try {
            console.log('Profile.js: Fetching /api/profile...');
            const response = await fetch('/api/profile', {
                method: 'GET', // Метод GET по умолчанию, но укажем для ясности
                headers: {
                    'Accept': 'application/json' // Явно указываем, что ожидаем JSON
                },
                credentials: 'include' // ВАЖНО: для отправки кук сессии
            });
            console.log('Profile.js: Received response status:', response.status);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Profile.js: Unauthorized (401/403), redirecting to login.');
                    window.location.href = '/login'; // Редирект на страницу входа
                } else {
                    const errorText = await response.text(); // Пытаемся получить текст ошибки
                    console.error(`Profile.js: Server error ${response.status}`, errorText);
                    throw new Error(`Ошибка сервера: ${response.status}`);
                }
                return; // Прерываем, если не OK
            }

            const data = await response.json();
            console.log('Profile.js: Received profile data:', data);

            // Отображение данных пользователя
            if (data.user) {
                nameElement.textContent = data.user.username || 'Не указано';
                emailElement.textContent = data.user.email || 'Не указано';
                // Используем правильный путь к аватарам
                const avatarPath = data.user.avatar ? `/avatars/${data.user.avatar}` : '/default-avatar.jpg';
                avatarElement.src = avatarPath;
            } else {
                console.error('Profile.js: User data not found in server response.');
                nameElement.textContent = 'Ошибка';
                emailElement.textContent = 'Ошибка';
            }

            // Отображение созданных продуктов ("заказов")
            // Используем поле createdProducts, как возвращает обновленный API
             if (data.createdProducts && Array.isArray(data.createdProducts)) {
            ordersCountElement.textContent = data.createdProducts.length;
            if (data.createdProducts.length > 0) {
                // Генерируем HTML для списка продуктов с изображениями
                ordersListElement.innerHTML = '<ul>' +
                    data.createdProducts.map(product => {
                        // Проверяем, есть ли поле designImage
                        const designImage = product.designImage ? `/uploads/${product.designImage}` : '/default-image.png'; // Замените на путь к дефолтному изображению
                        return `<li>
                            <img src="${designImage}" alt="Продукт" style="max-width: 100px; max-height: 100px;" />
                            Цвет: ${product.color || '-'} - Создан: ${new Date(product.createdAt).toLocaleDateString()}
                        </li>`;
                    }).join('') +
                    '</ul>';
            } else {
                ordersListElement.innerHTML = '<p>Вы еще не создали ни одного продукта.</p>';
            }
        } else {
            console.error('Profile.js: createdProducts data not found or not an array.');
            ordersListElement.innerHTML = '<p>Не удалось загрузить данные о продуктах.</p>';
            ordersCountElement.textContent = '0';
        }
        
        } catch (error) { // Ловит сетевые ошибки (Failed to fetch) и ошибки из throw new Error
            console.error('Profile.js: Failed to fetch or process profile data:', error);
            nameElement.textContent = 'Ошибка';
            emailElement.textContent = 'Ошибка';
            ordersListElement.innerHTML = '<p>Не удалось загрузить профиль. Проверьте соединение или попробуйте войти снова.</p>';
            // alert(`Произошла ошибка: ${error.message}. Попробуйте войти снова.`); // Убрали alert
        }
    }

    // Функция для настройки загрузки аватара
    function setupAvatarUpload() {
        avatarUploadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file); // Имя поля должно совпадать с ожиданиями multer на сервере ('avatar')

            try {
                console.log('Profile.js: Uploading avatar...');
                const uploadResponse = await fetch('/api/update-avatar', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include' // Отправляем куки
                    // Content-Type не указываем, браузер сам поставит multipart/form-data с boundary
                });
                console.log('Profile.js: Avatar upload response status:', uploadResponse.status);

                if (uploadResponse.ok) { // Статус 200-299
                    const result = await uploadResponse.json();
                    if (result.avatar) {
                        avatarElement.src = result.avatar; // Обновляем src аватара
                        alert('Аватар успешно обновлен!');
                    } else {
                        // Сервер вернул 2xx, но без пути к аватару
                        console.error('Profile.js: Avatar upload response missing avatar path.');
                        alert('Не удалось обновить аватар (ошибка ответа сервера).');
                    }
                } else {
                    // Обработка ошибки от сервера
                    const errorResult = await uploadResponse.json().catch(() => ({ message: uploadResponse.statusText })); // Пытаемся прочитать JSON ошибки или берем статус
                    console.error('Profile.js: Avatar upload failed:', errorResult);
                    if (uploadResponse.status === 401 || uploadResponse.status === 403) {
                        alert('Ваша сессия истекла. Пожалуйста, войдите снова.');
                        window.location.href = '/login';
                    } else {
                        alert(`Произошла ошибка при обновлении аватара: ${errorResult.message || uploadResponse.statusText}`);
                    }
                }
            } catch (error) { // Сетевая ошибка
                console.error('Profile.js: Error uploading avatar:', error);
                alert(`Произошла ошибка при обновлении аватара: ${error.message}`);
            }
        });
    }

    // --- Выполнение при загрузке ---
    await fetchAndDisplayProfile(); // Загружаем данные профиля
    setupAvatarUpload(); // Настраиваем загрузку аватара

}); // Конец DOMContentLoaded