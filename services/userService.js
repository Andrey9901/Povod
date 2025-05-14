const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');

async function findUserByUsername(username) {
    if (!username || typeof username !== 'string' || username.trim() === '') {
        return null;
    }
    try {
        return await User.findOne({ username });
    } catch (dbError) {
        const error = new Error('Ошибка базы данных при поиске пользователя.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

async function findExistingUser(username, email) {
    if ((!username || typeof username !== 'string' || username.trim() === '') &&
        (!email || typeof email !== 'string' || email.trim() === '')) {
        return null;
    }
    try {
        const queryOr = [];
        if (username && typeof username === 'string' && username.trim() !== '') { queryOr.push({ username }); }
        if (email && typeof email === 'string' && email.trim() !== '') { queryOr.push({ email }); }
        if (queryOr.length === 0) return null;

        return await User.findOne({ $or: queryOr });
    } catch (dbError) {
        const error = new Error('Ошибка базы данных при проверке пользователя.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

async function createUser({ username, email, password }) {
    if (!username || !email || !password) {
        const error = new Error('Имя пользователя, email и пароль обязательны.');
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        const savedUser = await newUser.save();
        return savedUser;
    } catch (dbError) {
        if (dbError.name === 'ValidationError') {
            let message = 'Ошибка валидации данных пользователя.';
            if (dbError.errors) {
                const firstErrorKey = Object.keys(dbError.errors)[0];
                if (firstErrorKey) {
                    // eslint-disable-next-line security/detect-object-injection
                    message = dbError.errors[firstErrorKey].message;
                }
            }
            const error = new Error(message);
            error.statusCode = 400;
            error.details = dbError.errors;
            error.originalError = dbError;
            throw error;
        }
        if (dbError.code === 11000 || (dbError.message && dbError.message.includes('duplicate key'))) {
            const field = dbError.message.includes('username') ? 'имя пользователя' : dbError.message.includes('email') ? 'email' : 'поле';
            const error = new Error(`Пользователь с таким ${field} уже существует.`);
            error.statusCode = 409;
            error.originalError = dbError;
            throw error;
        }
        console.error('Database error in createUser:', dbError);
        const error = new Error('Ошибка при создании пользователя в базе данных.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

module.exports = { findUserByUsername, findExistingUser, createUser };