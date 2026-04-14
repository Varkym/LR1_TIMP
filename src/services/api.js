import axios from 'axios';
import { USERS, EVENTS } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'https://69d8ec0e0576c938825a42bb.mockapi.io/api';

const api = axios.create({ baseURL: API_URL });

// Services (Using standard REST on /api endpoint)
export const getServices = () => api.get('').then(res => res);
export const getService = (id) => api.get(`/${id}`).then(res => res);
export const createService = (newData) => api.post('', newData).then(res => res);
export const updateService = (id, updatedData) => api.put(`/${id}`, updatedData).then(res => res);
export const deleteService = (id) => api.delete(`/${id}`).then(res => res);

// Users (Using local mock data to stay within free tier limits)
export const getUsers = () => Promise.resolve({ data: USERS });
export const findUserByEmail = (email) => Promise.resolve({
    data: USERS.filter(u => u.email === email)
});
export const createUser = (userData) => {
    const newUser = { ...userData, id: String(USERS.length + 1) };
    USERS.push(newUser);
    return Promise.resolve({ data: newUser });
};
export const updateUser = (id, userData) => {
    const index = USERS.findIndex(u => String(u.id) === String(id));
    if (index !== -1) {
        USERS[index] = { ...USERS[index], ...userData };
        return Promise.resolve({ data: USERS[index] });
    }
    return Promise.reject(new Error('User not found'));
};

// Events (Using local mock data)
export const getEvents = () => Promise.resolve({ data: EVENTS });
export const getEvent = (id) => Promise.resolve({
    data: EVENTS.find(e => String(e.id) === String(id))
});
export const createEvent = (eventData) => {
    const newEvent = { ...eventData, id: String(EVENTS.length + 1) };
    EVENTS.push(newEvent);
    return Promise.resolve({ data: newEvent });
};
export const updateEvent = (id, eventData) => {
    const index = EVENTS.findIndex(e => String(e.id) === String(id));
    if (index !== -1) {
        EVENTS[index] = { ...EVENTS[index], ...eventData };
        return Promise.resolve({ data: EVENTS[index] });
    }
    return Promise.reject(new Error('Event not found'));
};
export const deleteEvent = (id) => {
    const index = EVENTS.findIndex(e => String(e.id) === String(id));
    if (index !== -1) {
        EVENTS.splice(index, 1);
        return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Event not found'));
};

export default api;
