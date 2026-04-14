export const USERS = [
    {
        id: "1",
        email: "user@example.com",
        password: "password123",
        name: "Сапегина Варвара",
        role: "Пользователь",
        isBlocked: 0
    },
    {
        id: "2",
        email: "admin@security.com",
        password: "admin123",
        name: "Медведев Михаил",
        role: "Администратор",
        isBlocked: 0
    },
    {
        id: "3",
        email: "ksi@mail.ru",
        password: "1234",
        name: "Ксения",
        role: "Пользователь",
        isBlocked: 1
    }
];

export const EVENTS = [
    {
        id: "1",
        date: "15.03.2026",
        userId: 1,
        serviceId: 1,
        eventType: "login_attempt",
        description: "Успешный вход с IP 192.168.1.1",
        status: "Успех"
    },
    {
        id: "2",
        date: "14.03.2026",
        userId: 1,
        serviceId: 2,
        eventType: "failed_login",
        description: "Неверный пароль с IP 185.130.5.253",
        status: "Отказ"
    },
    {
        id: "3",
        date: "14.03.2026",
        userId: 1,
        serviceId: 3,
        eventType: "suspicious_activity",
        description: "Подозрительный вход с нового устройства",
        status: "Предупреждение"
    },
    {
        id: "4",
        date: "13.03.2026",
        userId: 2,
        serviceId: 4,
        eventType: "login_attempt",
        description: "Вход через корпоративную сеть",
        status: "Успех"
    },
    {
        id: "5",
        date: "12.03.2026",
        userId: 1,
        serviceId: 5,
        eventType: "suspicious_activity",
        description: "Множественные запросы с одного IP",
        status: "Предупреждение"
    }
];
