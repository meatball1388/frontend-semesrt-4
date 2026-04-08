const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const vapidKeys = {
    publicKey: 'BEK6OR5Nz884JphH8aoSO03bO1AhRR3F35A6fxq4GaGAoGz4rWVXEWa1LJ_XgkIbVwGYZ4khK3qOsNacBczR6-k',
    privateKey: 'qCUO27r8GLwASUG2BGEE30r7U5DzrFlTIQVUSQYRVNs'
};
webpush.setVapidDetails(
    'mailto:notes@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// Хранилище подписок
let subscriptions = [];

// Хранилище активных напоминаний
const reminders = new Map();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('Клиент подключён:', socket.id);

    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);

        const payload = JSON.stringify({
            title: 'Новая заметка',
            body: task.text
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                } else {
                    console.error('Push error:', err);
                }
            });
        });
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        if (delay <= 0) return;

        console.log(`Запланировано напоминание #${id} через ${Math.round(delay / 1000 / 60)} мин`);
        console.log(`Активных push-подписок: ${subscriptions.length}`);

        const timeoutId = setTimeout(() => {
            console.log(`Таймер напоминания #${id} сработал!`);
            const payload = JSON.stringify({
                title: '!!! Напоминание',
                body: text,
                reminderId: id
            });

            if (subscriptions.length === 0) {
                console.log('Нет push-подписок! Нажмите "Включить уведомления"');
            }

            subscriptions.forEach((sub, i) => {
                console.log(`Отправляю push #${i + 1}: ${sub.endpoint.substring(0, 50)}...`);
                webpush.sendNotification(sub, payload).catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                        console.log('Подписка удалена (отозвана)');
                    } else {
                        console.error('Push error:', err.statusCode, err.body ? err.body.substring(0, 200) : err.message);
                    }
                });
            });

            io.emit('taskAdded', { text, timestamp: Date.now() });
            reminders.delete(id);
            console.log(`Напоминание #${id} отправлено и удалено`);
        }, delay);

        reminders.set(id, { timeoutId, text, reminderTime });
    });

    socket.on('disconnect', () => {
        console.log('Клиент отключён:', socket.id);
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('Новая подписка сохранена. Всего подписок:', subscriptions.length);
    res.status(201).json({ message: 'Подписка сохранена' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    const before = subscriptions.length;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    console.log('Подписка удалена. Было:', before, 'Стало:', subscriptions.length);
    res.status(200).json({ message: 'Подписка удалена' });
});

app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);
    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(404).json({ error: 'Reminder not found' });
    }

    const reminder = reminders.get(reminderId);
    clearTimeout(reminder.timeoutId);

    const newDelay = 5 * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({
            title: 'Напоминание отложено',
            body: reminder.text,
            reminderId: reminderId
        });
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
                } else {
                    console.error('Push error:', err);
                }
            });
        });
        reminders.delete(reminderId);
        console.log(`Напоминание #${reminderId} отложено и отправлено`);
    }, newDelay);

    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + newDelay
    });

    res.status(200).json({ message: 'Reminder snoozed for 5 minutes' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
