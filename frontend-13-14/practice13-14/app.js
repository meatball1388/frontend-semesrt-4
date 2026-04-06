// Элементы DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');
const connectionStatus = document.getElementById('connection-status');
const swStatus = document.getElementById('sw-status');

// Загрузка задач из localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        taskList.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
        taskList.innerHTML = tasks.map((task, index) => `
            <li class="row" style="align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <div class="col" style="text-decoration: ${task.completed ? 'line-through' : 'none'}; opacity: ${task.completed ? '0.5' : '1'};">
                    <strong>${escapeHtml(task.text)}</strong>
                    <br><small class="text-muted">${new Date(task.createdAt).toLocaleString('ru-RU')}</small>
                </div>
                <div class="col-auto">
                    <button class="small outline" onclick="toggleTask(${index})" style="margin-right: 0.5rem;">
                        ${task.completed ? '↩' : '✓'}
                    </button>
                    <button class="small outline danger" onclick="deleteTask(${index})">✕</button>
                </div>
            </li>
        `).join('');
    }
    
    taskCount.textContent = tasks.length;
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Добавление задачи
function addTask(text) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Переключение статуса задачи
function toggleTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Удаление задачи
function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Очистка выполненных
clearCompletedBtn.addEventListener('click', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const filtered = tasks.filter(task => !task.completed);
    localStorage.setItem('tasks', JSON.stringify(filtered));
    loadTasks();
});

// Очистка всего
clearAllBtn.addEventListener('click', () => {
    if (confirm('Удалить все задачи?')) {
        localStorage.removeItem('tasks');
        loadTasks();
    }
});

// Обработка отправки формы
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text) {
        addTask(text);
        taskInput.value = '';
    }
});

// Отслеживание онлайн/офлайн статуса
window.addEventListener('online', () => {
    connectionStatus.textContent = 'Онлайн';
    connectionStatus.className = 'tag success';
});

window.addEventListener('offline', () => {
    connectionStatus.textContent = 'Офлайн';
    connectionStatus.className = 'tag warning';
});

// Начальная загрузка
loadTasks();

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker зарегистрирован:', registration.scope);
            swStatus.textContent = 'SW активен';
            swStatus.className = 'tag success';
            
            // Отслеживание обновлений SW
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    console.log('SW состояние:', newWorker.state);
                });
            });
        } catch (err) {
            console.error('Ошибка регистрации Service Worker:', err);
            swStatus.textContent = 'SW ошибка';
            swStatus.className = 'tag danger';
        }
    });
}
