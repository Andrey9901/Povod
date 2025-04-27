// test-bcrypt.js
const bcrypt = require('bcryptjs');

async function testPassword() {
    try {
        // Исходный пароль
        const password = 'GuestOne2726!';

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        // Сравниваем исходный пароль с хешем
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log('Password match:', isMatch); // Должно быть true

        // Проверяем случай с неверным паролем
        const wrongPassword = 'WrongPassword123!';
        const isWrongMatch = await bcrypt.compare(wrongPassword, hashedPassword);
        console.log('Wrong password match:', isWrongMatch); // Должно быть false
    } catch (error) {
        console.error('Error during testing:', error);
    }
}

// Запускаем тест
testPassword();