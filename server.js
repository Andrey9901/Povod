require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Включите secure=true для HTTPS в продакшене
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // Срок действия сессии (24 часа)
    }
}));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/custom-tshirt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Остановка сервера при ошибке подключения
    });

// Модели
const User = require('./models/User');
const Product = require('./models/Product');

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Маршруты
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/catalog', (req, res) => res.sendFile(path.join(__dirname, 'public', 'catalog.html')));
app.get('/constructor', (req, res) => res.sendFile(path.join(__dirname, 'public', 'constructor.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));

// Регистрация
app.post('/register',
    [
        body('username').isLength({ min: 3 }).withMessage('Имя пользователя должно содержать минимум 3 символа'),
        body('email').isEmail().withMessage('Неверный формат email'),
        body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Пароли не совпадают');
            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, email, password } = req.body;

            console.log('Attempting registration for:', { username, email }); // Логирование

            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                console.log('User already exists:', { username, email }); // Логирование
                return res.status(409).send('Пользователь с таким именем или email уже существует.');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Hashed password:', hashedPassword); // Логирование хэшированного пароля

            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            console.log('User registered successfully:', { username, email }); // Логирование успешной регистрации
            res.status(201).redirect('/login');
        } catch (error) {
            console.error('Registration error:', error); // Логирование ошибки
            res.status(500).send('Ошибка при регистрации.');
        }
    }
);

// Вход
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Attempting login for:', username); // Логирование

    if (!username || !password) {
        return res.status(400).send('Имя пользователя и пароль обязательны.');
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username); // Логирование
            return res.status(401).send('Неверное имя пользователя или пароль.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Логирование результата сравнения паролей

        if (!isMatch) {
            console.log('Incorrect password for user:', username); // Логирование
            return res.status(401).send('Неверное имя пользователя или пароль.');
        }

        req.session.user = { username: user.username };
        console.log('Login successful for:', username); // Логирование
        res.redirect('/profile');
    } catch (error) {
        console.error('Login error:', error); // Логирование
        res.status(500).send('Ошибка при входе.');
    }
});

// Профиль
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        console.log('Unauthorized access attempt to /profile'); // Логирование
        return res.status(401).send('Необходимо войти в систему.');
    }
    res.send(`
        <h1>Профиль</h1>
        <p>Добро пожаловать, ${req.session.user.username}!</p>
        <a href="/auth/logout">Выйти</a>
    `);
});

// Выход из системы
app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err); // Логирование
            return res.status(500).send('Ошибка при выходе.');
        }
        res.redirect('/');
    });
});

// Конструктор одежды
app.get('/api/colors', (req, res) => res.json({ colors: ['white', 'black', 'red', 'blue', 'green'] }));

app.post('/api/create-order', upload.single('designImage'), async (req, res) => {
    try {
        const { color } = req.body;
        const designImagePath = req.file ? req.file.filename : null;
        const product = new Product({
            userId: req.session.user?.username || 'guest',
            color,
            designImage: designImagePath,
        });
        await product.save();
        res.status(201).json({ message: 'Order created successfully', product });
    } catch (error) {
        console.error('Order creation error:', error); // Логирование
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Обработка 404
app.use((req, res) => {
    console.log('404 Not Found:', req.url); // Логирование
    res.status(404).send('Страница не найдена');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack); // Логирование
    res.status(500).send('Что-то пошло не так!');
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));