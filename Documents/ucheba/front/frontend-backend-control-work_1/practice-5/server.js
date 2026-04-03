const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Swagger конфигурация
// ============================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Users API',
            version: '1.0.0',
            description: 'API для управления пользователями с Swagger документацией',
            contact: {
                name: 'Developer'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Локальный сервер'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'age'],
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Уникальный ID пользователя',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Имя пользователя',
                            example: 'Иван Иванов'
                        },
                        age: {
                            type: 'integer',
                            description: 'Возраст пользователя',
                            example: 25
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Сообщение об ошибке'
                        }
                    }
                }
            }
        }
    },
    apis: ['./server.js'] // Файлы с JSDoc комментариями
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// Данные
// ============================================
let users = [
    { id: 1, name: 'Иван Иванов', age: 25 },
    { id: 2, name: 'Петр Петров', age: 30 },
    { id: 3, name: 'Анна Сидорова', age: 28 }
];

// ============================================
// API маршруты с JSDoc аннотациями
// ============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список всех пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/api/users', (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Алексей Смирнов'
 *               age:
 *                 type: integer
 *                 example: 35
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/users', (req, res) => {
    const { name, age } = req.body;
    
    if (!name || !age) {
        return res.status(400).json({ error: 'Name and age are required' });
    }
    
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        age: Number(age)
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Полное обновление пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Иван Петров'
 *               age:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const { name, age } = req.body;
    
    users[index] = {
        id,
        name: name.trim(),
        age: Number(age)
    };
    
    res.json(users[index]);
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Частичное обновление пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Иван'
 *               age:
 *                 type: integer
 *                 example: 26
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.patch('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const { name, age } = req.body;
    
    if (name) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    
    res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь успешно удален
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    users = users.filter(u => u.id !== id);
    res.status(204).send();
});

// ============================================
// Запуск сервера
// ============================================
app.listen(PORT, () => {
    console.log(`📚 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📖 Swagger документация: http://localhost:${PORT}/api-docs`);
});
