// routes/products.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const productService = require('../services/productService');

// Получение всех продуктов (публичный эндпоинт)
router.get('/', async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error) {
        // console.error('Error in route /products fetching all products:', error.originalError || error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Ошибка при получении продуктов.';
        res.status(statusCode).json({ message: message });
    }
});

// Получение одного продукта по ID (публичный эндпоинт)
router.get('/:id', async (req, res) => {
    const productId = req.params.id;
    console.log(`[SERVER LOG] Received request for product ID: ${productId}`);
    // --- ДОБАВЛЕНА ПРОВЕРКА ФОРМАТА ID ---
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        // Если ID не соответствует формату ObjectId, возвращаем 400 Bad Request
        return res.status(400).json({ message: 'Некорректный формат ID продукта.' });
    }
    // --- КОНЕЦ ПРОВЕРКИ ---

    try {
        // Вызываем сервис только если формат ID корректный
        const product = await productService.getProductById(productId);
        if (!product) {
            // Если ID был валиден, но продукт не найден в БД
            console.log(`[SERVER LOG] Product NOT FOUND for ID: ${productId}`);
            return res.status(404).json({ message: 'Продукт не найден.' });
        }
        console.log(`[SERVER LOG] Product FOUND for ID: ${productId}`, product);
        // Продукт найден, отправляем его
        res.json(product);
    } catch (error) {
        // Ловим только ошибки 500 из сервиса (ошибки БД) или другие непредвиденные
        console.error(`Error in route /products/:id for ID ${productId}:`, error.originalError || error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Ошибка при получении продукта.';
        res.status(statusCode).json({ message: message });
    }
});

// Создание нового продукта (защищенный эндпоинт)
//router.post('/', isLoggedIn, isAdmin, async (req, res) => {
router.post('/', async (req, res) => { // Вариант без middleware
    const { color, designImage } = req.body;
    const productInputData = { color, designImage };

    // Получаем ID пользователя из сессии (убедитесь, что сессия и ID существуют)
    const userId = req.session?.user?.id; // Используем optional chaining '?' на случай отсутствия сессии/user
    if (!userId) {
        // Эта проверка должна быть в middleware isLoggedIn, но дублируем на всякий случай
        return res.status(401).json({ message: 'Требуется аутентификация для создания продукта.' });
    }

    try {
        const newProduct = await productService.createProduct(productInputData, userId);
        res.status(201).json(newProduct); // Отправляем созданный продукт
    } catch (error) {
        // console.error('Error creating product in route:', error.originalError || error);
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Непредвиденная ошибка при создании продукта.';
        res.status(statusCode).json({ message: message, ...(error.details && { details: error.details }) });
    }
});

// --- Маршруты для обновления и удаления (если они понадобятся) ---
/*
router.put('/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Логика обновления продукта (вызов productService.updateProduct)
});

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Логика удаления продукта (вызов productService.deleteProduct)
});
*/

module.exports = router;