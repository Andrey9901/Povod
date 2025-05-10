// services/productService.js
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ... остальной код productService.js без изменений ...
async function createProduct(productData, userId) {
    const { color, designImage } = productData;

    if (!color || typeof color !== 'string' || color.trim() === '') {
        const error = new Error('Цвет продукта (color) обязателен и должен быть непустой строкой.');
        error.statusCode = 400;
        throw error;
    }
    if (!userId) {
        const error = new Error('Не предоставлен ID пользователя для создания продукта.');
        error.statusCode = 400;
        throw error;
    }

    const productInstance = new Product({
        userId,
        color,
        designImage,
    });

    try {
        const savedProduct = await productInstance.save();
        return savedProduct;
    } catch (dbError) {
        if (dbError.name === 'ValidationError') {
            let message = 'Ошибка валидации данных продукта при сохранении.';
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
            const error = new Error('Ошибка уникальности при создании продукта.');
            error.statusCode = 409;
            error.originalError = dbError;
            throw error;
        }
        console.error('Database error in createProduct:', dbError);
        const error = new Error('Ошибка при сохранении продукта в базу данных.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

async function getProductById(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return null;
    }
    try {
        const product = await Product.findById(productId);
        return product;
    } catch (dbError) {
        console.error(`Database error in getProductById for ID ${productId}:`, dbError);
        const error = new Error('Ошибка при поиске продукта в базе данных.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

async function getAllProducts() {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return products;
    } catch (dbError) {
        console.error('Error fetching all products:', dbError);
        const error = new Error('Ошибка при получении списка продуктов из базы данных.');
        error.statusCode = 500;
        error.originalError = dbError;
        throw error;
    }
}

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
};