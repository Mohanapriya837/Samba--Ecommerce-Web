import api from './client';

export const getMe = () => api.get('/users/me').then((r) => r.data);
export const updateMe = (payload) => api.put('/users/me', payload).then((r) => r.data);
export const changePassword = (payload) => api.put('/users/me/password', payload).then((r) => r.data);
