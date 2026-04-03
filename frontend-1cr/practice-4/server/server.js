const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Разрешаем CORS для React-приложения
app.use(express.json());

// Начальные данные - товары интернет-магазина
let products = [
    { id: 1, name: 'ASUS ROG Laptop', category: 'Laptops', price: 75000, stock: 15, rating: 4.5, image: '/img/asus_laptop.jpeg' },
    { id: 2, name: 'MacBook Pro 16', category: 'Laptops', price: 150000, stock: 8, rating: 4.9, image: '/img/macbook_pro.jpeg' },
    { id: 3, name: 'iPhone 15 Pro', category: 'Smartphones', price: 90000, stock: 25, rating: 4.8, image: '/img/iphone_15.jpeg' },
    { id: 4, name: 'Samsung S24 Ultra', category: 'Smartphones', price: 85000, stock: 20, rating: 4.7, image: '/img/samsung_galaxy_s24.jpeg' },
    { id: 5, name: 'Sony WH-1000XM5', category: 'Headphones', price: 35000, stock: 30, rating: 4.8, image: '/img/sony_wh-1000xm5.jpeg' },
    { id: 6, name: 'AirPods Pro 2', category: 'Headphones', price: 25000, stock: 40, rating: 4.6, image: '/img/airpods_pro.jpg' },
    { id: 7, name: 'iPad Air M2', category: 'Tablets', price: 55000, stock: 18, rating: 4.7, image: '/img/ipad_air.jpeg' },
    { id: 8, name: 'Galaxy Tab S9', category: 'Tablets', price: 50000, stock: 15, rating: 4.5, image: '/img/samsung_tab_s9.jpeg' },
    { id: 9, name: 'Logitech MX Master', category: 'Accessories', price: 12000, stock: 50, rating: 4.8, image: '/img/logitech_mx_master3.jpeg' },
    { id: 10, name: 'Mechanical Keyboard', category: 'Accessories', price: 15000, stock: 35, rating: 4.6, image: '/img/keychron_k2.jpeg' },
    { id: 11, name: 'LG 34" Monitor', category: 'Monitors', price: 35000, stock: 12, rating: 4.5, image: '/img/lg_monitor.jpg' },
    { id: 12, name: 'Dell 4K Display', category: 'Monitors', price: 55000, stock: 10, rating: 4.7, image: '/img/dell_monitor.jpeg' }
];

// ============================================
// CRUD операции для товаров
// ============================================

// READ - Получить все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// READ - Получить товар по ID
app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
});

// CREATE - Создать новый товар
app.post('/api/products', (req, res) => {
    const { name, category, price, stock, rating, image } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Необходимо указать name, category, price и stock' });
    }
    
    const newProduct = {
        id: Date.now(),
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0,
        image: image || '/img/asus_laptop.jpeg'
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// UPDATE - Полное обновление товара
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, category, price, stock, rating, image } = req.body;
    
    products[index] = {
        id,
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0,
        image: image || '/img/asus_laptop.jpeg'
    };
    
    res.json(products[index]);
});

// UPDATE - Частичное обновление товара
app.patch('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, category, price, stock, rating, image } = req.body;
    
    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    if (image) product.image = image;
    
    res.json(product);
});

// DELETE - Удалить товар
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🛒 Сервер магазина запущен на http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/products       - Все товары`);
    console.log(`  GET    /api/products/:id   - Товар по ID`);
    console.log(`  POST   /api/products       - Создать товар`);
    console.log(`  PUT    /api/products/:id   - Обновить (полное)`);
    console.log(`  PATCH  /api/products/:id   - Обновить (частичное)`);
    console.log(`  DELETE /api/products/:id   - Удалить товар`);
});
