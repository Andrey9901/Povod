const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');

// Настройка Multer для загрузки изображений
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Получение всех заказов пользователя
router.get('/:userId', async (req, res) => {
    try {
        const products = await Product.find({ userId: req.params.userId })
                                       .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Создание нового заказа
router.post('/', upload.single('designImage'), async (req, res) => {
    try {
        const { color, userId } = req.body;
        const product = new Product({
            userId,
            color,
            designImage: req.file ? req.file.filename : null
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Удаление заказа
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;