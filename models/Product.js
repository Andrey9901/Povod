const mongoose = require('mongoose');

// Определяем схему документа
const productSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    designImage: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Создаем индекс для улучшения поиска
productSchema.index({ userId: 1, createdAt: -1 });

// Создаем модель
const Product = mongoose.model('Product', productSchema);

module.exports = Product;