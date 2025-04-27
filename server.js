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

// Добавляем CORS-заголовки
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'povod-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/povod', {
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

// Middleware для проверки авторизации
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    console.log('Unauthorized access attempt to protected route'); // Логирование
    res.redirect('/login'); // Перенаправление на страницу входа
}

// Маршруты для HTML-страниц
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/catalog', (req, res) => res.sendFile(path.join(__dirname, 'public', 'catalog.html')));
app.get('/constructor', (req, res) => res.sendFile(path.join(__dirname, 'public', 'constructor.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));

// Маршрут для страницы профиля (HTML)
app.get('/profile', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Маршрут для API профиля (JSON)
app.get('/api/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.user.username });
        if (!user) {
            return res.status(404).send('Пользователь не найден.');
        }
        const orders = await Product.find({ userId: user.username }).sort({ createdAt: -1 });
        res.json({
            user: {
                username: user.username,
                email: user.email,
            },
            orders: orders.map(order => ({
                id: order._id,
                color: order.color,
                designImage: order.designImage,
                createdAt: order.createdAt,
            })),
        });
    } catch (error) {
        console.error('Profile API error:', error);
        res.status(500).send('Ошибка при загрузке данных профиля.');
    }
});

// Регистрация
app.post('/register', [
    body('username').notEmpty().withMessage('Имя пользователя обязательно.'),
    body('email').isEmail().withMessage('Некорректный email.'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов.'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают.');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    try {
        console.log('Attempting registration with username:', username); // Логирование попытки регистрации
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.error('User already exists:', username); // Логирование существующего пользователя
            return res.status(409).send('Пользователь с таким именем или email уже существует.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully:', newUser.username); // Логирование успешной регистрации
        res.status(201).redirect('/login');
    } catch (error) {
        console.error('Registration error:', error); // Логирование ошибок во время регистрации
        res.status(500).send('Ошибка при регистрации.');
    }
});

// Вход
app.post('/login', [
    body('username').notEmpty().withMessage('Имя пользователя обязательно.'),
    body('password').notEmpty().withMessage('Пароль обязателен.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
        console.log('Attempting login with username:', username); // Логирование попытки входа
        const user = await User.findOne({ username });
        if (!user) {
            console.error('User not found:', username); // Логирование, если пользователь не найден
            return res.status(401).send('Неверное имя пользователя или пароль.');
        }
        console.log('User found in database:', user.username); // Логирование найденного пользователя
        console.log('Comparing passwords...'); // Логирование начала сравнения паролей
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('Password mismatch for user:', username); // Логирование несовпадения паролей
            return res.status(401).send('Неверное имя пользователя или пароль.');
        }
        req.session.user = { username: user.username };
        console.log('Login successful for user:', user.username); // Логирование успешного входа
        res.redirect('/profile');
    } catch (error) {
        console.error('Login error:', error); // Логирование ошибок во время входа
        res.status(500).send('Ошибка при входе.');
    }
});
// Конфигурация Multer для загрузки аватаров
const avatarStorage = multer.diskStorage({
    destination: './avatars/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const uploadAvatar = multer({ storage: avatarStorage });

// API для обновления аватара
app.post('/api/update-avatar', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const userId = req.session.user?.username || 'guest';
        const user = await User.findOne({ username: userId });

        if (!user) {
            return res.status(404).send('Пользователь не найден.');
        }

        const avatarPath = req.file ? req.file.filename : null;
        user.avatar = avatarPath;
        await user.save();

        res.json({ avatar: `/avatars/${avatarPath}` });
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Выход из системы
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Ошибка при выходе.');
        }
        res.redirect('/');
    });
});

// Конструктор одежды
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
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/healthz', (req, res) => {
    // Проверка состояния mongose
    if (mongoose.connection.readyState === 1) { // 1 = connected
        res.status(200).send('OK');
    } else {
        res.status(503).send('Service Unavailable'); // Или другой код ошибки
    }
});
// Обработка 404
app.use((req, res) => {
    console.log('404 Not Found:', req.url);
    res.status(404).send('Страница не найдена');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).send('Что-то пошло не так!');
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));