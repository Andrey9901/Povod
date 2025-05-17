const userService = require('@services/userService');
const User = require('@models/User');
const { hashPassword } = require('@utils/passwordUtils');

jest.mock('@models/User');
jest.mock('@utils/passwordUtils');

describe('UserService', () => {
    let mockUserData;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserData = { _id: 'user123', username: 'testuser', email: 'test@example.com', password: 'hashedPassword123' };

        if (User.findOne) User.findOne.mockReset();

        if (User.mockImplementation) User.mockImplementation(() => ({ save: jest.fn() }));
        User.mockClear();
    });

    describe('findUserByUsername', () => {
        it('должен возвращать пользователя, если он найден по имени', async () => {
            User.findOne.mockResolvedValue(mockUserData);
            const user = await userService.findUserByUsername('testuser');
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(user).toEqual(mockUserData);
        });

        it('должен возвращать null, если пользователь не найден по имени', async () => {
            User.findOne.mockResolvedValue(null);
            const user = await userService.findUserByUsername('nonexistent');
            expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistent' });
            expect(user).toBeNull();
        });

        it('должен возвращать null, если имя пользователя пустое или не строка', async () => {
            expect(await userService.findUserByUsername('')).toBeNull();
            expect(await userService.findUserByUsername(null)).toBeNull();
            expect(await userService.findUserByUsername(undefined)).toBeNull();
            expect(User.findOne).not.toHaveBeenCalled();
        });

        it('должен отображать ошибку, если запрос к базе данных завершился неудачно', async () => {
            const dbError = new Error('DB findOne error');
            User.findOne.mockRejectedValue(dbError); // Мокируем User.findOne для возврата ошибки

            await expect(userService.findUserByUsername('testuser'))
                .rejects.toMatchObject({
                    message: 'Ошибка базы данных при поиске пользователя.',
                    statusCode: 500,
                    originalError: dbError
                });

            try {
                await userService.findUserByUsername('testuser_for_original_error_check');
            } catch (e) {
                expect(e.originalError.message).toBe(dbError.message);
            }
        });
    });

    describe('findExistingUser', () => {
        it('должен возвращать пользователя, если он найден по имени пользователя', async () => {
            User.findOne.mockResolvedValue(mockUserData);
            const user = await userService.findExistingUser('testuser', null);
            expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'testuser' }] });
            expect(user).toEqual(mockUserData);
        });

        it('должен возвращать пользователя, если он найден по email', async () => {
            User.findOne.mockResolvedValue(mockUserData);
            const user = await userService.findExistingUser(null, 'test@example.com');
            expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'test@example.com' }] });
            expect(user).toEqual(mockUserData);
        });

        it('должен возвращать пользователя, если он найден по имени пользователя или email', async () => {
            User.findOne.mockResolvedValue(mockUserData);
            const user = await userService.findExistingUser('testuser', 'test@example.com');
            expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'testuser' }, { email: 'test@example.com' }] });
            expect(user).toEqual(mockUserData);
        });

        it('должен возвращать null, если пользователь не найден', async () => {
            User.findOne.mockResolvedValue(null);
            const user = await userService.findExistingUser('nonexistent', 'no@example.com');
            expect(User.findOne).toHaveBeenCalledWith({ $or: [{ username: 'nonexistent' }, { email: 'no@example.com' }] });
            expect(user).toBeNull();
        });

        it('должен возвращать null, если имя пользователя и email неверны/пусты', async () => {
            expect(await userService.findExistingUser('', null)).toBeNull();
            expect(await userService.findExistingUser(null, '')).toBeNull();
            expect(await userService.findExistingUser(undefined, undefined)).toBeNull();
            expect(User.findOne).not.toHaveBeenCalled();
        });

        it('должен отображать ошибку при сбое запроса к БД', async () => {
            const dbError = new Error('DB findOne $or error');
            User.findOne.mockRejectedValue(dbError);
            await expect(userService.findExistingUser('testuser', 'test@example.com'))
                .rejects.toMatchObject({
                    message: 'Ошибка базы данных при проверке пользователя.',
                    statusCode: 500,
                    originalError: dbError
                });
        });
    });

    describe('createUser', () => {
        let mockUserInput;
        let mockHashedPassword = 'hashedNewPassword';
        let mockSavedUserData;
        let mockUserSaveFn;

        beforeEach(() => {
            mockUserInput = { username: 'newuser', email: 'new@example.com', password: 'newPassword123' };
            mockSavedUserData = {
                _id: 'newUser456',
                username: mockUserInput.username,
                email: mockUserInput.email,
                password: mockHashedPassword,
            };
            hashPassword.mockResolvedValue(mockHashedPassword);
            mockUserSaveFn = jest.fn().mockResolvedValue(mockSavedUserData);
            User.mockImplementation(() => ({
                save: mockUserSaveFn,
                username: mockUserInput.username,
                email: mockUserInput.email,
                password: mockHashedPassword
            }));
        });

        it('должен успешно создавать и сохранять нового пользователя', async () => {
            const user = await userService.createUser(mockUserInput);
            expect(hashPassword).toHaveBeenCalledWith(mockUserInput.password);
            expect(User).toHaveBeenCalledTimes(1);
            expect(User).toHaveBeenCalledWith({
                username: mockUserInput.username,
                email: mockUserInput.email,
                password: mockHashedPassword,
            });
            expect(mockUserSaveFn).toHaveBeenCalledTimes(1);
            expect(user).toEqual(mockSavedUserData);
        });

        it('должен отображать ошибку 400, если отсутствуют обязательные поля', async () => {
            await expect(userService.createUser({ username: 'u', email: 'e@e.com', password: '' }))
                .rejects.toMatchObject({
                    message: 'Имя пользователя, email и пароль обязательны.',
                    statusCode: 400
                });
            expect(mockUserSaveFn).not.toHaveBeenCalled();
        });

        it('должен отображать ошибку 409, если пользователь с таким именем уже существует', async () => {
            const duplicateError = new Error('E11000 duplicate key error collection: test.users index: username_1 dup key: { username: "newuser" }');
            duplicateError.code = 11000;
            mockUserSaveFn.mockRejectedValueOnce(duplicateError);

            await expect(userService.createUser(mockUserInput))
                .rejects.toMatchObject({
                    message: 'Пользователь с таким имя пользователя уже существует.',
                    statusCode: 409,
                    originalError: expect.objectContaining({ code: 11000 })
                });
        });

        it('должен отображать ошибку 409, если пользователь с таким email уже существует', async () => {
            const duplicateError = new Error('E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "new@example.com" }');
            duplicateError.code = 11000;
            mockUserSaveFn.mockRejectedValueOnce(duplicateError);

            await expect(userService.createUser(mockUserInput))
                .rejects.toMatchObject({
                    message: 'Пользователь с таким email уже существует.',
                    statusCode: 409,
                    originalError: expect.objectContaining({ code: 11000 })
                });
        });

        it('должен отображать ошибку 400 при ошибке валидации Mongoose', async () => {
            const validationError = new Error('User validation failed: email: Path `email` is invalid.');
            validationError.name = 'ValidationError';
            validationError.errors = { email: { message: 'Path `email` is invalid.' } };
            mockUserSaveFn.mockRejectedValueOnce(validationError);

            await expect(userService.createUser(mockUserInput))
                .rejects.toMatchObject({
                    message: 'Path `email` is invalid.',
                    statusCode: 400,
                    details: validationError.errors,
                    originalError: expect.objectContaining({ name: 'ValidationError' })
                });
        });

        it('должен отображать ошибку 500 при других ошибках сохранения в БД', async () => {
            const dbError = new Error('Some other DB error during save');
            mockUserSaveFn.mockRejectedValueOnce(dbError);

            await expect(userService.createUser(mockUserInput))
                .rejects.toMatchObject({
                    message: 'Ошибка при создании пользователя в базе данных.',
                    statusCode: 500,
                    originalError: dbError
                });
        });
    });
});