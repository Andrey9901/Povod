require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

// --- Импорт роутеров ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// --- Базовые Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (_req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        return res.status(200).json({});
    }
    next();
});

// --- Статические файлы ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// --- Сессии (ДО роутов) ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'povod-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// --- Подключение к MongoDB ---
const mongoURI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/povod_test'
    : process.env.MONGODB_URI || 'mongodb://localhost:27017/povod';
console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[SERVER] Connecting to MongoDB at: ${mongoURI}`);
mongoose.connect(mongoURI, {});

// --- Multer ---
const storage = multer.diskStorage({ destination: (_req, _file, cb) => cb(null, 'uploads/'), filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage });
const avatarStorage = multer.diskStorage({ destination: './avatars/', filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const uploadAvatar = multer({ storage: avatarStorage });

// --- Middleware ensureAuthenticated ---
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user && req.session.user.id) {
        return next();
    }
    console.log('Unauthorized access attempt to protected route:', req.originalUrl);
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    return res.redirect('/login');
}

// --- ОСНОВНЫЕ РОУТЕРЫ ---
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// --- ОТДАЧА HTML СТРАНИЦ ---
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/register', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/catalog', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'catalog.html')));
app.get('/constructor', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'constructor.html')));
app.get('/about', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/profile', ensureAuthenticated, (req, res) => { // req используется в ensureAuthenticated
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// --- ДРУГИЕ API ЭНДПОИНТЫ ---
app.get('/api/profile', ensureAuthenticated, async (req, res) => {
    try {
        const User = require('./models/User'); // Локальный require модели
        const Product = require('./models/Product'); // Локальный require модели
        const user = await User.findById(req.session.user.id).select('-password');
        if (!user) { return res.status(404).json({ message: 'Пользователь не найден.' }); }
        const userProducts = await Product.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
        res.json({
            user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar },
            createdProducts: userProducts.map(p => ({ id: p._id, color: p.color, designImage: p.designImage, createdAt: p.createdAt })),
        });
    } catch (error) {
        console.error('Profile API error:', error);
        res.status(500).json({ message: 'Ошибка при загрузке данных профиля.' });
    }
});

app.post('/api/update-avatar', ensureAuthenticated, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const User = require('./models/User');
        const user = await User.findById(req.session.user.id);
        if (!user) { return res.status(404).json({ message: 'Пользователь не найден.' }); }
        if (!req.file) { return res.status(400).json({ message: 'Файл аватара не был загружен.' }); }
        user.avatar = req.file.filename;
        await user.save();
        res.json({ avatar: `/avatars/${user.avatar}` });
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении аватара' });
    }
});

app.post('/api/create-product', ensureAuthenticated, upload.single('designImage'), async (req, res) => {
    try {
        const Product = require('./models/Product');
        const { color } = req.body;
        if (!color) { return res.status(400).json({ message: 'Цвет обязателен.' }); }
        const designImagePath = req.file ? req.file.filename : null;
        const product = new Product({ userId: req.session.user.id, color, designImage: designImagePath });
        const savedProduct = await product.save();
        res.status(201).json({ message: 'Продукт успешно создан', product: savedProduct });
    } catch (error) {
        console.error('Product creation API error:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании продукта' });
    }
});

app.get('/healthz', (_req, res) => {
    if (mongoose.connection.readyState === 1) { res.status(200).send('OK'); }
    else { res.status(503).send('Service Unavailable'); }
});

// 404 handler
app.use((_req, res, _next) => {
    const filePath404 = path.join(__dirname, 'public', '404.html');
    if (require('fs').existsSync(filePath404)) {
        res.status(404).sendFile(filePath404);
    } else {
        res.status(404).send('Извините, страница не найдена!');
    }
});

// 500 error handler
app.use((err, _req, res, _next) => {
    console.error('Global error handler:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Ошибка сервера.',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));