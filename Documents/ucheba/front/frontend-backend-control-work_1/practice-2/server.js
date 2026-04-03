const express = require('express');

const app = express();
const PORT = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Начальные данные - список товаров
let products = [
    { id: 1, name: 'Ноутбук', category: 'Электроника', price: 75000, stock: 15, rating: 4.5 },
    { id: 2, name: 'Смартфон', category: 'Электроника', price: 35000, stock: 30, rating: 4.7 },
    { id: 3, name: 'Наушники', category: 'Электроника', price: 5000, stock: 50, rating: 4.3 },
    { id: 4, name: 'Клавиатура', category: 'Аксессуары', price: 3500, stock: 25, rating: 4.2 },
    { id: 5, name: 'Мышь', category: 'Аксессуары', price: 1500, stock: 40, rating: 4.4 },
    { id: 6, name: 'Монитор', category: 'Электроника', price: 25000, stock: 12, rating: 4.6 },
    { id: 7, name: 'Веб-камера', category: 'Аксессуары', price: 4000, stock: 20, rating: 4.1 },
    { id: 8, name: 'Колонки', category: 'Аудио', price: 8000, stock: 18, rating: 4.5 },
    { id: 9, name: 'Микрофон', category: 'Аудио', price: 6500, stock: 15, rating: 4.3 },
    { id: 10, name: 'USB-хаб', category: 'Аксессуары', price: 1200, stock: 35, rating: 4.0 }
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
    const { name, category, price, stock, rating } = req.body;
    
    // Валидация данных
    if (!name || !category || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Необходимо указать name, category, price и stock' });
    }
    
    const newProduct = {
        id: Date.now(),
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// UPDATE - Обновить товар по ID (полное обновление)
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, category, price, stock, rating } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Необходимо указать name, category, price и stock' });
    }
    
    products[productIndex] = {
        id,
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: rating ? Number(rating) : 0
    };
    
    res.json(products[productIndex]);
});

// UPDATE - Частичное обновление товара по ID
app.patch('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, category, price, stock, rating } = req.body;
    
    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    
    res.json(product);
});

// DELETE - Удалить товар по ID
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

// ============================================
// Запуск сервера
// ============================================
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/products       - Получить все товары`);
    console.log(`  GET    /api/products/:id   - Получить товар по ID`);
    console.log(`  POST   /api/products       - Создать товар`);
    console.log(`  PUT    /api/products/:id   - Обновить товар (полное)`);
    console.log(`  PATCH  /api/products/:id   - Обновить товар (частичное)`);
    console.log(`  DELETE /api/products/:id   - Удалить товар`);
});
