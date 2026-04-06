# Практические занятия №13 и №14

## Практика 13 — Service Worker

**Задание:** Разработать веб-приложение для управления списком дел (или заметок), которое использует Service Worker для обеспечения базового офлайн-функционала.

### Требования (выполнены):
- ✅ Пользователь может просматривать список задач/заметок
- ✅ Пользователь может добавлять новые задачи/заметки
- ✅ Данные сохраняются в localStorage
- ✅ Приложение регистрирует Service Worker и кэширует статические ресурсы
- ✅ При отсутствии сети страница загружается из кэша, интерфейс работоспособен

### Реализация:
- `index.html` — основная страница приложения
- `app.js` — логика работы с задачами и регистрация Service Worker
- `sw.js` — Service Worker с событиями `install`, `activate`, `fetch`

---

## Практика 14 — Web App Manifest

**Задание:** Доработать приложение из практики №13, добавив поддержку Web App Manifest.

### Требования (выполнены):
- ✅ Создан файл `manifest.json` с полями: name, short_name, description, start_url, display, icons, background_color, theme_color
- ✅ Подготовлен набор иконок разных размеров (8 штук: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
- ✅ Манифест подключён в HTML (`<link rel="manifest" href="/manifest.json">`)
- ✅ Добавлены мета-теги: apple-touch-icon, apple-mobile-web-app-status-bar-style, theme-color
- ✅ Service Worker обновлён для кэширования иконок и манифеста
- ✅ Приложение готово к установке на компьютер (PWA)

### Структура проекта:
```
practice13-14/
├── index.html          # Основная страница
├── app.js              # Логика приложения + регистрация SW
├── sw.js               # Service Worker
├── manifest.json       # Web App Manifest
├── icons/              # Иконки разных размеров
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── generate_icons.py   # Скрипт генерации иконок
└── README.md           # Документация
```

---

## Запуск приложения

### Вариант 1: Live Server (рекомендуется)
Service Worker работает только через HTTPS или localhost. Откройте `index.html` через Live Server в VS Code.

### Вариант 2: Python HTTP сервер
```bash
cd practice13-14
python -m http.server 8080
```
Затем откройте `http://localhost:8080`

### Проверка офлайн-работы:
1. Откройте приложение в браузере
2. Откройте DevTools → Application → Service Workers — проверьте, что SW активен
3. Отключите сеть (в DevTools: Network → Offline)
4. Обновите страницу — приложение должно загрузиться из кэша
5. Добавление задач должно работать офлайн

### Проверка установки PWA:
1. В Chrome появится иконка "Установить приложение" в адресной строке
2. Также можно проверить через DevTools → Application → Manifest
