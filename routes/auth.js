const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Импортируем модель пользователя

// Страница входа
router.get('/login', (req, res) => {
    res.send(`
        <h1>Вход</h1>
        <form action="/auth/login" method="POST">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Войти</button>
        </form>
        <a href="/auth/register">Зарегистрироваться</a>
    `);
});

// Обработка входа
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Находим пользователя в базе данных
        const user = await User.findOne({ username });
        if (!user) {
            return res.send('<p>Неверное имя пользователя или пароль. <a href="/auth/login">Попробовать снова</a>.</p>');
        }

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send('<p>Неверное имя пользователя или пароль. <a href="/auth/login">Попробовать снова</a>.</p>');
        }

        // Сохраняем пользователя в сессии
        req.session.user = { username: user.username };
        res.redirect('/profile');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Ошибка при входе.');
    }
});

// Страница регистрации
router.get('/register', (req, res) => {
    res.send(`
        <h1>Регистрация</h1>
        <form action="/auth/register" method="POST">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required><br>
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Зарегистрироваться</button>
        </form>
        <a href="/auth/login">Уже есть аккаунт? Войти</a>
    `);
});

// Обработка регистрации
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Проверяем, существует ли пользователь с таким именем или email
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.send('<p>Пользователь с таким именем или email уже существует. <a href="/auth/register">Попробовать снова</a>.</p>');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Перенаправляем на страницу входа
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Ошибка при регистрации.');
    }
});

// Выход из системы
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Ошибка при выходе.');
        }
        res.redirect('/');
    });
});

module.exports = router;