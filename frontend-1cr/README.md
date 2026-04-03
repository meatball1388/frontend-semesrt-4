# Практические занятия: Фронтенд и бэкенд разработка

## 📁 Структура проекта

```
frontend-backend-control-work_1/
├── practice-1/          # SASS/LESS карточка товара
├── practice-2/          # Express CRUD API
├── practice-3/          # Postman + внешние API
├── practice-4/          # React + Express магазин
│   ├── client/          # React приложение
│   └── server/          # Express сервер
└── practice-5/          # Swagger документация
```

---

## 🔧 Практика 1: SASS карточка товара

**Задание:** Создать карточку товара с переменными, миксинами и вложенностью.

### Запуск:
```bash
cd practice-1
npm install
npm run compile:sass
```

Откройте `index.html` в браузере.

### Что реализовано:
- ✅ Переменные (цвета, размеры, шрифты)
- ✅ Миксины (shadow, button, center-flex)
- ✅ Вложенная структура селекторов
- ✅ Hover-эффекты

---

## 🔧 Практика 2: Express CRUD API

**Задание:** Реализовать CRUD API для товаров.

### Запуск:
```bash
cd practice-2
npm install
npm start
```

Сервер запустится на `http://localhost:3000`

### API Endpoints:
| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/products` | Получить все товары |
| GET | `/api/products/:id` | Получить товар по ID |
| POST | `/api/products` | Создать товар |
| PUT | `/api/products/:id` | Обновить (полное) |
| PATCH | `/api/products/:id` | Обновить (частичное) |
| DELETE | `/api/products/:id` | Удалить товар |

---

## 🔧 Практика 3: Postman + внешние API

**Задание:** Научиться тестировать API через Postman и работать с внешними API.

### 📥 Установка Postman

**Вариант 1: Desktop приложение**
1. Перейдите на https://www.postman.com/downloads/
2. Скачайте для Windows
3. Установите и запустите

**Вариант 2: Веб-версия**
- Откройте https://web.postman.co/

### 📤 Импорт коллекции
1. Откройте Postman
2. Нажмите **Import** (левая панель)
3. Выберите файл `practice-3/postman-collection.json`
4. Коллекция появится в списке

### 📝 Тестирование локального API:
1. Запустите сервер из practice-2
2. В Postman откройте коллекцию "Products API"
3. Выполняйте запросы по очереди

### 🌐 Внешние API для тестирования:

**1. OpenWeatherMap (Погода)**
- Получите ключ: https://openweathermap.org/api
- Запрос: `GET https://api.openweathermap.org/data/2.5/weather?q=Moscow&appid=ВАШ_КЛЮЧ&units=metric&lang=ru`

**2. Exchange Rates (Курсы валют)**
- Запрос: `GET https://api.exchangerate-api.com/v4/latest/RUB`

**3. JSONPlaceholder (Тестовые данные)**
- Запросы:
  - `GET https://jsonplaceholder.typicode.com/posts`
  - `GET https://jsonplaceholder.typicode.com/users`

### 📸 Задание для отчёта:
1. Выполните 5+ запросов к разным API
2. Сделайте скриншоты запросов и ответов
3. Сохраните в `practice-3/screenshots/`

---

## 🔧 Практика 4: React + Express магазин

**Задание:** Создать интернет-магазин с полным функционалом.

### Запуск сервера:
```bash
cd practice-4/server
npm install
npm start
```
Сервер: `http://localhost:3001`

### Запуск клиента:
```bash
cd practice-4/client
npm install
npm start
```
Клиент: `http://localhost:3000`

### Функционал:
- ✅ Просмотр всех товаров
- ✅ Добавление нового товара (модальное окно)
- ✅ Редактирование товара
- ✅ Удаление товара
- ✅ Рейтинг и количество на складе
- ✅ 12 товаров в каталоге

---

## 🔧 Практика 5: Swagger документация

**Задание:** Добавить Swagger документацию к API.

### Запуск:
```bash
cd practice-5
npm install
npm start
```

Сервер запустится на `http://localhost:3002`

### Swagger UI:
Откройте в браузере: **http://localhost:3002/api-docs**

### Возможности:
- 📖 Интерактивная документация всех endpoints
- 🧪 Кнопка "Try it out" для тестирования запросов
- 📊 Модели данных (User schema)
- 📝 JSDoc аннотации в коде

---

## 🎯 Контрольная работа (Практика 6)

Для контрольной работы используйте наработки из всех практик:
1. SASS стилизация
2. CRUD API на Express
3. Тестирование в Postman
4. React интерфейс
5. Swagger документация

---

## 📋 Требования для сдачи

Для каждой практики:
1. Загрузите код на GitHub
2. В README репозитория укажите ссылку на папку
3. Скриншоты для Practice 3 загрузите в СДО

## 🛠️ Общие команды

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev    # если есть nodemon
npm start      # обычный запуск

# Для React клиента
npm start      # запуск dev-сервера
npm build      # сборка для продакшена
```
