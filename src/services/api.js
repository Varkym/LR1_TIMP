import axios from 'axios';

// Определяем, где запущено приложение
const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Локально (для препода) используем json-server, в интернете (для деплоя) - MockAPI
const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://69d8ec0e0576c938825a42bb.mockapi.io/api';

const api = axios.create({ baseURL: API_URL });

// Хелпер для путей: в json-server у нас будут /services, /users, /events
// В MockAPI (бесплатном) мы пока используем одну общую ручку для сервисов,
// но для препода локально сделаем все по фэншую.
const getPath = (resource) => isLocal ? `/${resource}` : '';

// Services
export const getServices = () => api.get(getPath('services')).then(res => res);
export const getService = (id) => api.get(`${getPath('services')}/${id}`).then(res => res);
export const createService = (newData) => api.post(getPath('services'), newData).then(res => res);
export const updateService = (id, updatedData) => api.put(`${getPath('services')}/${id}`, updatedData).then(res => res);
export const deleteService = (id) => api.delete(`${getPath('services')}/${id}`).then(res => res);

// Users
export const getUsers = () => api.get(getPath('users')).then(res => res);
export const findUserByEmail = (email) => {
    const path = isLocal ? `/users?email=${email}` : `?email=${email}`;
    return api.get(path).then(res => res);
};
export const createUser = (userData) => api.post(getPath('users'), userData).then(res => res);
export const updateUser = (id, userData) => api.put(`${getPath('users')}/${id}`, userData).then(res => res);

// Events
export const getEvents = () => api.get(getPath('events')).then(res => res);
export const getEvent = (id) => api.get(`${getPath('events')}/${id}`).then(res => res);
export const createEvent = (eventData) => api.post(getPath('events'), eventData).then(res => res);
export const updateEvent = (id, eventData) => api.put(`${getPath('events')}/${id}`, eventData).then(res => res);
export const deleteEvent = (id) => api.delete(`${getPath('events')}/${id}`).then(res => res);

export default api;
