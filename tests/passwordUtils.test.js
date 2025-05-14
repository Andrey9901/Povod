const { hashPassword, comparePasswords } = require('../utils/passwordUtils');

describe('Password Utilities', () => {
    const testPassword = 'MySecurePassword123!';
    let hashedPassword;

    describe('hashPassword', () => {
        it('should hash a given password', async () => {
            hashedPassword = await hashPassword(testPassword);
            expect(hashedPassword).toBeDefined();
            expect(typeof hashedPassword).toBe('string');
            expect(hashedPassword.length).toBeGreaterThan(testPassword.length); 
        });

        it('should produce a different hash for the same password if called again (due to salt)', async () => {
            const hashedPasswordAgain = await hashPassword(testPassword);
            expect(hashedPasswordAgain).not.toBe(hashedPassword); 
        });

        it('should throw an error if password is not provided or empty', async () => {
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

        it('should return true for a correct password and hash', async () => {
            const isMatch = await comparePasswords(testPassword, hashedPassword);
            expect(isMatch).toBe(true);
        });

        it('should return false for an incorrect password and hash', async () => {
            const wrongPassword = 'WrongPassword123!';
            const isMatch = await comparePasswords(wrongPassword, hashedPassword);
            expect(isMatch).toBe(false);
        });

        it('should return false if plainPassword is not provided', async () => {
            expect(await comparePasswords('', hashedPassword)).toBe(false);
            expect(await comparePasswords(null, hashedPassword)).toBe(false);
            expect(await comparePasswords(undefined, hashedPassword)).toBe(false);
        });

        it('should return false if hashedPassword is not provided', async () => {
            expect(await comparePasswords(testPassword, '')).toBe(false);
            expect(await comparePasswords(testPassword, null)).toBe(false);
            expect(await comparePasswords(testPassword, undefined)).toBe(false);
        });
    });
});