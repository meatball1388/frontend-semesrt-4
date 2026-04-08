// Socket.IO подключение
const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('Socket.IO connected! ID:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
});

// DOM элементы
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// Функция для преобразования VAPID ключа
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Функция подписки на push
async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BEK6OR5Nz884JphH8aoSO03bO1AhRR3F35A6fxq4GaGAoGz4rWVXEWa1LJ_XgkIbVwGYZ4khK3qOsNacBczR6-k')
        });
        await fetch('http://localhost:3001/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });
        console.log('Подписка на push отправлена');
    } catch (err) {
        console.error('Ошибка подписки на push:', err);
    }
}

// Функция отписки от push
async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await fetch('http://localhost:3001/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
            await subscription.unsubscribe();
            console.log('Отписка выполнена');
        }
    } catch (err) {
        console.error('Ошибка отписки:', err);
    }
}

// Обработчик события taskAdded от сервера
socket.on('taskAdded', (task) => {
    console.log('Задача от другого клиента:', task);
    const notification = document.createElement('div');
    notification.textContent = `Новая заметка: ${task.text}`;
    notification.style.cssText = `
        position: fixed; top: 10px; right: 10px; background: #4285f4; color: white; padding: 1rem; border-radius: 5px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
});

function setActiveButton(activeId) {
    [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
    try {
        const response = await fetch(`/content/${page}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;
        if (page === 'home') {
            initNotes();
        }
    } catch (err) {
        contentDiv.innerHTML = `<p class="is-center text-error">Ошибка загрузки страницы.</p>`;
        console.error(err);
    }
}

homeBtn.addEventListener('click', () => {
    setActiveButton('home-btn');
    loadContent('home');
});

aboutBtn.addEventListener('click', () => {
    setActiveButton('about-btn');
    loadContent('about');
});

// Загружаем главную страницу при старте
loadContent('home');

// Функционал заметок (localStorage)
function initNotes() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const list = document.getElementById('notes-list');

    // Элементы формы напоминаний
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');
    const showReminderBtn = document.getElementById('show-reminder-btn');

    // Показать/скрыть форму напоминаний
    if (showReminderBtn) {
        showReminderBtn.addEventListener('click', () => {
            const isHidden = reminderForm.style.display === 'none';
            reminderForm.style.display = isHidden ? 'block' : 'none';
            showReminderBtn.textContent = isHidden ? 'Скрыть напоминание' : 'Добавить с напоминанием';
        });
    }

    // Установка минимального времени
    function setMinReminderTime() {
        const now = new Date(Date.now() + 60000);
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        reminderTime.min = local.toISOString().slice(0, 16);
    }
    setMinReminderTime();

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        list.innerHTML = notes.map((note, i) => {
            let reminderInfo = '';
            if (note.reminder) {
                const date = new Date(note.reminder);
                reminderInfo = `<br><small style="color: #4285f4;">!!! Напоминание: ${date.toLocaleString()}</small>`;
            }
            return `<li class="card" style="margin-bottom: 0.5rem; padding: 0.5rem;">
                ${note.text}${reminderInfo}
                <div class="actions" style="margin-top: 0.5rem;">
                    <button class="button small" onclick="deleteNote(${i})">Удалить</button>
                </div>
            </li>`;
        }).join('');
    }

    function addNote(text, reminderTimestamp = null) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const newNote = { id: Date.now(), text, reminder: reminderTimestamp };
        notes.push(newNote);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();

        if (reminderTimestamp) {
            if (socket && socket.connected) {
                socket.emit('newReminder', {
                    id: newNote.id,
                    text: text,
                    reminderTime: reminderTimestamp
                });
                console.log('Напоминание отправлено на сервер, сработает через', Math.round((reminderTimestamp - Date.now()) / 1000), 'сек');
            } else {
                console.warn('Socket не подключён, напоминание сохранено локально');
            }
        } else {
            if (socket && socket.connected) {
                socket.emit('newTask', { text, timestamp: Date.now() });
            }
        }
    }

    // Обработка обычной заметки
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addNote(text);
            input.value = '';
        }
    });

    // Обработка заметки с напоминанием
    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = reminderText.value.trim();
        const datetime = reminderTime.value;
        if (text && datetime) {
            const timestamp = new Date(datetime).getTime();
            if (timestamp > Date.now()) {
                addNote(text, timestamp);
                reminderText.value = '';
                reminderTime.value = '';
                reminderForm.style.display = 'none';
                showReminderBtn.textContent = 'Добавить с напоминанием';
                // Визуальное подтверждение
                const msg = document.createElement('div');
                msg.className = 'card';
                msg.style.cssText = 'background: #4CAF50; color: white; text-align: center; margin-bottom: 1rem;';
                msg.textContent = `✓ Напоминание добавлено`;
                list.parentNode.insertBefore(msg, list);
                setTimeout(() => msg.remove(), 3000);
            } else {
                alert('Дата напоминания должна быть в будущем');
            }
        }
    });

    loadNotes();
}

// Глобальная функция для удаления заметок
function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    const list = document.getElementById('notes-list');
    const notes2 = JSON.parse(localStorage.getItem('notes') || '[]');
    list.innerHTML = notes2.map((note, i) => {
        let reminderInfo = '';
        if (note.reminder) {
            const date = new Date(note.reminder);
            reminderInfo = `<br><small style="color: #4285f4;">!!! Напоминание: ${date.toLocaleString()}</small>`;
        }
        return `<li class="card" style="margin-bottom: 0.5rem; padding: 0.5rem;">
            ${note.text}${reminderInfo}
            <div class="actions" style="margin-top: 0.5rem;">
                <button class="button small" onclick="deleteNote(${i})">Удалить</button>
            </div>
        </li>`;
    }).join('');
}

// Регистрация Service Worker и настройка push-уведомлений
async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Workers не поддерживаются');
        return;
    }

    const enableBtn = document.getElementById('enable-push');
    const disableBtn = document.getElementById('disable-push');

    if (!enableBtn || !disableBtn) {
        console.error('Кнопки push не найдены');
        return;
    }

    try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', reg.scope);

        const subscription = await reg.pushManager.getSubscription();
        console.log('Subscription:', subscription ? 'active' : 'none');

        if (subscription) {
            enableBtn.style.display = 'none';
            disableBtn.style.display = 'inline-block';
        }

        enableBtn.onclick = async () => {
            console.log('=== enable-push clicked ===');
            if (Notification.permission === 'denied') {
                alert('Уведомления запрещены. Разрешите в настройках.');
                return;
            }
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                    alert('Нужно разрешить уведомления.');
                    return;
                }
            }
            console.log('Calling subscribeToPush...');
            await subscribeToPush();
            enableBtn.style.display = 'none';
            disableBtn.style.display = 'inline-block';
            console.log('=== done ===');
        };

        disableBtn.onclick = async () => {
            console.log('=== disable-push clicked ===');
            await unsubscribeFromPush();
            disableBtn.style.display = 'none';
            enableBtn.style.display = 'inline-block';
            console.log('=== done ===');
        };

    } catch (err) {
        console.error('SW registration failed:', err);
    }
}

initServiceWorker();
