# Безопасность электронных услуг

React SPA-приложение с визуализацией безопасности сервисов в виде интерактивного щита и системой аутентификации.

## Технологии

- **React 18** + **Vite**
- **React Router DOM v6**
- **Axios**
- **CSS Modules** — тёмная тема + неоновые акценты
- **json-server** (локально) / **MockAPI** (продакшен)

## Структура проекта

```
src/
  components/
    Shield.jsx          — главная: SVG-диаграмма + навигация
    Detail.jsx          — детализация сервиса
    AddService.jsx      — форма добавления сервиса
    Events.jsx          — журнал событий безопасности
    Login.jsx           — страница входа
    Toast.jsx           — уведомления
    Signature.jsx       — авторский знак
  services/
    api.js              — axios-клиент с переменной окружения
  App.jsx               — роутинг + защита маршрутов
  main.jsx
```

## Функционал

| Функция | Страница | Метод API |
|---------|----------|-----------|
| Аутентификация | `/login` | GET `/users?email=...` |
| Список сервисов (диаграмма) | `/` | GET `/services` |
| Детализация сервиса | `/detail/:id` | GET `/services/:id` |
| Добавление сервиса | `/add` | POST `/services` |
| Повышение безопасности | `/detail/:id` | PUT `/services/:id` |
| Удаление сервиса | `/detail/:id` | DELETE `/services/:id` |
| Журнал событий | `/events` | GET `/events` |
| Удаление события | `/events` | DELETE `/events/:id` |

## Запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск json-server (терминал 1)

```bash
npx json-server --watch db.json --port 3001
```

### 3. Запуск React (терминал 2)

```bash
npm run dev
```

Откройте **http://localhost:5173** → попадёте на страницу входа.

### Демо-аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| `user@example.com` | `password123` | Пользователь |
| `admin@security.com` | `admin123` | Администратор |

## Переключение на MockAPI

В `.env` замените:

```env
VITE_API_URL=https://your-mockapi-url.com
```

## Деплой

```bash
npm run build
```

Папку `dist` залить на Netlify/Vercel.

## Выполненные пункты задания

- ✅ SPA на React 18 + Vite
- ✅ Роутинг: `/`, `/detail/:id`, `/add`, `/events`, `/login`
- ✅ RESTful API: GET / POST / PUT / DELETE
- ✅ Работа с JSON (db.json)
- ✅ Управление состоянием (React useState)
- ✅ Валидация форм
- ✅ Обработка ошибок
- ✅ Индикатор загрузки
- ✅ **Аутентификация (доп. баллы)**

## Автор

**Варвара Сапегина**, группа АБ-420, 2026
