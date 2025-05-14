const express = require('express');
const router = express.Router();
const { comparePasswords } = require('../utils/passwordUtils');
const userService = require('../services/userService');

// POST /auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Имя пользователя и пароль обязательны.' });
        }
        const user = await userService.findUserByUsername(username);

        /* eslint-disable security/detect-possible-timing-attacks */
        if (!user || !(await comparePasswords(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль.' });
        }

        req.session.user = { username: user.username, id: user._id };
        req.session.save((err) => {
            if (err) {
                console.error('Session save error on login:', err);
                return res.status(500).json({ success: false, message: 'Ошибка сохранения сессии.' });
            }
            const userResponse = { _id: user._id, username: user.username, email: user.email };
            return res.status(200).json({ success: true, message: 'Вход выполнен успешно.', user: userResponse });
        });
    } catch (error) {
        console.error('Login error in route:', error.originalError || error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Ошибка сервера при попытке входа.';
        return res.status(statusCode).json({ success: false, message: message });
    }
});

// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    try {
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Все поля (username, email, password, confirmPassword) обязательны.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Пароли не совпадают.' });
        }
        const existingUser = await userService.findExistingUser(username, email);
        if (existingUser) {
            let field = existingUser.username === username ? 'Имя пользователя' : 'Email';
            return res.status(409).json({ success: false, message: `${field} уже используется.` });
        }
        const newUser = await userService.createUser({ username, email, password });
        const userResponse = { _id: newUser._id, username: newUser.username, email: newUser.email };
        return res.status(201).json({ success: true, message: 'Регистрация прошла успешно.', user: userResponse });
    } catch (error) {
        console.error('Registration error in route:', error.originalError || error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Ошибка сервера при регистрации.';
        return res.status(statusCode).json({ success: false, message: message });
    }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Ошибка при выходе.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Выход выполнен успешно.' });
    });
});

module.exports = router;