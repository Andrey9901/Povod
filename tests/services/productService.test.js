// tests/services/productService.test.js
const productService = require('@services/productService'); // Используем псевдоним
// или оставьте старый: const productService = require('../../services/productService');

const Product = require('@models/Product'); // Используем псевдоним
const mongoose = require('mongoose');

jest.mock('@models/Product');

describe('ProductService', () => {
    // ... остальной код теста productService.test.js из моего предыдущего полного ответа ...
    // (все describe и it блоки)
    let mockProductInputData;
    let mockUserId;
    let mockSavedProductData;
    let mockProductSaveFn;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserId = 'user-abc-123';
        mockProductInputData = { color: 'red', designImage: 'path/to/image.png' };
        mockSavedProductData = {
            _id: 'product-xyz-789',
            userId: mockUserId,
            color: mockProductInputData.color,
            designImage: mockProductInputData.designImage,
            createdAt: new Date()
        };

        mockProductSaveFn = jest.fn().mockResolvedValue(mockSavedProductData);
        Product.mockImplementation(() => ({
            save: mockProductSaveFn,
            userId: mockUserId,
            color: mockProductInputData.color,
            designImage: mockProductInputData.designImage,
        }));

        if (Product.findById) Product.findById.mockReset();
        if (Product.find) Product.find.mockReset().mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
    });

    describe('createProduct', () => {
        it('should create and save a product with valid data', async () => {
            const result = await productService.createProduct(mockProductInputData, mockUserId);

            expect(Product).toHaveBeenCalledTimes(1);
            expect(Product).toHaveBeenCalledWith({
                userId: mockUserId,
                color: mockProductInputData.color,
                designImage: mockProductInputData.designImage,
            });
            expect(mockProductSaveFn).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockSavedProductData);
        });

        it('should use undefined for designImage if not provided and save is successful', async () => {
            const inputWithoutImage = { color: 'blue' };
            const savedDataWithNullImage = {
                ...mockSavedProductData,
                userId: mockUserId,
                color: inputWithoutImage.color,
                designImage: null
            };
            mockProductSaveFn.mockResolvedValueOnce(savedDataWithNullImage);
            Product.mockImplementationOnce(() => ({
                save: mockProductSaveFn,
                userId: mockUserId,
                color: inputWithoutImage.color,
                designImage: undefined,
            }));

            const result = await productService.createProduct(inputWithoutImage, mockUserId);

            expect(Product).toHaveBeenCalledWith({
                userId: mockUserId,
                color: inputWithoutImage.color,
                designImage: undefined,
            });
            expect(mockProductSaveFn).toHaveBeenCalledTimes(1);
            expect(result.designImage).toBeNull();
            expect(result.color).toBe(inputWithoutImage.color);
        });

        it('should throw 400 error if color is missing or empty', async () => {
            const invalidDataMissingColor = { designImage: 'image.png' };
            await expect(productService.createProduct(invalidDataMissingColor, mockUserId))
                .rejects.toMatchObject({
                    message: 'Цвет продукта (color) обязателен и должен быть непустой строкой.',
                    statusCode: 400
                });

            const invalidDataEmptyColor = { ...mockProductInputData, color: '' };
            await expect(productService.createProduct(invalidDataEmptyColor, mockUserId))
                .rejects.toMatchObject({
                    message: 'Цвет продукта (color) обязателен и должен быть непустой строкой.',
                    statusCode: 400
                });
            expect(mockProductSaveFn).not.toHaveBeenCalled();
        });

        it('should throw 400 error if userId is missing', async () => {
            await expect(productService.createProduct(mockProductInputData, null))
                .rejects.toMatchObject({
                    message: 'Не предоставлен ID пользователя для создания продукта.',
                    statusCode: 400
                });
            expect(mockProductSaveFn).not.toHaveBeenCalled();
        });

        it('should throw 400 error with details if Mongoose validation fails on save', async () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.errors = { color: { message: 'Color is required by Mongoose due to schema' } };
            mockProductSaveFn.mockRejectedValueOnce(validationError);

            await expect(productService.createProduct(mockProductInputData, mockUserId))
                .rejects.toMatchObject({
                    message: 'Color is required by Mongoose due to schema',
                    statusCode: 400,
                    details: validationError.errors,
                    originalError: expect.objectContaining({ name: 'ValidationError' })
                });
        });

        it('should throw 500 error if database save fails for other reasons', async () => {
            const dbError = new Error('Generic DB Error on save');
            mockProductSaveFn.mockRejectedValueOnce(dbError);

            await expect(productService.createProduct(mockProductInputData, mockUserId))
                .rejects.toMatchObject({
                    message: 'Ошибка при сохранении продукта в базу данных.',
                    statusCode: 500,
                    originalError: dbError
                });
        });
    });

    describe('getProductById', () => {
        let mockExistingProductId;
        let mockProductDataFromDb;

        beforeEach(() => {
            mockExistingProductId = new mongoose.Types.ObjectId().toString();
            mockProductDataFromDb = { _id: mockExistingProductId, userId: 'user-abc-123', color: 'blue', designImage: 'image.jpg', createdAt: new Date() };
        });

        it('should return a product if found by ID', async () => {
            Product.findById.mockResolvedValue(mockProductDataFromDb);
            const result = await productService.getProductById(mockExistingProductId);
            expect(Product.findById).toHaveBeenCalledWith(mockExistingProductId);
            expect(result).toEqual(mockProductDataFromDb);
        });

        it('should return null if product is not found by ID', async () => {
            const nonExistingId = new mongoose.Types.ObjectId().toString();
            Product.findById.mockResolvedValue(null);
            const result = await productService.getProductById(nonExistingId);
            expect(Product.findById).toHaveBeenCalledWith(nonExistingId);
            expect(result).toBeNull();
        });

        it('should return null if productId is not a valid ObjectId format', async () => {
            const result = await productService.getProductById('invalid-id-format');
            expect(Product.findById).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should throw 500 error if database query (findById) fails', async () => {
            const dbError = new Error('Database findById connection error');
            Product.findById.mockRejectedValue(dbError);

            await expect(productService.getProductById(mockExistingProductId))
                .rejects.toMatchObject({
                    message: 'Ошибка при поиске продукта в базе данных.',
                    statusCode: 500,
                    originalError: dbError
                });
        });
    });

    describe('getAllProducts', () => {
        it('should return an array of products sorted by createdAt descending', async () => {
            const mockProductsArray = [
                { _id: 'prod1', color: 'red', createdAt: new Date('2023-01-02') },
                { _id: 'prod2', color: 'blue', createdAt: new Date('2023-01-01') },
            ];
            Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockProductsArray) });

            const result = await productService.getAllProducts();
            expect(Product.find).toHaveBeenCalledTimes(1);
            expect(Product.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toEqual(mockProductsArray);
        });

        it('should return an empty array if no products are found', async () => {
            Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
            const result = await productService.getAllProducts();
            expect(result).toEqual([]);
        });

        it('should throw 500 error if database query (find or sort) fails', async () => {
            const dbError = new Error('DB error on find/sort in getAllProducts');
            Product.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(dbError) });

            await expect(productService.getAllProducts())
                .rejects.toMatchObject({
                    message: 'Ошибка при получении списка продуктов из базы данных.',
                    statusCode: 500,
                    originalError: dbError
                });
        });
    });
});