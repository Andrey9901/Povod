document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Проверка авторизации
        if (!document.cookie.includes('connect.sid')) {
            alert('Необходимо войти в систему.');
            window.location.href = '/login';
            return;
        }

        // Отправляем GET-запрос на сервер для получения данных профиля
        const response = await fetch('/api/profile');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных профиля.');
        }
        const data = await response.json();

        // Заполняем информацию о пользователе
        document.getElementById('user-name').textContent = data.user.username;
        document.getElementById('user-email').textContent = data.user.email;

        // Устанавливаем аватар пользователя (если есть)
        const avatarUrl = data.user.avatar || 'default-avatar.jpg';
        document.getElementById('user-avatar').src = avatarUrl;

        // Обработка загрузки аватара
        const avatarInput = document.getElementById('avatar-upload');
        avatarInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('avatar', file);

                try {
                    const uploadResponse = await fetch('/api/update-avatar', {
                        method: 'POST',
                        body: formData,
                    });

                    if (uploadResponse.ok) {
                        const updatedData = await uploadResponse.json();
                        document.getElementById('user-avatar').src = updatedData.avatar;
                        alert('Аватар успешно обновлен!');
                    } else {
                        console.error('Ошибка при обновлении аватара:', uploadResponse.statusText);
                        alert('Произошла ошибка при обновлении аватара.');
                    }
                } catch (error) {
                    console.error('Error updating avatar:', error);
                    alert('Произошла ошибка при обновлении аватара.');
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        alert('Произошла ошибка при загрузке данных профиля.');
    }
});