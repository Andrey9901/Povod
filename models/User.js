const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Определяем схему пользователя
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3 // Минимальная длина имени пользователя
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Приводим email к нижнему регистру
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Введите корректный email'] // Валидация email
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Минимальная длина пароля
    }
}, {
    timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Хеширование пароля перед сохранением в базу данных
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Если пароль не изменился, пропускаем хеширование
    try {
        const salt = await bcrypt.genSalt(10); // Генерация "соли" для хеширования
        this.password = await bcrypt.hash(this.password, salt); // Хеширование пароля
        next();
    } catch (error) {
        next(error);
    }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); // Сравниваем введенный пароль с хешированным
};

// Создаем индекс для улучшения поиска
userSchema.index({ username: 1 });

// Создаем модель
const User = mongoose.model('User', userSchema);

module.exports = User;