import axios from 'axios';

// Используем базовый URL без /api в конце, чтобы обращаться к /api/1
const API_URL = (import.meta.env.VITE_API_URL || 'https://69d8ec0e0576c938825a42bb.mockapi.io/api').replace(/\/api$/, '');

const api = axios.create({ baseURL: API_URL });

// Хелперы для работы с единым объектом данных
// Получаем первый элемент из коллекции 'api'
const getFullData = () => api.get('/api').then(res => {
    if (!res.data || res.data.length === 0) {
        throw new Error('Данные в MockAPI не найдены');
    }
    const item = res.data[0];
    // Если MockAPI почему-то не вернул id, пробуем использовать "1" как стандартный ID первого ресурса
    if (!item.id) {
        console.warn('Предупреждение: у объекта в MockAPI нет ID, используем "1" по умолчанию');
        item.id = "1";
    }
    return item;
});

const updateFullData = (data) => {
    const id = data.id || "1";
    return api.put(`/api/${id}`, data).catch(err => {
        console.error('Ошибка при обновлении данных на сервере:', err);
        throw err;
    });
};

// Services
export const getServices = () => getFullData().then(data => ({ data: data.services }));
export const getService = (id) => getFullData().then(data => ({ data: data.services.find(s => String(s.id) === String(id)) }));
export const createService = async (newData) => {
    const data = await getFullData();
    data.services.push(newData);
    return updateFullData(data);
};
export const updateService = async (id, updatedData) => {
    const data = await getFullData();
    data.services = data.services.map(s => String(s.id) === String(id) ? { ...s, ...updatedData } : s);
    return updateFullData(data);
};
export const deleteService = async (id) => {
    const data = await getFullData();
    data.services = data.services.filter(s => String(s.id) !== String(id));
    return updateFullData(data);
};

// Users
export const getUsers = () => getFullData().then(data => ({ data: data.users }));
export const findUserByEmail = (email) => getFullData().then(data => ({
    data: data.users.filter(u => u.email === email)
}));
export const createUser = async (userData) => {
    const data = await getFullData();
    data.users.push(userData);
    return updateFullData(data);
};
export const updateUser = async (id, userData) => {
    const data = await getFullData();
    data.users = data.users.map(u => String(u.id) === String(id) ? { ...u, ...userData } : u);
    return updateFullData(data);
};

// Events
export const getEvents = () => getFullData().then(data => ({ data: data.events }));
export const getEvent = (id) => getFullData().then(data => ({ data: data.events.find(e => String(e.id) === String(id)) }));
export const createEvent = async (eventData) => {
    const data = await getFullData();
    data.events.push(eventData);
    return updateFullData(data);
};
export const updateEvent = async (id, eventData) => {
    const data = await getFullData();
    data.events = data.events.map(e => String(e.id) === String(id) ? { ...e, ...eventData } : e);
    return updateFullData(data);
};
export const deleteEvent = async (id) => {
    const data = await getFullData();
    data.events = data.events.filter(e => String(e.id) !== String(id));
    return updateFullData(data);
};

export default api;
