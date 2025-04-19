const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Пример базы данных пользователей (в реальном проекте используйте MongoDB/MySQL)
const users = [];

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
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // Сохраняем пользователя в сессии
        res.redirect('/profile');
    } else {
        res.send('<p>Неверное имя пользователя или пароль. <a href="/auth/login">Попробовать снова</a>.</p>');
    }
});

// Страница регистрации
router.get('/register', (req, res) => {
    res.send(`
        <h1>Регистрация</h1>
        <form action="/auth/register" method="POST">
            <label for="username">Имя пользователя:</label>
            <input type="text" id="username" name="username" required><br>
            <label for="password">Пароль:</label>
            <input type="password" id="password" name="password" required><br>
            <button type="submit">Зарегистрироваться</button>
        </form>
        <a href="/auth/login">Уже есть аккаунт? Войти</a>
    `);
});

// Обработка регистрации
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (users.some(u => u.username === username)) {
        return res.send('<p>Пользователь с таким именем уже существует. <a href="/auth/register">Попробовать снова</a>.</p>');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    res.redirect('/auth/login');
});

// Выход из системы
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Ошибка при выходе.');
        }
        res.redirect('/');
    });
});

module.exports = router;