const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Подключение модели заказов
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth'); // Middleware для проверки авторизации

// Настройка Multer для загрузки изображений дизайна
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Получение всех заказов пользователя
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.username; // Идентификатор пользователя из сессии
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Сортировка по дате создания
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Ошибка при загрузке заказов.' });
    }
});

// Создание нового заказа
router.post(
    '/',
    [
        body('color').notEmpty().withMessage('Цвет обязателен.'),
        body('designImage').optional().isString().withMessage('Некорректное изображение.')
    ],
    upload.single('designImage'),
    authMiddleware,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { color } = req.body;
            const designImage = req.file ? req.file.filename : null;

            const order = new Order({
                userId: req.user.username, // Привязка заказа к пользователю
                color,
                designImage
            });

            await order.save();
            res.status(201).json({ message: 'Заказ успешно создан.', order });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Ошибка при создании заказа.' });
        }
    }
);

// Получение конкретного заказа
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId, userId: req.user.username });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден.' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ error: 'Ошибка при загрузке заказа.' });
    }
});

// Обновление заказа
router.put(
    '/:id',
    [
        body('color').optional().isString().withMessage('Некорректный цвет.'),
        body('designImage').optional().isString().withMessage('Некорректное изображение.')
    ],
    upload.single('designImage'),
    authMiddleware,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const orderId = req.params.id;
            const updates = {
                color: req.body.color,
                designImage: req.file ? req.file.filename : undefined
            };

            const updatedOrder = await Order.findOneAndUpdate(
                { _id: orderId, userId: req.user.username },
                { $set: updates },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Заказ не найден.' });
            }

            res.json({ message: 'Заказ успешно обновлен.', order: updatedOrder });
        } catch (error) {
            console.error('Error updating order:', error);
            res.status(500).json({ error: 'Ошибка при обновлении заказа.' });
        }
    }
);

// Удаление заказа
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const orderId = req.params.id;
        const deletedOrder = await Order.findOneAndDelete({ _id: orderId, userId: req.user.username });

        if (!deletedOrder) {
            return res.status(404).json({ error: 'Заказ не найден.' });
        }

        res.json({ message: 'Заказ успешно удален.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Ошибка при удалении заказа.' });
    }
});

module.exports = router;