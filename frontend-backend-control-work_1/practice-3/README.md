# Практика 3: Работа с Postman и внешними API

## 1. Установка Postman

### Вариант 1: Desktop-приложение (рекомендуется)
1. Перейдите на сайт [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Нажмите **Download for Windows**
3. Запустите скачанный установщик
4. После установки запустите Postman
5. Войдите в аккаунт или создайте новый (можно пропустить, нажав "Skip and go to the app")

### Вариант 2: Веб-версия
1. Перейдите на [https://web.postman.co/](https://web.postman.co/)
2. Войдите в аккаунт Google/GitHub или создайте новый

---

## 2. Тестирование локального API (из Практики 2)

### Шаг 1: Запустите сервер
```bash
cd practice-2
npm install
npm start
```

### Шаг 2: Создайте коллекцию в Postman
1. Нажмите **+** рядом с "Collections" в левой панели
2. Назовите коллекцию "Products API"

### Шаг 3: Создайте запросы

#### GET - Получить все товары
1. Нажмите **New Request** в коллекции
2. Метод: **GET**
3. URL: `http://localhost:3000/api/products`
4. Нажмите **Send**
5. Ожидаемый ответ: список из 10 товаров

#### GET - Получить товар по ID
1. Новый запрос
2. Метод: **GET**
3. URL: `http://localhost:3000/api/products/1`
4. Нажмите **Send**
5. Ожидаемый ответ: товар с id=1

#### POST - Создать товар
1. Новый запрос
2. Метод: **POST**
3. URL: `http://localhost:3000/api/products`
4. Перейдите на вкладку **Body**
5. Выберите **raw** и **JSON**
6. Введите:
```json
{
    "name": "Планшет",
    "category": "Электроника",
    "price": 25000,
    "stock": 20,
    "rating": 4.5
}
```
7. Нажмите **Send**

#### PUT/PATCH - Обновить товар
1. Метод: **PUT** или **PATCH**
2. URL: `http://localhost:3000/api/products/1`
3. Body (JSON):
```json
{
    "name": "Ноутбук Pro",
    "price": 85000
}
```

#### DELETE - Удалить товар
1. Метод: **DELETE**
2. URL: `http://localhost:3000/api/products/1`
3. Нажмите **Send**

---

## 3. Работа с внешними API

### API 1: Open Weather Map (Погода)

#### Получение ключа API:
1. Перейдите на [https://openweathermap.org/api](https://openweathermap.org/api)
2. Нажмите **Sign Up** и зарегистрируйтесь
3. Перейдите в раздел **API keys**
4. Скопируйте ваш ключ

#### Запрос погоды:
1. Метод: **GET**
2. URL: `https://api.openweathermap.org/data/2.5/weather?q=Moscow&appid=ВАШ_КЛЮЧ&units=metric&lang=ru`
3. Нажмите **Send**

#### Пример ответа:
```json
{
    "coord": {"lon": 37.6156, "lat": 55.7522},
    "weather": [{"description": "ясно"}],
    "main": {"temp": 20, "feels_like": 18},
    "name": "Moscow"
}
```

---

### API 2: Exchange Rates API (Курсы валют)

#### Бесплатный API (без ключа):
1. Метод: **GET**
2. URL: `https://api.exchangerate-api.com/v4/latest/RUB`
3. Нажмите **Send**

#### Пример ответа:
```json
{
    "base": "RUB",
    "rates": {
        "USD": 0.011,
        "EUR": 0.010,
        "CNY": 0.078
    }
}
```

---

### API 3: JSONPlaceholder (Тестовые данные)

#### Запросы:
```
GET https://jsonplaceholder.typicode.com/posts
GET https://jsonplaceholder.typicode.com/users
GET https://jsonplaceholder.typicode.com/comments?postId=1
```

---

## 4. Задание для выполнения

1. Выберите любой открытый API из списка:
   - [Open API Collection](https://github.com/public-apis/public-apis)
   - [RapidAPI](https://rapidapi.com/hub)

2. Получите API ключ (если требуется)

3. Выполните минимум 5 запросов:
   - Сохраните скриншоты каждого запроса и ответа
   - Создайте коллекцию в Postman с вашими запросами
   - Экспортируйте коллекцию (три точки → Export → JSON)

4. Сохраните скриншоты в папку `practice-3/screenshots/`

---

## 5. Полезные возможности Postman

- **Environment Variables**: Храните ключи API в переменных окружения
- **Pre-request Scripts**: Выполняйте код перед запросом
- **Tests**: Автоматически проверяйте ответы API
- **Collections**: Группируйте запросы по темам
