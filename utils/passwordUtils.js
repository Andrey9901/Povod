const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

/**
 * Хэширует пароль.
 * @param {string} plainPassword - Пароль в открытом виде.
 * @returns {Promise<string>} - Промис, который разрешается хэшированным паролем.
 */
async function hashPassword(plainPassword) {
    if (!plainPassword) {
        throw new Error('Password cannot be empty');
    }
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Сравнивает пароль в открытом виде с хэшем.
 * @param {string} plainPassword - Пароль в открытом виде.
 * @param {string} hashedPassword - Хэшированный пароль.
 * @returns {Promise<boolean>} - Промис, который разрешается true, если пароли совпадают, иначе false.
 */
async function comparePasswords(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
        return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePasswords,
};