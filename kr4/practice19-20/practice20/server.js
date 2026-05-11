const mongoose = require('mongoose');
const express = require('express');
const path = require('path');

const app = express();


mongoose.connect('mongodb://localhost:27017/practice20')
  .then(() => console.log('Подключено к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));


const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  age: { type: Number, required: true },
}, {

  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
);


const User = mongoose.model('User', userSchema);

app.use(express.json());

// API: Создать (POST)
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch('/api/users/:id', async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Не найден' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Не найден' });
    res.json({ message: 'Удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(3001, () => {
  console.log('🚀 Сервер (MongoDB): http://localhost:3001');
});
