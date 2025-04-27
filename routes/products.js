const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Импортируем модель Product
const multer = require('multer');
const path = require('path');

// Настройка Multer для загрузки изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Папка для сохранения загруженных файлов
    },
    filename: (req, file, cb) => {
        // Генерация уникального имени файла
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Получение всех заказов пользователя
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Поиск всех заказов пользователя, отсортированных по дате создания
        const products = await Product.find({ userId }).sort({ createdAt: -1 });
        res.json(products); // Возвращаем заказы в формате JSON
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении заказов.' });
    }
});

// Создание нового заказа
router.post('/', upload.single('designImage'), async (req, res) => {
    try {
        const { color, userId } = req.body;
        const designImagePath = req.file ? req.file.filename : null; // Путь к изображению дизайна

        // Создание нового заказа
        const product = new Product({
            userId,
            color,
            designImage: designImagePath,
        });

        await product.save(); // Сохранение заказа в базе данных
        res.status(201).json(product); // Возвращаем созданный заказ в формате JSON
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Ошибка сервера при создании заказа.' });
    }
});

// Удаление заказа
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Поиск и удаление заказа по ID
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ error: 'Заказ не найден.' });
        }

        res.json({ message: 'Заказ успешно удален.' }); // Подтверждение удаления
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Ошибка сервера при удалении заказа.' });
    }
});

module.exports = router;