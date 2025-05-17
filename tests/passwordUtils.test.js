const { hashPassword, comparePasswords } = require('../utils/passwordUtils');

describe('Password Utilities', () => {
    const testPassword = 'MySecurePassword123!';
    let hashedPassword;

    describe('hashPassword', () => {
        it('должна хешировать предоставленный пароль', async () => {
            hashedPassword = await hashPassword(testPassword);
            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
            expect(hashedPassword.length).toBeGreaterThan(testPassword.length); 
        });

        it('должна генерировать разный хеш для одного и того же пароля при повторном вызове (из-за соли)', async () => {
            const hashedPasswordAgain = await hashPassword(testPassword);
            expect(hashedPasswordAgain).not.toBe(hashedPassword); 
        });

        it('должна выбрасывать ошибку, если пароль не предоставлен или пустой', async () => {
            await expect(hashPassword('')).rejects.toThrow('Password cannot be empty');
            await expect(hashPassword(null)).rejects.toThrow('Password cannot be empty');
            await expect(hashPassword(undefined)).rejects.toThrow('Password cannot be empty');
        });
    });

    describe('comparePasswords', () => {
        beforeAll(async () => {
            if (!hashedPassword) {
                hashedPassword = await hashPassword(testPassword);
            }
        });

        it('должна возвращать true для правильного пароля и хеша', async () => {
            const isMatch = await comparePasswords(testPassword, hashedPassword);
            expect(isMatch).toBe(true);
        });

        it('должна возвращать false для неверного пароля и хеша', async () => {
            const wrongPassword = 'WrongPassword123!';
            const isMatch = await comparePasswords(wrongPassword, hashedPassword);
            expect(isMatch).toBe(false);
        });

        it('должна возвращать false, если открытый пароль не предоставлен', async () => {
            expect(await comparePasswords('', hashedPassword)).toBe(false);
            expect(await comparePasswords(null, hashedPassword)).toBe(false);
            expect(await comparePasswords(undefined, hashedPassword)).toBe(false);
        });

        it('должна возвращать false, если хешированный пароль не предоставлен', async () => {
            expect(await comparePasswords(testPassword, '')).toBe(false);
            expect(await comparePasswords(testPassword, null)).toBe(false);
            expect(await comparePasswords(testPassword, undefined)).toBe(false);
        });
    });
});