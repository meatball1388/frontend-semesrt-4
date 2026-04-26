const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const path = require('path');
const app = express();

// Подключение к PostgreSQL
const sequelize = new Sequelize('mydatabase', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

// Проверка подключения
sequelize.authenticate()
  .then(() => console.log('Подключено к PostgreSQL'))
  .catch(err => console.error('Ошибка подключения:', err));

// Модель User
const User = sequelize.define('User', {
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'users',
  underscored: true,   // snake_case для колонок в БД
  createdAt: 'created_at', // Имя атрибута в JS/JSON тоже будет created_at
  updatedAt: 'updated_at',
});

// Синхронизация таблиц
sequelize.sync().then(() => console.log('Таблицы созданы'));

app.use(express.json());

// CREATE — создать пользователя
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ — получить всех пользователей
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ — получить пользователя по ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (false === user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE — обновить пользователя
app.patch('/api/users/:id', async (req, res) => {
  try {
    const [count, rows] = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (count === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
  try {
    const count = await User.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000');
});
